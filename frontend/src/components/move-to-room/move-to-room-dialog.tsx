import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Timeline } from 'primereact/timeline';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import '../../../public/styles/move-to-room.css';
import axios from 'axios';

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
  ifricId: string;
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}


const BACKEND_API_URL= process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const MoveToRoomDialog: React.FC<MoveToRoomDialogProps> = ({ assetName, ifricId, visible, onHide, onSave }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [factoryOwner, setFactoryOwner] = useState<Company | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [contract, setContract] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/get-all-company-data-by-category');
        const data: Company[] = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  const certificateOptions: Certificate[] = [
    { label: 'cert_HSA1_MIcrostep', value: 'cert_HSA1_MIcrostep' },
    { label: 'cert_HSA1_IFRIC', value: 'cert_HSA1_IFRIC' },
  ];

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/update-asset-room/${ifricId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryOwner: factoryOwner?.id,
          certificate: certificate?.value,
          contract,
        }),
      });

      if (response.ok) {
        onSave();
        onHide();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating asset assignment:', error);
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
      console.log("response",response)
      if (response.status === 201) {
        setContract(response.data); 
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
  };


  const timelineEvents = [
    { status: 'Selected Owner', subtext: 'Selected Factory Owner' },
    { status: 'Selected Contract', subtext: 'Contract mutually agreed' },
    { status: 'Selected Certificate', subtext: 'Certified by IFX - IFRIC' },
    { status: 'Assigned Owner', subtext: 'Asset Data Twin Transferred' },
  ];

  const customizedMarker = (item: any, index: number) => {
    return (
      <span 
        className={`custom-marker ${completedSteps[index] ? 'completed' : ''} ${index === activeIndex ? 'active' : ''}`}
      >
        {index + 1}
      </span>
    );
  };

  const customizedContent = (item: any, index: number) => {
    return (
      <div className={`custom-content ${completedSteps[index] ? 'completed' : ''} ${index === activeIndex ? 'active' : ''}`}>
        <h3>{item.status}</h3>
        <p>{item.subtext}</p>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return (
          <div className="field">
            <label htmlFor="factoryOwner">Factory Owner</label>
            <Dropdown 
              id="factoryOwner" 
              value={factoryOwner} 
              options={companies} 
              onChange={(e: DropdownChangeEvent) => setFactoryOwner(e.value)} 
              optionLabel="name"
              placeholder="Select a factory owner"
            />
          </div>
        );
       case 1:
        return (
          <div className="field">
            <label htmlFor="contract">Contract</label>
            <div className="p-inputgroup">
              <InputText 
                id="contract" 
                value={contract} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContract(e.target.value)} 
                placeholder="S3 link or file path" 
              />
              <Button icon="pi pi-cloud-upload" className="p-button-outlined" />
            </div>
            <div className="mt-2">
              <label>Attach contract</label>
              <FileUpload 
                ref={fileUploadRef}
                mode="basic" 
                name="contract" 
                url={BACKEND_API_URL + '/file'}
                accept="application/pdf" 
                maxFileSize={1000000} 
                auto
                chooseLabel="Select File"
                customUpload
                uploadHandler={handleFileUpload}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="field">
            <label htmlFor="certificate">Certificate</label>
            <Dropdown 
              id="certificate" 
              value={certificate} 
              options={certificateOptions} 
              onChange={(e: DropdownChangeEvent) => setCertificate(e.value)} 
              optionLabel="label"
              placeholder="Select a certificate"
            />
          </div>
        );
      case 3:
        return (
          <div>
            <h3>Confirm Asset Assignment</h3>
            <p>Please review the details below:</p>
            <ul>
              <li>Asset: {assetName}</li>
              <li>Factory Owner: {factoryOwner?.name}</li>
              <li>Contract: {contract}</li>
              <li>Certificate: {certificate?.label}</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (activeIndex < 3) {
      setCompletedSteps(prev => {
        const newCompleted = [...prev];
        newCompleted[activeIndex] = true;
        return newCompleted;
      });
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setCompletedSteps(prev => {
        const newCompleted = [...prev];
        newCompleted[activeIndex - 1] = false;
        return newCompleted;
      });
    }
  };

  const isNextDisabled = () => {
    switch (activeIndex) {
      case 0:
        return !factoryOwner;
      case 1:
        return !contract;
      case 2:
        return !certificate;
      default:
        return false;
    }
  };

  const dialogFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      {activeIndex > 0 && (
        <Button label="Back" icon="pi pi-arrow-left" onClick={handleBack} className="p-button-outlined" />
      )}
      {activeIndex < 3 && (
        <Button label="Next" icon="pi pi-arrow-right" onClick={handleNext} />
        // disabled={isNextDisabled()}
      )}
      {activeIndex === 3 && (
        <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
      )}
    </div>
  );

  return (
    <Dialog 
      header={assetName} 
      visible={visible} 
      style={{ width: '80vw' }} 
      footer={dialogFooter} 
      onHide={onHide}
      className="move-to-room-dialog"
    >
      <Toast ref={toast} />
      <div className="dialog-content">
        <div className="timeline-container">
          <Timeline 
            value={timelineEvents} 
            marker={customizedMarker} 
            content={customizedContent} 
            className={`custom-timeline ${completedSteps.map((step, index) => step ? `step-${index}-completed` : '').join(' ')}`}
          />
        </div>
        <div className="content-container">
          <p className="text-sm text-gray-500 mb-4">IFRIC ID: {ifricId}</p>
          {renderContent()}
          <Message severity="info" text="Need assistance? Contact the facility management team for help." />
        </div>
      </div>
    </Dialog>
  );
};

export default MoveToRoomDialog;