import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosInstance } from 'axios';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import Image from 'next/image.js';
import { Toast } from 'primereact/toast';
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
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
        asset_type: 'laserCutter',
        contract_title: 'Contract Title'
    });
    const [assetPropertiesOptions, setAssetPropertiesOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedAssetProperties, setSelectedAssetProperties] = useState<string[]>([]);
    const toast = useRef<Toast>(null);
    const [axiosInstance, setAxiosInstance] = useState<AxiosInstance | null>(null);
    const [certificateExpiry, setCertificateExpiry] = useState<Date | null>(null);
    const [editTitle, setEditTitle] = useState<Boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
                console.log(template);
                setTemplateData(template);
                initializeFormData(template.properties);

                setFormData(prevState => ({
                    ...prevState,
                    data_consumer_company_ifric_id: userData.company_ifric_id,
                }));

                // Fetch company certificate
                const companyCertResponse = await instance.get(`/certificate/get-company-certificates/${userData.company_ifric_id}`);
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
            asset_type: 'laserCutter',
            contract_title : 'Contract Title',
            contract_start_date: new Date,
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { value: any }, field: string) => {
        const value = 'target' in e ? e.target.value : e.value;

        if (field === 'interval') {
            if (value === '' || !isNaN(parseInt(value, 10))) {
                if (
                    value >= templateData?.properties[field]?.minimum &&
                    value <= templateData?.properties[field]?.maximum
                ) {
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
        <div className="flex">
            <Sidebar />
            <div className="main_content_wrapper">
                <div className="navbar_wrapper">
                    <Navbar navHeader={"Add Contract"} />
                </div>
                <div className="create-contract-form-container">
                    <Toast ref={toast} />
                    <div className="create-contract-form-grid">
                        <div className="create-contract-form-wrapper">
                            <h1 className="template-form-heading">{templateData?.title}</h1>
                            <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        <div className="contract_title_group">
                                            <InputText
                                                id="contract_title"
                                                value={formData.contract_title ?? ''}
                                                onChange={(e) => handleInputChange(e, 'contract_title')}
                                                required
                                                className="contract_form_field field_title"
                                                //onBlurCapture={() => setEditTitle(false)}
                                                disabled={!editTitle} ref={inputRef}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setEditTitle(!editTitle);
                                                    if (inputRef.current) { 
                                                        inputRef.current.focus();
                                                      }
                                                    }
                                                }
                                                className="contract_field_button"
                                            >
                                                {editTitle === false ? (<Image src="/add-contract/edit_icon.svg" width={22} height={22} alt='edit icon'></Image>): (
                                                    <Image src="/add-contract/save_icon.svg" width={22} height={22} alt='save icon'></Image>
                                                ) }
                                            </button>
                                        </div>
                                        <div className="contract_form_field_column">
                                        <div className="field">
                                            <label htmlFor="contract_type" className="required-field">Contract Type</label>
                                            <InputText
                                                id="contract_type"
                                                value={formData.contract_type ?? ''}
                                                onChange={(e) => handleInputChange(e, 'contract_type')}
                                                required
                                                className='contract_form_field'
                                            />
                                        </div>
                                        <div className="field half-width-field">
                                            <label htmlFor="asset_type" className="required-field">Asset Type</label>
                                            <InputText
                                                id="asset_type"
                                                value={formData.asset_type ?? ''}
                                                onChange={(e) => handleInputChange(e, 'asset_type')}
                                                required className='contract_form_field'
                                            />
                                        </div>
                                        </div>
                                        <div className='contract_form_subheader'>Contract Time</div>
                                        <div className="contract_form_field_column">
                                        <div className="field">
                                            <label htmlFor="contract_start_date" className="required-field">Contract Start Date</label>
                                            <Calendar
                                                id="contract_start_date"
                                                value={formData.contract_start_date ?? null}
                                                onChange={(e) => handleInputChange(e, 'contract_end_date')}
                                                showIcon
                                                required
                                                className='contract_form_field'
                                            />
                                        </div>
                                        <div className="field">
                                            <label htmlFor="contract_end_date" className="required-field">Contract End Date</label>
                                            <Calendar
                                                id="contract_end_date"
                                                value={formData.contract_end_date ?? null}
                                                onChange={(e) => handleInputChange(e, 'contract_end_date')}
                                                showIcon
                                                required
                                                maxDate={certificateExpiry ? new Date(certificateExpiry.getTime() - 24 * 60 * 60 * 1000) : undefined} className='contract_form_field'
                                            />
                                            {certificateExpiry && (
                                                <small className="p-error">
                                                    Contract end date must be before {new Date(certificateExpiry.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString()}
                                                </small>
                                            )}
                                        </div>
                                        </div>
                                        <div className='contract_form_subheader'>Parties</div>
                                        <div className="contract_form_field_column">
                                        <div className="field">
                                            <label htmlFor="consumer_company_name" className="required-field">Provider Company Name</label>
                                            <InputText
                                                id="consumer_company_name"
                                                value={formData.consumer_company_name ?? ''}
                                                onChange={(e) => handleInputChange(e, 'consumer_company_name')}
                                                required className='contract_form_field'
                                            />
                                        </div>
                                        <div className="field">
                                            <label htmlFor="consumer_company_name" className="required-field">Consumer Company Name</label>
                                            <InputText
                                                id="consumer_company_name"
                                                value={formData.consumer_company_name ?? ''}
                                                onChange={(e) => handleInputChange(e, 'consumer_company_name')}
                                                required className='contract_form_field'
                                            />
                                        </div>
                                        </div>
                                        <div className='contract_form_subheader'>Shared Data</div>
                                        <div className="contract_form_field_column">
                                        <div className="field half-width-field">
                                            <label htmlFor="interval" className="required-field">Interval</label>
                                            <InputText
                                                id="interval"
                                                type="number"
                                                value={formData.interval ?? ''}
                                                onChange={(e) => handleInputChange(e, 'interval')}
                                                required className='contract_form_field'
                                            />
                                        </div>
                                        <div className="field half-width-field">
                                            <label htmlFor="asset_properties" className="required-field">Asset Properties</label>
                                            <MultiSelect
                                                id="asset_properties"
                                                value={selectedAssetProperties}
                                                options={assetPropertiesOptions}
                                                onChange={(e) => setSelectedAssetProperties(e.value)}
                                                optionLabel="label"
                                                filter
                                                required className='contract_form_field'
                                            />
                                        </div>
                                        </div>
                                        {/* Data Consumer Company IFRIC ID */}
                                        <div className="field half-width-field">
                                            <label htmlFor="data_consumer_company_ifric_id" className="required-field">Data Consumer Company IFRIC ID</label>
                                            <InputText
                                                id="data_consumer_company_ifric_id"
                                                value={formData.data_consumer_company_ifric_id ?? ''}
                                                onChange={(e) => handleInputChange(e, 'data_consumer_company_ifric_id')}
                                                required
                                            />
                                        </div>

                                        {/* Consumer Company Certificate Data */}
                                        <div className="field half-width-field">
                                            <label>Consumer Company Certificate Data</label>
                                            {formData.consumer_company_certificate_data ? (
                                                <InputText
                                                    value="************************"
                                                    readOnly
                                                    className="masked-input"
                                                />
                                            ) : (
                                                <div className="no-certificate-message">No data found</div>
                                            )}
                                        </div>
                                    </div>

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
                        <div className="asset-type-list-cover">
                            {renderAssetTypeList()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddContractPage;