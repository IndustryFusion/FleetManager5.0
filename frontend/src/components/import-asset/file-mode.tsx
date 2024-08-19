import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { showToast } from '@/utility/toast';


interface FileImportDialogProps {
  visible: boolean;
  onHide: () => void;
  onImport: (file: File) => void;
}

const FileImportDialog: React.FC<FileImportDialogProps> = ({ visible, onHide, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useRef<Toast>(null);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      onImport(file);
    } else {
      showToast(toast, 'error', 'Error', 'Unsupported file extension, only Excel and CSV files are supported');
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleUpload();
    }
  }, [selectedFile]);

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        setUploadProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 1;
          if (progress > 100) progress = 100;
          setUploadProgress(progress);
          if (progress === 100) {
            clearInterval(interval);
            onHide();
            showToast(toast, 'success', 'Success', 'File uploaded successfully');
          }
        }, 200);
      } catch (error) {
        console.error('Error during file upload:', error);
        showToast(toast, 'error', 'Error', 'Failed to upload file');
      }
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/IFF-sample-data/IFF_Standard_Format.xlsx';
    link.download = 'IFF_Standard_Format.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(toast, 'info', 'Download Started', 'Sample file download initiated');
  };

  const headerContent = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-file-excel" style={{ fontSize: '1.5rem', color: '#4CAF50' }}></i>
      <span className="font-bold">Import Assets from Excel</span>
    </div>
  );

  return (
    <Dialog 
      header={headerContent} 
      visible={visible} 
      onHide={onHide}
      style={{ width: '50vw' }} 
      breakpoints={{ '960px': '75vw', '641px': '100vw' }}
    >
      <Toast ref={toast} />
      <div className="p-fluid">
        <div className="mb-4">
          <h3>Instructions</h3>
          <p>Download the sample file to see the required format, then upload your Excel or CSV file containing asset data.</p>
        </div>
        <Button 
          label="Upload from Computer" 
          icon="pi pi-upload" 
          onClick={() => fileInputRef.current?.click()} 
          className="p-button-outlined mb-3" 
        />
        <input 
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.xls"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        {selectedFile && (
          <div className="mt-2">
            <Tag value={selectedFile.name} icon="pi pi-file" severity="info" />
          </div>
        )}
        {uploadProgress > 0 && (
          <ProgressBar value={uploadProgress} showValue={false} style={{ height: '6px' }} />
        )}
        <Button 
          label="Download Sample File" 
          icon="pi pi-download" 
          onClick={handleDownload} 
          className="p-button-outlined p-button-success" 
        />
      </div>
    </Dialog>
  );
};

export default FileImportDialog;
