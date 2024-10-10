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
import { Chips } from 'primereact/chips';
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { getAccessGroup } from '../../utility/indexed-db.ts';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "../../../public/styles/add-contract.css";
import { getCompanyDetailsById, verifyCompanyCertificate } from '../../utility/auth';
import { getTemplateByName, getCompanyCertificate, createContract, getTemplateByType, getContractDetails } from '../../utility/contracts'
import { formatDateTime } from '../../utility/certificate'
import moment from 'moment';
import { IoEyeOutline } from 'react-icons/io5';
import { RiDeleteBinLine } from 'react-icons/ri';
import { FiEdit3 } from 'react-icons/fi';

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

const ContractDetails: React.FC = () => {
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
    const [editTitle, setEditTitle] = useState<Boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [consumerAddress, setConsumerAddress] = useState('');
    const [companyUser, setCompanyUser] = useState('');
    const [companyIfricId, setCompanyIfricId] = useState('');
    const [consumerCompanyCertified, setConsumerCompanyCertified] = useState<Boolean | null>(null);
    const [contractData, setContractData] = useState({});
    const { contractId } = router.query;

    const fetchContractDetails =async(contractIfricId:string)=>{
        try{
         const response = await getContractDetails(contractIfricId)
         console.log("all values here", response);
         const [contract]=response;
         setContractData(contract)
         setSelectedAssetProperties(contract?.asset_properties)
        }catch(error){
            console.error(error)
        }
    }

 
    const startDate = moment(contractData?.meta_data?.create_at).format(" MMMM DD, YYYY");
    const endDate = contractData?.contract_valid_till ? new Date(contractData.contract_valid_till) : null;
    
   

    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        if (editTitle && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editTitle]);
    useEffect(() => {
        if (contractId ) {
          console.log("Contract ID:", contractId );
          fetchContractDetails(contractId)
        }
      }, [contractId ]);


    const fetchData = async () => {
        try {
            const userData = await getAccessGroup();
            if (userData && userData.jwt_token) {

                // Fetch template data (from backend)
                const templateResponse =  await getTemplateByName("predictiveMaintenance_laserCutter");
                const template = templateResponse?.data[0];
                setTemplateData(template);
                initializeFormData(template.properties);
                setCompanyUser(userData.user_name);
                setCompanyIfricId(userData.company_ifric_id);
                setFormData(prevState => ({
                    ...prevState,
                    data_consumer_company_ifric_id: userData.company_ifric_id,
                    contract_name: template?.title,
                    interval: template.properties.interval.default
                }));

                // Fetch company certificate
                const companyCertResponse = await getCompanyCertificate(userData.company_ifric_id);
                if (companyCertResponse?.data && companyCertResponse?.data.length > 0) {
                    const companyCert = companyCertResponse.data[0];
                    setFormData(prevState => ({
                        ...prevState,
                        consumer_company_certificate_data: companyCert.certificate_data,
                        contract_valid_till: new Date(companyCert.expiry_on)
                    }));
                    await getCompanyVerification(userData.company_ifric_id);
                    setCertificateExpiry(new Date(companyCert.expiry_on));
                }

                // Fetch asset properties (from MongoDB, sandbox backend)
                const assetTypeBase64 = btoa(`https://industry-fusion.org/base/v0.1/${formData.asset_type}`);
                const assetPropertiesResponse = await getTemplateByType(assetTypeBase64);
                const mongoProperties = assetPropertiesResponse?.data.properties;

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
    
    const getCompanyVerification = async(company_ifric_id: string) => {
        try{
            const response = await verifyCompanyCertificate(company_ifric_id);
            if(response?.data.success === true && response.data.status === 201){
                setConsumerCompanyCertified(true)
            }
            else{
                setConsumerCompanyCertified(false)
            }
        }
        catch(error){
            console.error(error);
        }
    }

    const initializeFormData = (properties: { [key: string]: PropertyDefinition }) => {
        const initialData: { [key: string]: any } = {
            asset_type: 'laserCutter',
            contract_name: templateData?.title
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

    const handleInputChange = (e: any, field: string) => {
        const value = 'target' in e ? parseInt(e.target.value) : parseInt(e.value);
        
        console.log("wt's value here", typeof value);
        console.log("wt's field here", field);
        
        if (field === 'interval') {
            console.log("value here is ", value);
            
                if (
                    value >= templateData?.properties[field]?.minimum &&
                    value <= templateData?.properties[field]?.maximum
                ) {
                    setContractData({ ...contractData, [field]: value });
                } else {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: `Value must be between ${templateData?.properties[field]?.minimum} and ${templateData?.properties[field]?.maximum}.`
                    });
                }
            
            return;
        }


        setContractData({ ...formData, [field]: value });
    };

    const fetchConsumerCompanyName = async (companyId: string) => {
        try {
            const response = await getCompanyDetailsById(companyId);
            if (response?.data) {
                setFormData(prevState => ({
                    ...prevState,
                    consumer_company_name: response.data[0].company_name
                }));
                setConsumerAddress(`${response.data[0].address_1} ${response.data[0].address_2}`)
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch company details' });
        }
    };

    const renderContractClauses = () => {
        const clauses = templateData?.properties.contract_clauses.enums || [];
        return (
            <div className='contract_clauses_wrapper'>
                <div className='contract_form_subheader'>Contract Clauses</div>
                <ul>
                    {clauses.map((clause: string, index: number) => {
                        const parts = clause.split('[consumer]');
                        return (
                            <li key={`clause-${index}`}>
                                {parts.map((part, partIndex) => (
                                    <React.Fragment key={`part-${index}-${partIndex}`}>
                                        {part}
                                        {partIndex < parts.length - 1 && (
                                            <strong>{contractData.consumer_company_name || 'Company Name Not Available'}</strong>
                                        )}
                                    </React.Fragment>
                                ))}
                            </li>
                        );
                    })}
                </ul>
            </div>
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
        const clauses = templateData?.properties.contract_clauses.enums || [];
        const formattedClauses = clauses.map((clause: string) =>
        clause.replace(/\[consumer\]/g, contractData?.consumer_company_name || 'Company Name Not Available')
                    );
         const dataToSend = {
            "asset_type": contractData?.asset_type,
            "contract_name": contractData?.contract_name,
            "consumer_company_name": contractData?.consumer_company_name,
            "data_consumer_company_ifric_id": contractData?.data_consumer_company_ifric_id,
            "contract_type": contractData?.contract_type,
            "contract_clauses": formattedClauses,
            "data_type": contractData?.data_type,
            "interval": contractData?.interval,
            "contract_valid_till": moment(contractData?.contract_valid_till).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
            "asset_properties": selectedAssetProperties,
            "consumer_company_certificate_data": contractData?.consumer_company_certificate_data,
            "meta_data": {
                "create_at": moment(new Date()).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
                "created_user": companyUser,
                "last_updated_at": moment(new Date()).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
            },
            "__v": 0
         }
        if(contractData?.contract_valid_till === '' || contractData?.contract_valid_till === null){
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Contract end date cannot be empty' });
            return;
        }
        if (selectedAssetProperties.length <= 0) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Asset properties cannot be empty' });
            return;
        }

        console.log("dataToSend on edit", dataToSend);
        
    
        try {
           
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to add contract' });
        }
    };  

   
    const renderDataTypeList = ()=> {
        const dataTypes = templateData?.properties.data_type.default
        return(
            <div className='datatype_chips_wrapper'>
                {dataTypes.map((dataType:string) => (
                    <div className='datatype_chip'>{dataType}</div>
                ))}
            </div>
        )
    }

    const handleAssetTypeClick = (assetType: string) => {
        setFormData((prevState) => ({
            ...prevState,
            asset_type: assetType,
        }));
    };

    if (!contractData) return <div>Loading...</div>;

    return (
        <div className="flex">
            <Sidebar />
            <div className="main_content_wrapper">
                <div className="navbar_wrapper">
                    <Navbar navHeader={"Contract"} />
                </div>
                <div className="create-contract-form-container">
                    <Toast ref={toast} />
                    <div className="create-contract-form-grid">
                        <div className="create-contract-form-wrapper">
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="contract_title_group">
                                        <InputText
                                            ref={inputRef}
                                            id="contract_title"
                                            value={contractData?.contract_name ?? ''}
                                            onChange={(e) => handleInputChange(e, 'contract_name')}
                                            required
                                            className="contract_form_field field_title"
                                            onBlur={() => {
                                                setTimeout(() => {
                                                    setEditTitle(false);
                                                }, 200);
                                            }}
                                            disabled={!editTitle}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setEditTitle(!editTitle);
                                            }}
                                            className="contract_field_button"
                                        >
                                            {editTitle === false ? (<Image src="/add-contract/edit_icon.svg" width={22} height={22} alt='edit icon'></Image>) : (
                                                <Image src="/add-contract/save_icon.svg" width={22} height={22} alt='save icon'></Image>
                                            )}
                                        </button>
                                    </div>
                                    <div className="contract_form_field_column">
                                        <div className="field">
                                            <label htmlFor="contract_type" className="required-field">Contract Type</label>
                                            {!!templateData?.properties.contract_type.readOnly ? (
                                                <div className='text_large_bold'>{contractData?.contract_type ? contractData?.contract_type.split('/').pop() : ''}</div>
                                            ) : (
                                                <InputText
                                                    id="contract_type"
                                                    value={formData.contract_type ?? ''}
                                                    onChange={(e) => handleInputChange(e, 'contract_type')}
                                                    required
                                                    className='contract_form_field'
                                                />
                                            )}
                                        </div>
                                        <div className="field half-width-field">
                                            <label htmlFor="asset_type" className="required-field">Asset Type</label>
                                            {!!templateData?.properties.asset_type.readOnly ? (
                                                <div className='text_large_bold'>{contractData?.asset_type ? contractData?.asset_type.split('/').pop() : ''}</div>
                                            ) : (
                                                <InputText
                                                    id="asset_type"
                                                    value={formData.asset_type ?? ''}
                                                    onChange={(e) => handleInputChange(e, 'asset_type')}
                                                    required className='contract_form_field'
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className='contract_form_subheader'>Contract Time</div>
                                    <div className="contract_form_field_column">
                                        <div className="field">
                                            <label htmlFor="contract_start_date" className="required-field">Contract Start Date</label>
                                            <div className='text_large_bold margin_top_medium'>
                                               {startDate}
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label htmlFor="contract_valid_till" className="required-field">Contract End Date <span style={{ color: "red" }}>*</span></label>
                                            <Calendar
                                                id="contract_valid_till"
                                                value={ endDate ?? null}
                                                onChange={(e) => handleInputChange(e, 'contract_valid_till')}
                                                showIcon
                                                maxDate={certificateExpiry ? new Date(certificateExpiry) : undefined} className='contract_form_field' placeholder='Choose an end date' dateFormat="MM dd, yy"
                                            />
                                            {certificateExpiry && (
                                                <small>
                                                    Contract end date must be before {new Date(certificateExpiry).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <div className='contract_form_subheader'>Parties</div>
                                    <div className="contract_form_field_column">
                                        <div className="field">
                                            {!!templateData?.properties.consumer_company_name.readOnly ? (
                                                <div className="consumer_details_wrapper">
                                                <Image src="/add-contract/company_icon.svg" width={24} height={24} alt='company icon'></Image>
                                                    <div>
                                                        <label htmlFor="provider_company_name" className="required-field">Data Consumer</label>
                                                        <div style={{ color: "#2b2b2bd6", lineHeight: "18px" }}><div className='company_verified_group'>
                                                            <div className='text_large_bold'>{contractData?.consumer_company_name}</div>
                                                            {(consumerCompanyCertified !== null && consumerCompanyCertified === true) && (
                                                                <Image src="/verified_icon.svg" width={16} height={16} alt='company verified icon' />
                                                            )}
                                                            {(consumerCompanyCertified !== null && consumerCompanyCertified === false) && (
                                                                <Image src="/warning.svg" width={16} height={16} alt='company not verified icon' />
                                                            )}
                                                        </div>
                                                            <div style={{ marginTop: "4px" }}>{consumerAddress}</div>
                                                            <div style={{ marginTop: "4px" }}>{contractData?.data_consumer_company_ifric_id}</div>
                                                        </div>
                                                    </div>
                                            </div>

                                            ) : (
                                                <div>
                                                    <label htmlFor="consumer_company_name" className="required-field">Data Consumer</label>
                                                    <InputText
                                                    id="consumer_company_name"
                                                    value={formData.consumer_company_name ?? ''}
                                                    onChange={(e) => handleInputChange(e, 'consumer_company_name')}
                                                    required className='contract_form_field'
                                                />
                                                </div>
                                            )}
                                        </div>
                                        <div className="field">
                                            {/* <InputText
                                                id="provider_company_name"
                                                value={formData.provider_company_name ?? ''}
                                                onChange={(e) => handleInputChange(e, 'provider_company_name')}
                                                required className='contract_form_field'
                                            /> */}
                                            <div className="consumer_details_wrapper">
                                                <Image src="/add-contract/company_icon.svg" width={24} height={24} alt='company icon'></Image>
                                                <div>
                                                    <label htmlFor="provider_company_name" className="required-field">Data Provider</label>
                                                    <div style={{color: "#2b2b2bd6", lineHeight: "18px"}}><div className='text_large_bold'>XYZ Company Gmbh</div>
                                                    <div style={{marginTop: "8px"}}>Street name, city, country</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='contract_form_subheader'>Shared Data</div>
                                    <div className="contract_form_field_column">
                                        <div className="field half-width-field">
                                            <label htmlFor="interval" className="required-field">Interval</label>
                                            <InputText
                                                id="interval"
                                                type="number"
                                                value={contractData?.interval ?? ''}
                                                onChange={(e) => handleInputChange(e, 'interval')}
                                                required className='contract_form_field'
                                            />
                                            <small>Realtime update interval for properties.</small>
                                            {templateData?.properties.data_type && (
                                                <div className='data_types_field_wrapper'>
                                                    <label htmlFor="" className='required-field'>Data type</label>
                                                    {renderDataTypeList()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="field half-width-field">
                                            <label htmlFor="asset_properties" className="required-field">Asset Properties <span style={{color: "red"}}>*</span></label>
                                            <MultiSelect
                                                id="asset_properties"
                                                value={selectedAssetProperties}
                                                options={assetPropertiesOptions}
                                                onChange={(e) => setSelectedAssetProperties(e.value)}
                                                optionLabel="label"
                                                filter
                                                required className='contract_form_field' placeholder='Select Asset Properties'
                                            />
                                            <Chips value={selectedAssetProperties} className='asset_chips' onChange={(e) => setSelectedAssetProperties(e.value)} />
                                        </div>
                                    </div>
                                    {/* Data Consumer Company IFRIC ID */}
                                    {/* <div className="field half-width-field">
                                            <label htmlFor="data_consumer_company_ifric_id" className="required-field">Data Consumer Company IFRIC ID</label>
                                            <InputText
                                                id="data_consumer_company_ifric_id"
                                                value={formData.data_consumer_company_ifric_id ?? ''}
                                                onChange={(e) => handleInputChange(e, 'data_consumer_company_ifric_id')}
                                                required
                                            />
                                        </div>

                                        {/* Consumer Company Certificate Data */}
                                    {/*<div className="field half-width-field">
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
                                        </div> */}
                                </div>

                                {renderContractClauses()}

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
                                        label="Update"
                                        className="p-button-primary custom-add-btn"
                                        icon="pi pi-check"
                                        disabled={(consumerCompanyCertified !== null && consumerCompanyCertified === false)}
                                    />
                                </div>
                            </form>
                            {(consumerCompanyCertified !== null && consumerCompanyCertified === false) && (
                                <div className='floating_error_group'>
                                    <Image src="/add-contract/warning_icon_bold.svg" width={20} height={20} alt='Warning icon'></Image>
                                    <div>You must certify the company to create a contract.</div>
                                </div>
                            )}
                        </div>
                        <div className="asset-type-list-cover">
                            <p className='review-btn'>Review</p>
                            <ul className='review_lists'>
                                <li ><i  className="pi pi-download mr-2"></i>Download</li>
                                <li ><IoEyeOutline className='mr-2'/>Preview</li>
                                <li><FiEdit3 className='mr-2'/>Edit</li>
                                <li><RiDeleteBinLine className='mr-2'/>Delete</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetails;