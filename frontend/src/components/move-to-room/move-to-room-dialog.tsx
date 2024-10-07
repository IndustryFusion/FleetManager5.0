import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Timeline } from 'primereact/timeline';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import Image from 'next/image';
import { Checkbox } from 'primereact/checkbox';
import '../../../public/styles/move-to-room.css';
import axios from 'axios';
import { MultiSelect } from 'primereact/multiselect';
import OwnerDetailsCard from './owner-details';
import { postFile } from '@/utility/asset';
import { updateCompanyTwin, getCategorySpecificCompany, verifyCompanyCertificate, verifyAssetCertificate, generateAssetCertificate, getCompanyDetailsById } from '@/utility/auth';
import moment from 'moment';

interface Company {
  id: string;
  name: string;
  companyIfricId: string
}

interface Certificate {
  label: string;
  value: string;
}

interface MoveToRoomDialogProps {
  assetName: string;
  company_ifric_id: string;
  assetIfricId: string;
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}

interface OwnerDetails {
  name?: string;
  companyIfricId: string;
  certifiedCompany?: string;
  role?: string;
  country?: string;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const IFRIC_REGISTRY_BACKEND_URL = process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;

const MoveToRoomDialog: React.FC<MoveToRoomDialogProps> = ({ assetName, assetIfricId, company_ifric_id, visible, onHide, onSave }) => {
  const [factoryOwner, setFactoryOwner] = useState<Company | null>(null);
  const [factoryOwners, setFactoryOwners] = useState<OwnerDetails[]>([]);
  const [certificate, setCertificate] = useState<Certificate[] | null>([]);
  const [contract, setContract] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);
  const [preCertifyAsset, setPreCertifyAsset] = useState(false);
  const [salesAgreement, setSalesAgreement] = useState(false);
  const [salesAgreementFile, setSalesAgreementFile] = useState<string>('');
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const salesAgreementFileUploadRef = useRef<FileUpload>(null);
  const [ownerDetails, setOwnerDetails] = useState<OwnerDetails | null>(null);
  const [checkIndex, setCheckIndex] = useState(0);
  const [certificationDate, setCertificationDate] = useState<Date | null | undefined>(null);
  const [assetVerified, setAssetVerified] = useState<boolean | null>(null);
  const [ownerVerified, setOwnerVerified] = useState<boolean | null>(null);
  const [companyVerified, setCompanyVerified] = useState<boolean | null>(null);
  const [companyIfricId, setCompanyIfricId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  const certificateOptions: Certificate[] = [
    { label: 'contract_Predictive_MIcrostep', value: 'contract_Predictive_MIcrostep' },
    { label: 'contract_Insurance_IFRIC', value: 'contract_Insurance_IFRIC' },
  ];

  useEffect(() => {
    fetchFactoryOwners();
    getCompanyCertification(company_ifric_id);
    getAssetCertification();
    getCompanyDetails();
  }, []);

  useEffect(() => {
    const newCompletedSteps = [
      !!factoryOwner,
      (!!contract || (salesAgreement && !!salesAgreementFile)),
      !!certificate,
      !!factoryOwner && (!!contract || (salesAgreement && !!salesAgreementFile)) && !!certificate
    ];
    setCompletedSteps(newCompletedSteps);
  }, [factoryOwner, contract, salesAgreement, salesAgreementFile, certificate]);

  const getCompanyDetails = async () => {
    try {
      const response = await getCompanyDetailsById(company_ifric_id);
      setUserEmail(response?.data[0].email);
      setCompanyName(response?.data[0].company_name)
    }
    catch (error: any) {
      console.error("Failed to fetch company details");
    }
  }

  const getCompanyCertification = async (company_ifric_id: string) => {
    try {
      const response = await verifyCompanyCertificate(company_ifric_id);
      if (response?.data.success === true && response.data.status === 201) {
        setOwnerVerified(true);
        if (companyVerified === null) {
          setCompanyVerified(true);
        }
      }
      else {
        setOwnerVerified(false);
        if (companyVerified === null) {
          setCompanyVerified(false);
        }
      }
    }
    catch (error: any) {
      console.error("error fetching company certification", error);
    }
  }

  const getAssetCertification = async () => {
    try {
      const response = await verifyAssetCertificate(company_ifric_id, assetIfricId);
      if (response?.data.valid === true) {
        setAssetVerified(true);
      }
      else {
        setAssetVerified(false);
      }
    }
    catch (error: any) {
      console.error("Error fetching asset certification", error)
    }
  }
  const createAssetCertification = async (e: any) => {
    e.preventDefault();
    if (certificationDate) {
      const formattedDate = handleDateChange(certificationDate);
      const dataToSend = {
        company_ifric_id: company_ifric_id,
        asset_ifric_id: assetIfricId,
        user_email: userEmail,
        expiry: formattedDate
      }
      try {
        const response = await generateAssetCertificate(dataToSend);
        if (response?.data.status === 201 && response.data.success === true) {
          setAssetVerified(true);
          setPreCertifyAsset(false);
        }
        else {
          setAssetVerified(false);
        }
      }
      catch (error: any) {
        console.error("Error generating certificate", error);
      }
    }
    else {
      console.error("Please select an expiration date.")
    }
  }
  const handleSave = async () => {
    try {
      if (!factoryOwner?.companyIfricId) {
        throw new Error('Factory owner ID is missing');
      }

      const dataToSend = {
        owner_company_ifric_id: factoryOwner.companyIfricId,
        // owner_company_ifric_id: "urn:ifric:ifx-eur-nld-ast-b28fa8b9-5027-58e2-b06f-1eef75e62d0d",
        maufacturer_ifric_id: "urn:ifric:ifx-eu-com-nap-667bdc8b-bb1f-5af7-8045-e16821a5567d",
        asset_ifric_id: assetIfricId
      };

      console.log("Data being sent to API:", dataToSend);

      const response = await updateCompanyTwin(dataToSend);

      console.log("API response:", response);

      if (response && response.data.status === 204) {
        onSave();
        onHide();
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Asset assignment updated successfully' });
      } else {
        throw new Error(response?.data.message || 'Failed to update');
      }
    } catch (error: any) {
      console.error('Error updating asset assignment:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to update asset assignment' });
    }
  };
  const handleFactoryOwnerChange = (e: DropdownChangeEvent) => {
    const selectedOwner = e.value;
    setFactoryOwner(selectedOwner);
    setOwnerVerified(null);
    setCompanyIfricId(e.value.companyIfricId);
    getCompanyCertification(e.value.companyIfricId);
  };

