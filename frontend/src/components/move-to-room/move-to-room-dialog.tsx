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

interface Company {
  id: string;
  name: string;
}

interface Certificate {
  label: string;
  value: string;
}

interface MoveToRoomDialogProps {
  assetName: string;
  company_ifric_id: string;
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}

interface OwnerDetails {
  name: string;
  companyIfric: string;
  certifiedCompany: string;
  role: string;
  country: string;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const IFRIC_REGISTRY_BACKEND_URL = process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;

const MoveToRoomDialog: React.FC<MoveToRoomDialogProps> = ({ assetName, company_ifric_id, visible, onHide, onSave }) => {
  const [factoryOwner, setFactoryOwner] = useState<Company | null>(null);
  const [factoryOwners, setFactoryOwners] = useState<Company[]>([]);
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

  const hardCodedOwnerDetails: { [key: string]: OwnerDetails } = {
    'owner1': {
      name: 'ABC Manufacturing',
      companyIfric: 'IFRIC-123456789',
      certifiedCompany: 'ABC Certified Corp',
      role: 'Factory Owner',
      country: 'UK'
    },
    'owner2': {
      name: 'XYZ Industries',
      companyIfric: 'IFRIC-987654321',
      certifiedCompany: 'XYZ Certified Ltd',
      role: 'Factory Owner',
      country: 'Germany'
    },
    'owner3': {
      name: 'Global Tech Solutions',
      companyIfric: 'IFRIC-456789123',
      certifiedCompany: 'Global Certified Inc',
      role: 'Factory Owner',
      country: 'Poland'
    }
  };

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
      const response = await axios.patch(
        `${IFRIC_REGISTRY_BACKEND_URL}/auth/update-company-product/${company_ifric_id}`,
        {
          factoryOwner: factoryOwner?.id,
          certificate: certificate?.value,
          contract: salesAgreement ? salesAgreementFile : contract,
          product_name: assetName,
          preCertifyAsset
        }
      );

      if (response.status === 200) {
        onSave();
        onHide();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating asset assignment:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update asset assignment' });
    }
  };

  const handleFactoryOwnerChange = (e: DropdownChangeEvent) => {
    setFactoryOwner(e.value);
    if (e.value && e.value.id in hardCodedOwnerDetails) {
      setOwnerDetails(hardCodedOwnerDetails[e.value.id]);
    } else {
      setOwnerDetails(null);
    }
  };

  const fetchFactoryOwners = async () => {
    try {
      // Simulating API call with hard-coded data
      const hardCodedFactoryOwners = [
        { id: 'owner1', name: 'ABC Manufacturing' },
        { id: 'owner2', name: 'XYZ Industries' },
        { id: 'owner3', name: 'Global Tech Solutions' }
      ];
      setFactoryOwners(hardCodedFactoryOwners);
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
      const response = await axios.post(BACKEND_API_URL + '/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 201) {
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
      <p className="text-sm text-gray-500">{company_ifric_id}</p>
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
                <OwnerDetailsCard owner={ownerDetails} />
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