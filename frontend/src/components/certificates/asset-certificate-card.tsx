import React, { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { formatDateTime } from "@/utility/certificate";
import { getAssetById } from "@/utility/asset";
import "../../../public/styles/certificates.css";
import { Tooltip } from "primereact/tooltip";

interface Certificate {
  asset_ifric_id: string;
  expiry_on: string;
  created_on: string;
  certificate_data?: string;
}

const AssetCertificateCard: React.FC<{ certificate: Certificate | null,  isSidebarExpand: boolean }> = ({ certificate, isSidebarExpand }) => {
  const [productName, setProductName] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!certificate) {
        setError("No certificate data available");
        setProductName("N/A");
        return;
      }

      try {
        const asset = await getAssetById(certificate?.asset_ifric_id);
        if (asset && asset?.product_name) {
          setProductName(asset?.product_name);
        } else {
          setProductName("N/A");
        }
      } catch (error) {
        console.error("Error fetching asset details:", error);
        setError("Failed to fetch product name");
        setProductName("Error");
      }
    };

    fetchAssetDetails();
  }, [certificate]);

  if (!certificate) {
    return <div>No certificate data available</div>;
  }

  const handleDownload = () => {
    // Create a Blob from the certificate data (PEM format)
    const blob = new Blob([certificate?.certificate_data], { type: 'application/x-pem-file' });
  
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    
    const date = certificate.created_on.includes("T") ? certificate.created_on.split("T")[0] : certificate.created_on;
    // Set the download file name
    downloadLink.download = `${certificate.asset_ifric_id}-${date}.pem`;
  
    // Trigger the download
    downloadLink.click();
  
    // Clean up the URL object
    URL.revokeObjectURL(downloadLink.href);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(certificate?.certificate_data)
        .then(() => {
          console.log('Certificate data copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
        });
    } else {
      console.error('Clipboard API is not supported');
    }
  };

  const checkExpiry = (expiry_on: string) => {
    const currentDate = new Date();
    const expiryDate = new Date(expiry_on);
    return expiryDate < currentDate;
  };

  const isExpired = checkExpiry(certificate.expiry_on);

  return (
    <div className={isSidebarExpand?"certificate-card":"certificate-card-collapse"}>
      <div className="flex justify-content-between align-items-center certificate-header">
        <div className="flex gap-1">
          <img
            src="/certificate-img.svg"
            alt="profile-image"
            className="certificate-icon"
          />
          <div className="mt-2">
            <p className="m-0 certificate-name">Certificate Of Company</p>
          </div>
        </div>
        <span
          className={
            isExpired ? "certificate-inactive" : "certificate-active"
          }
        >
          {isExpired ? "Inactive" : "Active"}
        </span>
      </div>
      <div className="certificate-content">
        <div className="flex justify-content-between mt-4">
          <div>
            <p className="certificate-text">Product Name</p>
            <p className="certificate-value">{productName}</p>
          </div>
        </div>
        <div className="flex justify-content-between mt-1">
          <div>
            <p className="certificate-text">Created on</p>
            <p className="certificate-value">{formatDateTime(certificate.created_on)}</p>
          </div>
          <div>
            <p className="certificate-text">Expiry On</p>
            <p className="certificate-value">{formatDateTime(certificate.expiry_on)}</p>
          </div>
        </div>
      </div>
      <div className={`flex gap-3 justify-content-around ${isExpired ? "certificate-inactive-footer" : "certificate-footer"}`}>
      <Tooltip target=".certificate-btn, .certificate-inactive-btn" />
        <button className={isExpired ? "certificate-inactive-btn" : "certificate-btn"}
        data-pr-tooltip="Copy certificate data"
        data-pr-position="bottom"
        onClick={() => handleCopy()}
        >
          <FiCopy /> Copy
        </button>
        <button className={isExpired ? "certificate-inactive-btn" : "certificate-btn"}
        data-pr-tooltip="Download certificate data"
        data-pr-position="bottom"
        onClick={() => handleDownload()}
        >
          <i className={`pi pi-download ${isExpired ? "download-inactive" : "download-active"}`} />
          Download
        </button>
      </div>
    </div>
  );
};

export default AssetCertificateCard;