  const fetchFactoryOwners = async () => {
    try {
      const response = await getCategorySpecificCompany("factory_owner");
      if (response && response.data && Array.isArray(response.data)) {
        const formattedOwners = response.data.map((owner: any) => ({
          id: owner.company_ifric_id,
          name: owner.company_name,
          companyIfricId: owner.company_ifric_id,
          company_category: owner.company_category
        }));
        setFactoryOwners(formattedOwners);
      } else {
        throw new Error('Invalid data format received from the server');
      }
    } catch (error) {
      console.error('Error fetching factory owners:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch factory owners' });
    }
  };

  const handleDateChange = (date: Date) => {
    const selectedDate = date as Date;
    const formattedDate = moment(selectedDate)
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    return formattedDate;
  };

  const handleFileUpload = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await postFile(formData);
      if (response && response.status === 201) {
        if (salesAgreement) {
          setSalesAgreementFile(response.data);
        } else {
          setContract(response.data);
        }
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully' });
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to upload file' });
    }

    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
    if (salesAgreementFileUploadRef.current) {
      salesAgreementFileUploadRef.current.clear();
    }
  };

  const timelineEvents = [
    { status: 'Selected Owner', subtext: 'Selected Factory Owner' },
    { status: 'Uploaded Contract', subtext: 'Contract or Sales Agreement uploaded' },
    { status: 'Selected Certificate', subtext: 'Certified by IFX - IFRIC' },
    { status: 'Assigned Owner', subtext: 'Asset Data Twin Transferred' },
  ];

  const customizedMarker = (item: any, index: number) => {
    return (
      <span className={`custom-marker ${completedSteps[index] ? 'completed' : ''}`}>
        {index + 1}
      </span>
    );
  };

  const customizedContent = (item: any, index: number) => {
    return (
      <div className={`custom-content ${completedSteps[index] ? 'completed' : ''}`}>
        <h3>{item.status}</h3>
        <p>{item.subtext}</p>
      </div>
    );
  };
  const CustomCheck = ({ stroke = "#CECECE", fill = "white", check = "#CECECE" }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M8 12.75C8 12.75 9.6 13.6625 10.4 15C10.4 15 12.8 9.75 16 8" stroke={check} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => { onHide() }}
        className="p-button-text"
        style={{ backgroundColor: "#E6E6E6", color: "black" }} // Set text color to black
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={handleSave}
        disabled={!completedSteps.every(step => step)}
        style={{ backgroundColor: "#E6E6E6", color: "black" }} // Set text color to black
        autoFocus
      />
    </div>
  );

  const dialogHeader = (
    <div className="company-dialog-header">
      <div><h2 className='header_asset_title'>{assetName}</h2>
        <p className="header_ifric_id">{assetIfricId}</p></div>
      <div className='company_verified_wrapper'>
        <div>{companyName}</div>
        {(companyVerified !== null && companyVerified === true) && (
          <Image src="/verified_icon.svg" alt='company verified' width={20} height={20}></Image>
        )}
        {(companyVerified !== null && companyVerified === false) && (
          <Image src="/warning.svg" alt='company verified' width={20} height={20}></Image>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      style={{ width: '80vw', maxWidth: "1300px", height: '80vh' }}
      footer={dialogFooter}
      onHide={() => { onHide()}}
      className="move-to-room-dialog"
      draggable={false}
    >
      <Toast ref={toast} />
      {/* <div className="dialog-content" style={{ display: 'flex', height: '100%' }}>
        <div className="timeline-container" style={{ width: '30%', height: '100%', overflowY: 'auto' }}>
          <Timeline
            value={timelineEvents}
            marker={customizedMarker}
            content={customizedContent}
            className={`custom-timeline ${completedSteps.map((step, index) => step ? `step-${index}-completed` : '').join(' ')}`}
          />
        </div>
        <div className="content-container" style={{ width: '70%', height: '100%', overflowY: 'auto', padding: '0 20px' }}>
          <div className={`step-section ${completedSteps[0] ? 'completed' : ''}`}>
            <h3>Step 1: Select Factory Owner</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <div className="field">
                  <label htmlFor="factoryOwner">Factory Owner</label>
                  <Dropdown
                    id="factoryOwner"
                    value={factoryOwner}
                    options={factoryOwners}
                    onChange={handleFactoryOwnerChange}
                    optionLabel="name"
                    placeholder="Select a factory owner"
                    className="w-full input-text-dropdown"
                  />
                  <img
                    className="dropdown-icon-img "
                    src="/dropdown-icon.svg"
                    alt="dropdown-icon"
                  />
                </div>
                <div className="field-checkbox">
                  <Checkbox inputId="preCertifyAsset" checked={preCertifyAsset} onChange={e => setPreCertifyAsset(e.checked as boolean)} />
                  <label htmlFor="preCertifyAsset">Pre Certify Asset</label>
                </div>
                {preCertifyAsset && (
                  <div className="field">
                    <label>Product Name</label>
                    <InputText value={assetName} disabled className="w-full input-text" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                {factoryOwner && (
                  <OwnerDetailsCard owner={factoryOwner} />
                )}
              </div>
            </div>
          </div>
          <div className={`step-section ${completedSteps[1] ? 'completed' : ''}`}>
            <h3>Step 2: Upload Contract</h3>
            <div className="field-checkbox">
              <Checkbox inputId="salesAgreement" checked={salesAgreement} onChange={e => setSalesAgreement(e.checked as boolean)} />
              <label htmlFor="salesAgreement">Sales Agreement</label>
            </div>

            {salesAgreement && (
              <div className="field">
                <label htmlFor="contract">{salesAgreement ? 'Sales Agreement' : 'Contract'}</label>
                <div className="p-inputgroup">
                  <InputText
                    id="contract"
                    value={salesAgreement ? salesAgreementFile : contract}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => salesAgreement ? setSalesAgreementFile(e.target.value) : setContract(e.target.value)}
                    placeholder="S3 link or file path"
                    className='input-text'
                  />

                </div>
                <div className="mt-2">
                  <label>Attach {salesAgreement ? 'Sales Agreement' : 'Contract'}</label>
                  <FileUpload
                    ref={salesAgreement ? salesAgreementFileUploadRef : fileUploadRef}
                    name={salesAgreement ? "salesAgreement" : "contract"}
                    url={BACKEND_API_URL + '/file'}
                    accept="application/pdf"
                    maxFileSize={4000000}
                    customUpload
                    uploadHandler={handleFileUpload}
                    onUpload={(e) => {
                      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully' });
                    }}
                    onError={(e) => {
                      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'File upload failed' });
                    }}
                    emptyTemplate={
                      <div className="flex align-items-center flex-column">
                        <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                        <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">Drag and Drop Here</span>
                      </div>
                    }
                    headerTemplate={(options) => {
                      const { className, chooseButton, uploadButton, cancelButton } = options;
                      return (
                        <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                          {chooseButton}
                          {uploadButton}
                          {cancelButton}
                          <div style={{ marginLeft: 'auto' }}>0 B / 3 MB</div>
                        </div>
                      );
                    }}
                    itemTemplate={(file: any, props) => {
                      return (
                        <div className="flex align-items-center flex-wrap">
                          <div className="flex align-items-center" style={{ width: '40%' }}>
                            <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                            <span className="flex flex-column text-left ml-3">
                              {file.name}
                              <small>{new Date().toLocaleDateString()}</small>
                            </span>
                          </div>
                          <Button
                            type="button"
                            icon="pi pi-times"
                            className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                            onClick={(e) => props.onRemove(e)}
                          />
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={`step-section ${completedSteps[2] ? 'completed' : ''}`}>
            <h3>Step 3: Select Certificate</h3>
            <div className="field">
              <label htmlFor="certificate">Certificate</label>
              <Dropdown
                id="certificate"
                value={certificate ? certificate.value : null} // Ensure certificate.value is used
                options={certificateOptions}
                onChange={(e: DropdownChangeEvent) => {
                  const selectedCertificate = certificateOptions.find(cert => cert.value === e.value);
                  setCertificate(selectedCertificate || null);  // Set the entire certificate object
                }}
                optionLabel="label"
                placeholder="Select a certificate"
                className="w-full input-text-dropdown"
              />
              <img
                className="dropdown-icon-img"
                src="/dropdown-icon.svg"
                alt="dropdown-icon"
              />
            </div>
          </div>

          <div className={`step-section ${completedSteps[3] ? 'completed' : ''}`}>
            <h3>Step 4: Confirm Asset Assignment</h3>
            <p>Please review the details below:</p>
            <ul>
              <li className='mb-1'>Asset: {assetName}</li>
              <li className='mb-1'>Factory Owner: {factoryOwner ? factoryOwner.name : 'Not selected'}</li>
              <li className='mb-1'>Pre Certify Asset: {preCertifyAsset ? 'Yes' : 'No'}</li>
              <li className='mb-1'>{salesAgreement ? 'Sales Agreement' : 'Contract'}: {salesAgreement ? (salesAgreementFile || 'Not uploaded') : (contract || 'Not uploaded')}</li>
              <li className='mb-1'>Certificate: {certificate ? certificate.label : 'Not selected'}</li>
            </ul>
          </div>

          <Message severity="info" text="Need assistance? Contact the facility management team for help." />
        </div>
      </div> */}

      <div className='owner_dialog_wrapper'>
        <div className="owner_form_steps">
          <div className="custom_steps_wrapper">
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 1 ? "#3874C9" : "#6b7280" }}></div>
              {factoryOwner ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: factoryOwner ? "#2b2b2b" : "#6b7280" }}>Factory Owner</div>
                <div className="custom_check_helper">Select Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 2 ? "#3874C9" : "#6b7280" }}></div>
              {assetVerified ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: assetVerified ? "#2b2b2b" : "#6b7280" }}>Asset Certified</div>
                <div className="custom_check_helper">Select Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 2 ? "#3874C9" : "#6b7280" }}></div>
              {salesAgreement ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: salesAgreement ? "#2b2b2b" : "#6b7280" }}>Sale Contract</div>
                <div className="custom_check_helper">Selected Factory Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 3 ? "#3874C9" : "#6b7280" }}></div>
              {certificate && certificate.length !== 0 ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: certificate && certificate.length !== 0 ? "#2b2b2b" : "#6b7280" }}>DataSpace Contract</div>
                <div className="custom_check_helper">Selected Factory Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              {checkIndex >= 4 ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: checkIndex >= 4 ? "#2b2b2b" : "#6b7280" }}>Assigned Owner</div>
                <div className="custom_check_helper">Selected Factory Owner</div>
              </div>
            </div>
          </div>
        </div>
        <div className="owner_form_wrapper">
          <form className='owner_form'>
            <div className="form_field_group">
              <h3 className='form_group_title'>Factory Owner</h3>
              <div className="form_field">
                <div className="p-field p-float-label">
                  <Dropdown
                    id="factoryOwner"
                    value={factoryOwner}
                    options={factoryOwners}
                    onChange={handleFactoryOwnerChange}
                    optionLabel="name"
                    placeholder="Select a factory owner"
                    className="company_dropdown"
                  />
                  <img
                    className="dropdown-icon-img "
                    src="/dropdown-icon.svg"
                    alt="dropdown-icon"
                  />
                  <label htmlFor="factoryOwner">Factory Owner</label>
                </div>
              </div>
              {(ownerVerified === true && factoryOwner) && (
                <div className='asset_verified_group'>
                  <Image src="/verified_icon.svg" alt='company verified' width={16} height={16}></Image>
                  <div>IFRIC Verified</div>
                </div>
              )}
              {(ownerVerified === false && factoryOwner) && (
                <div className='asset_verified_group'>
                  <Image src="/warning.svg" alt='company verified' width={16} height={16}></Image>
                  <div>Not IFRIC Verified</div>
                </div>
              )}
            </div>
            <div className="form_field_group">
              <h3 className='form_group_title'>Asset Verification</h3>
                <div>
                  {(assetVerified === false && assetVerified !== null) && (
                    <div>
                      <Checkbox inputId="preCertifyAsset" checked={preCertifyAsset} onChange={e => setPreCertifyAsset(e.checked as boolean)} className='company_checkbox' />
                      <label htmlFor="preCertifyAsset">Pre Certify Asset</label>
                    </div>
                  )}
                  {(assetVerified === true && assetVerified !== null) && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div>
                          <Checkbox inputId="preCertifyAsset" checked={true} className='company_checkbox' />
                          <label htmlFor="preCertifyAsset">Pre Certify Asset</label>
                        </div>
                        <div className='asset_verified_group no-margin'>
                          <Image src="/verified_icon.svg" alt='company verified' width={16} height={16}></Image>
                          <div>Asset Verified</div>
                        </div>
                        </div>
                        <div className="form_field margin_top">
                          <div className="p-field p-float-label">
                            <InputText value={assetName} disabled className="company_input" id='asset-name'
                            ></InputText>
                            <label htmlFor="asset-name">Product Name</label>
                          </div>
                        </div>
                    </>
                  )}
                </div>
              {preCertifyAsset && (
                <>
                  <div className="form_field margin_top">
                    <div className="p-field p-float-label">
                      <InputText value={assetName} disabled className="company_input" id='asset-name'
                      ></InputText>
                      <label htmlFor="asset-name">Product Name</label>
                    </div>
                  </div>
                  {(assetVerified !== null && assetVerified === false) && (
                    <div className='generate_cert_button_group'>
                      {certificationDate && (
                        <div style={{ marginRight: "auto" }}>Expiration Date: {certificationDate.toLocaleString()}</div>
                      )}
                      <Calendar className='certification_date_button' value={certificationDate} onChange={(e) => setCertificationDate(e.value)} showIcon showTime icon={<img src="calendar_icon.svg" alt="Custom Icon" />} tooltip={"Expiration date"} tooltipOptions={{ position: "left", event: "both" }} />
                      <button className='generate_certification_button' disabled={!certificationDate} onClick={createAssetCertification}>Certify</button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="form_field_group">
              <h3 className='form_group_title'>Sale Contract</h3>
              <div>
                <Checkbox inputId="salesAgreement" checked={salesAgreement} onChange={e => setSalesAgreement(e.checked as boolean)} className='company_checkbox' />
                <label htmlFor="salesAgreement">Sales Agreement</label>
              </div>
              {salesAgreement && (
                <div className="form_field margin_top">
                  <div className="p-field p-float-label">
                    <InputText
                      id="contract"
                      value={salesAgreement ? salesAgreementFile : contract}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => salesAgreement ? setSalesAgreementFile(e.target.value) : setContract(e.target.value)}
                      placeholder="S3 link or file path"
                      className='company_input'
                    />
                    <label htmlFor="contract">{salesAgreement ? 'Sales Agreement' : 'Contract'}</label>
                  </div>
                  <div className="mt-3">
                    <div className="form_field">
                      <label>Attach {salesAgreement ? 'Sales Agreement' : 'Contract'}</label>

                      <FileUpload
                        ref={salesAgreement ? salesAgreementFileUploadRef : fileUploadRef}
                        name={salesAgreement ? "salesAgreement" : "contract"}
                        url={BACKEND_API_URL + '/file'}
                        accept="application/pdf"
                        maxFileSize={4000000}
                        customUpload
                        uploadHandler={handleFileUpload}
                        onUpload={(e) => {
                          toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully' });
                        }}
                        onError={(e) => {
                          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'File upload failed' });
                        }}
                        emptyTemplate={
                          <div className="flex align-items-center flex-column">
                            <i className="pi pi-image mt-3" style={{ fontSize: '3rem', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                            <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">Drag and Drop Here</span>
                          </div>
                        }
                        headerTemplate={(options) => {
                          const { className, chooseButton, uploadButton, cancelButton } = options;
                          return (
                            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center', marginTop: "12px" }}>
                              {chooseButton}
                              {uploadButton}
                              {cancelButton}
                              <div style={{ marginLeft: 'auto' }}>0 B / 3 MB</div>
                            </div>
                          );
                        }}
                        itemTemplate={(file: any, props) => {
                          return (
                            <div className="flex align-items-center flex-wrap">
                              <div className="flex align-items-center" style={{ width: '40%' }}>
                                <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                                <span className="flex flex-column text-left ml-3">
                                  {file.name}
                                  <small>{new Date().toLocaleDateString()}</small>
                                </span>
                              </div>
                              <Button
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={(e) => props.onRemove(e)}
                              />
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="form_field_group">
              <h3 className='form_group_title'>DataSpace Contract</h3>
              <div className="form_field">
                <div className="p-field p-float-label">
                  <MultiSelect id="certificate"
                    value={certificate} // Ensure certificate.value is used
                    options={certificateOptions}
                    showSelectAll={false}
                    panelHeaderTemplate={(<div></div>)}
                    onChange={(e: DropdownChangeEvent) => {
                      setCertificate(e.value || null);  // Set the entire certificate object
                    }}
                    optionLabel="label"
                    placeholder="Select a certificate"
                    className="company_dropdown" display="chip" />
                  <img
                    className="dropdown-icon-img "
                    src="/dropdown-icon.svg"
                    alt="dropdown-icon"
                  />
                  <label htmlFor="certificate">DataSpace Contract</label>
                </div>
              </div>
            </div>
            <div className="warning_text_group">
              <div className='warning_group_header'>
                <Image src="warning.svg" width={18} height={18} alt='warning icon'></Image>
                <div className='warning_group_title'>Before you proceed.</div>
              </div>
              <div>
                <ul>
                  <li>Assigning an owner means selling the physical asset.</li>
                  <li>This action is irreversible, please submit only after a purchase agreement is executed between seller and buyer explicitly.</li>
                  <li>Please contact Industryfusion-X team in case of wrong submission.</li>
                </ul>
              </div>
            </div>
          </form>

          {factoryOwner && (
            <div className='owner_details_card'>
              <OwnerDetailsCard owner={factoryOwner} />
            </div>
          )}

        </div>
      </div>
    </Dialog>
  );
};

export default MoveToRoomDialog;