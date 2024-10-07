import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosInstance } from 'axios';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { getAccessGroup } from '../utility/indexed-db.ts';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "../../public/styles/add-contract.css";
import { getCompanyDetailsById } from '../utility/auth';

interface PropertyDefinition {
    type: string;
    title: string;
    description: string;
    readOnly?: boolean;
    app?: string;
    default?: any;
    enums?: string[];
    minimum?: number;
    maximum?: number;
    segment?: string;
}

interface TemplateData {
    type: string;
    title: string;
    description: string;
    properties: {
        [key: string]: PropertyDefinition;
    };
}

const AddContractPage: React.FC = () => {
    const router = useRouter();
    const [templateData, setTemplateData] = useState<TemplateData | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({
        asset_type: 'laserCutter'  
    });
    const [assetPropertiesOptions, setAssetPropertiesOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedAssetProperties, setSelectedAssetProperties] = useState<string[]>([]);
    const toast = useRef<Toast>(null);
    const [axiosInstance, setAxiosInstance] = useState<AxiosInstance | null>(null);
    const [certificateExpiry, setCertificateExpiry] = useState<Date | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userData = await getAccessGroup();
            if (userData && userData.jwt_token) {
                const instance = axios.create({
                    baseURL: process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL,
                    headers: {
                        'Authorization': `Bearer ${userData.jwt_token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setAxiosInstance(instance);

                // Fetch template data (from backend)
                const templateResponse = await instance.get('/templates/template-name?name=predictiveMaintenance_laserCutter');
                const template = templateResponse.data[0];
                setTemplateData(template);
                initializeFormData(template.properties);

                setFormData(prevState => ({
                    ...prevState,
                    data_consumer_company_ifric_id: userData.company_ifric_id,
                }));

                // Fetch company certificate
                const companyCertResponse = await instance.get(`/certificate/get-company-certificates/${userData.company_ifric_id}`);
                console.log("companyCertResponse",companyCertResponse)
                    if (companyCertResponse.data && companyCertResponse.data.length > 0) {
                        const companyCert = companyCertResponse.data[0];
                        setFormData(prevState => ({
                            ...prevState,
                            consumer_company_certificate_data: companyCert.certificate_data
                        }));
                   
                        setCertificateExpiry(new Date(companyCert.expiry_on));
                }

                // Fetch asset properties (from MongoDB, sandbox backend)
                const assetTypeBase64 = btoa(`https://industry-fusion.org/base/v0.1/${formData.asset_type}`);
                const assetPropertiesResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_TEMPLATE_SANDBOX_BACKEND_URL}/templates/mongo-templates/type/${assetTypeBase64}`
                );
                const mongoProperties = assetPropertiesResponse.data.properties;

                // Filter only the properties with segment "realtime"
                const realtimeProps = Object.keys(mongoProperties)
                    .filter((key) => mongoProperties[key].segment === "realtime")
                    .map((key) => ({
                        label: mongoProperties[key].title,
                        value: key
                    }));

                // Setting options from MongoDB
                setAssetPropertiesOptions(realtimeProps);

                // Fetch consumer company name
                if (userData.company_ifric_id) {
                    await fetchConsumerCompanyName(userData.company_ifric_id);
                }

            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'User data or JWT not found' });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load necessary data' });
        }
    };

    const initializeFormData = (properties: { [key: string]: PropertyDefinition }) => {
        const initialData: { [key: string]: any } = {
            asset_type: 'laserCutter'
        };
        Object.entries(properties).forEach(([key, property]) => {
            if (property.app === 'creator') {
                if (property.default !== undefined) {
                    initialData[key] = property.default;
                } else if (property.type === 'array') {
                    initialData[key] = [];
                } else if (property.type === 'string') {
                    initialData[key] = '';
                } else if (property.type === 'number') {
                    initialData[key] = 0;
                } else if (property.type === 'date') {
                    initialData[key] = null;
                }
            }
        });
        setFormData(initialData);
    };

    const formatLabel = (title: string): string => {
        return title
            .split('_')
            .map(word => {
                if (word.toLowerCase() === 'ifric') {
                    return 'IFRIC';
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { value: any }, field: string) => {
        const value = 'target' in e ? e.target.value : e.value;

        if (field === 'interval') {
            if (value === '' || !isNaN(parseInt(value, 10))) {
                if (value >= templateData?.properties[field]?.minimum && value <= templateData?.properties[field]?.maximum) {
                    setFormData({ ...formData, [field]: value });
                } else {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: `Value must be between ${templateData?.properties[field]?.minimum} and ${templateData?.properties[field]?.maximum}.`
                    });
                }
            }
            return;
        }

        setFormData({ ...formData, [field]: value });
    };

    const renderField = (key: string, property: PropertyDefinition) => {
        if (key === 'contract_ifric_id') {
            return null;
        }
        const label = formatLabel(key);

        if (key === 'asset_properties') {
            return (
                <div className="field half-width-field" key={key}>
                    <label htmlFor={key} className="required-field">
                        {label}
                    </label>
                    <MultiSelect
                        id={key}
                        value={selectedAssetProperties}
                        options={assetPropertiesOptions}
                        onChange={(e) => setSelectedAssetProperties(e.value)}
                        optionLabel="label"
                        filter
                        required
                    />
                </div>
            );
        }

        if (key === 'consumer_company_certificate_data') {
            return renderMaskedField(label, formData[key], key);
        }

        if (property.app !== 'creator') {
            return null;
        }

        switch (property.type) {
            case 'string':
                return (
                    <div className="field half-width-field" key={key}>
                        <label htmlFor={key} className="required-field">{label}</label>
                        <InputText
                            id={key}
                            value={formData[key] ?? ''}
                            onChange={(e) => handleInputChange(e, key)}
                            required
                        />
                    </div>
                );
            case 'number':
                return (
                    <div className="field half-width-field" key={key}>
                        <label htmlFor={key} className="required-field">{label}</label>
                        <InputText
                            id={key}
                            type="number"
                            value={formData[key]}
                            onChange={(e) => handleInputChange(e, key)}
                            required
                        />
                    </div>
                );
            case 'date':
                return (
                    <div className="field half-width-field" key={key}>
                        <label htmlFor={key} className="required-field">{label}</label>
                        <Calendar
                            id={key}
                            value={formData[key]}
                            onChange={(e) => handleInputChange(e, key)}
                            showIcon
                            required
                            maxDate={certificateExpiry ? new Date(certificateExpiry.getTime() - 24 * 60 * 60 * 1000) : undefined}
                        />
                        {certificateExpiry && (
                            <small className="p-error">
                                Contract end date must be before {new Date(certificateExpiry.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </small>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderMaskedField = (label: string, value: string | null, key: string) => (
        <div className="field half-width-field" key={key}>
            <label>{label}</label>
            {value ? (
                <InputText
                    value="************************"
                    readOnly
                    className="masked-input"
                />
            ) : (
                <div className="no-certificate-message">No data found</div>
            )}
        </div>
    );

    const fetchConsumerCompanyName = async (companyId: string) => {
        try {
            const response = await getCompanyDetailsById(companyId);
            if (response?.data) {
                setFormData(prevState => ({
                    ...prevState,
                    consumer_company_name: response.data[0].company_name
                }));
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch company details' });
        }
    };

    const renderContractClauses = () => {
        const clauses = templateData?.properties.contract_clauses.enums || [];
        return (
            <Card title="Contract Clauses">
                <ul>
                    {clauses.map((clause: string, index: number) => {
                        const parts = clause.split('[consumer]');
                        return (
                            <li key={`clause-${index}`}>
                                {parts.map((part, partIndex) => (
                                    <React.Fragment key={`part-${index}-${partIndex}`}>
                                        {part}
                                        {partIndex < parts.length - 1 && (
                                            <strong>{formData.consumer_company_name || 'Company Name Not Available'}</strong>
                                        )}
                                    </React.Fragment>
                                ))}
                            </li>
                        );
                    })}
                </ul>
            </Card>
        );
    };

    const renderSelectedAssetProperties = () => (
        <Card title="Selected Asset Properties">
            <ul>
                {selectedAssetProperties.map((property, index) => (
                    <li key={`property-${index}`}>{property}</li>
                ))}
            </ul>
        </Card>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (axiosInstance) {
                const response = await axiosInstance.post('/mistura-backend-endpoint', formData);
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Contract added successfully' });
            } else {
                throw new Error('Axios instance not initialized');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to add contract' });
        }
    };

    const renderAssetTypeList = () => {
        const assetTypes = ['Laser Cutter'];
        return (
            <div className="asset-type-list">
                <h2>Asset Types</h2>
                <ul>
                    {assetTypes.map((assetType, index) => (
                        <li key={`assetType-${index}`}>
                            <Button
                                label={assetType}
                                onClick={() => handleAssetTypeClick(assetType)}
                                className={formData.asset_type === assetType ? 'p-button-primary' : 'p-button-outlined'}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    
    const handleAssetTypeClick = (assetType: string) => {
        setFormData((prevState) => ({
            ...prevState,
            asset_type: assetType,
        }));
    };

    if (!templateData) return <div>Loading...</div>;

    return (
        <div className="create-contract-form-container">
            <Toast ref={toast} />
            <div className="asset-type-list">
                {renderAssetTypeList()}
            </div>
            <div className="form-container">
                <h1 className="template-form-heading">{templateData?.title}</h1>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="form-grid">
                            {Object.entries(templateData?.properties || {})
                                .filter(([key]) => key !== 'contract_ifric_id')
                                .map(([key, property]) => renderField(key, property))}
                        </div>
                    </Card>

                    {renderContractClauses()}

                    {renderSelectedAssetProperties()}

                    <div className="form-btn-container">
                        <Button
                            type="button"
                            label="Cancel"
                            className="p-button-danger p-button-outlined custom-cancel-btn"
                            onClick={() => router.back()}
                            icon="pi pi-times"
                        />
                        <Button
                            type="reset"
                            label="Reset"
                            className="p-button-secondary p-button-outlined custom-reset-btn"
                            icon="pi pi-refresh"
                        />
                        <Button
                            type="submit"
                            label="Add Contract"
                            className="p-button-primary custom-add-btn"
                            icon="pi pi-check"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContractPage;