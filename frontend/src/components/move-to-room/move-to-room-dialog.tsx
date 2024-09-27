import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Timeline } from 'primereact/timeline';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import '../../../public/styles/move-to-room.css';
import axios from 'axios';
import OwnerDetailsCard from './owner-details';
import { postFile } from '@/utility/asset';
import { updateCompanyTwin, getCategorySpecificCompany } from '@/utility/auth';

interface Company {
  id: string;
  name: string;
  companyIfricId:string
}

interface Certificate {
  label: string;
  value: string;
}

interface MoveToRoomDialogProps {
  assetName: string;
  company_ifric_id: string;
  assetIfricId:string;
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
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [contract, setContract] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);
  const [preCertifyAsset, setPreCertifyAsset] = useState(false);
  const [salesAgreement, setSalesAgreement] = useState(false);
  const [salesAgreementFile, setSalesAgreementFile] = useState<string>('');
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const salesAgreementFileUploadRef = useRef<FileUpload>(null);
  const [ownerDetails, setOwnerDetails] = useState<OwnerDetails | null>(null);

  const certificateOptions: Certificate[] = [
    { label: 'cert_HSA1_MIcrostep', value: 'cert_HSA1_MIcrostep' },
    { label: 'cert_HSA1_IFRIC', value: 'cert_HSA1_IFRIC' },
  ];

  useEffect(() => {
    fetchFactoryOwners();
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
  };

  const fetchFactoryOwners = async () => {
    try {
      const response = await getCategorySpecificCompany("factory_owner");
      if (response && response.data && Array.isArray(response.data)) {
        const formattedOwners = response.data.map((owner: any) => ({
          id: owner.company_ifric_id,
          name: owner.company_name,
          companyIfricId: owner.company_ifric_id,
          company_category:owner.company_category
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

  const dialogFooter = (
  <div>
    <Button 
      label="Cancel" 
      icon="pi pi-times" 
      onClick={onHide} 
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
    <div className="dialog-header">
      <h2>{assetName}</h2>
      <p className="text-sm text-gray-500">{assetIfricId}</p>
    </div>
  );

 return (
    <Dialog 
      header={dialogHeader} 
      visible={visible} 
      style={{ width: '80vw', height: '80vh' }} 
      footer={dialogFooter} 
      onHide={onHide}
      className="move-to-room-dialog"
    >
      <Toast ref={toast} />
      <div className="dialog-content" style={{ display: 'flex', height: '100%' }}>
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
                      toast.current?.show({severity: 'success', summary: 'Success', detail: 'File uploaded successfully'});
                    }}
                    onError={(e) => {
                      toast.current?.show({severity: 'error', summary: 'Error', detail: 'File upload failed'});
                    }}
                    emptyTemplate={
                      <div className="flex align-items-center flex-column">
                        <i className="pi pi-image mt-3 p-5" style={{fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)'}}></i>
                        <span style={{fontSize: '1.2em', color: 'var(--text-color-secondary)'}} className="my-5">Drag and Drop Here</span>
                      </div>
                    }
                    headerTemplate={(options) => {
                      const { className, chooseButton, uploadButton, cancelButton } = options;
                      return (
                        <div className={className} style={{backgroundColor: 'transparent', display: 'flex', alignItems: 'center'}}>
                          {chooseButton}
                          {uploadButton}
                          {cancelButton}
                          <div style={{marginLeft: 'auto'}}>0 B / 3 MB</div>
                        </div>
                      );
                    }}
                    itemTemplate={(file:any, props) => {
                      return (
                        <div className="flex align-items-center flex-wrap">
                          <div className="flex align-items-center" style={{width: '40%'}}>
                            <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                            <span className="flex flex-column text-left ml-3">
                              {file.name}
                              <small>{  new Date().toLocaleDateString()}</small>
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
              <li  className='mb-1'>Factory Owner: {factoryOwner ? factoryOwner.name : 'Not selected'}</li>
              <li  className='mb-1'>Pre Certify Asset: {preCertifyAsset ? 'Yes' : 'No'}</li>
              <li  className='mb-1'>{salesAgreement ? 'Sales Agreement' : 'Contract'}: {salesAgreement ? (salesAgreementFile || 'Not uploaded') : (contract || 'Not uploaded')}</li>
              <li  className='mb-1'>Certificate: {certificate ? certificate.label : 'Not selected'}</li>
            </ul>
          </div>

          <Message severity="info" text="Need assistance? Contact the facility management team for help." />
        </div>
      </div>
    </Dialog>
  );
};

export default MoveToRoomDialog;