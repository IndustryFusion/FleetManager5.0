
import "../../../public/styles/certificate-card.css"
 import { formatDateTime } from "@/utility/certificate";
import axios from "axios";
import { Tooltip } from "primereact/tooltip";
import { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";

const REGISTRY_API_URL =process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;

const CertificateCard:React.FC<any> =({certificate})=>{
    const [createdUser, setCreatedUser]= useState("");

    const checkExpiry = (expiry_on: string ) => {
        const currentDate = new Date(); 
        const expiryDate = new Date(expiry_on); 
        const isNotExpired = expiryDate < currentDate;
        return isNotExpired;
      };
      let expiry_on = checkExpiry(certificate?.expiry_on) ;

     const fetchUserDetails = async() => {
        try {
          const response = await axios.get(`${REGISTRY_API_URL}/auth/get-user-details/${certificate?.user_id}`,{
            headers: {
              "Content-Type": "application/json",
            }         
         })
         const [{user_name}]=response.data;
         setCreatedUser(user_name)
         
         }
            catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                  throw error.response.data;
                }
                throw new Error("Server Error");
              }
          }
    
      const handleDownload = async () => {
        let company_ifric_id = "";
        try {
            const response = await axios.get(`${REGISTRY_API_URL}/auth/get-company-details-id/${certificate?.company_id}`,{
              headers: {
                "Content-Type": "application/json",
              }         
          })
          if(response.data) {
            company_ifric_id = response.data[0].company_ifric_id;
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            throw error.response.data;
          }
          throw new Error("Server Error");
        }

        // Create a Blob from the certificate data (PEM format)
        const blob = new Blob([certificate.certificate_data], { type: 'application/x-pem-file' });
      
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        
        const date = certificate.created_on.includes("T") ? certificate.created_on.split("T")[0] : certificate.created_on;
        // Set the download file name
        downloadLink.download = `${company_ifric_id}-${date}.pem`;
      
        // Trigger the download
        downloadLink.click();
      
        // Clean up the URL object
        URL.revokeObjectURL(downloadLink.href);
      };

      const handleCopy = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(certificate.certificate_data)
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

     useEffect(()=>{
        fetchUserDetails();
     },[])


    return (
      <>
        <div className="certificate-card">
          <div className="flex  justify-content-between align-items-center certificate-header">
            <div className="flex gap-1">
              <img
                src="/certificate-img.png"
                alt="profile-image"
                className="profile-picture"
              />
              {/* <div className="certificate_avatar" style={{backgroundColor:"grey"}}>DL</div> */}
              <div className="mt-2">
                <p className="m-0 certificate-name">Certificate Of Company</p>
              </div>
            </div>
            <span
              className={
                expiry_on ? "certificate-inactive" : "certificate-active"
              }
            >
              {expiry_on ? "Inactive" : "Active"}
            </span>
          </div>
          <div className="certificate-content">
            <div className="flex justify-content-between  mt-4">
              <div>
                <p className="certificate-text">Created User</p>
                <p className="certificate-value">{createdUser}</p>
              </div>
            </div>
            <div className="flex justify-content-between mt-1">
              <div>
                <p className="certificate-text">Created on</p>
                <p className="certificate-value">{formatDateTime(certificate?.created_on)}</p>
              </div>
              <div>
                <p className="certificate-text">Expiry On</p>
                <p className="certificate-value">{formatDateTime(certificate?.expiry_on)}</p>
              </div>
            </div>
          </div>
          <div
            className={`flex gap-3 justify-content-around ${
              expiry_on ? "certificate-inactive-footer" : "certificate-footer"
            }`}
          >
            <Tooltip target=".certificate-btn, .certificate-inactive-btn" />
            <button className={
                expiry_on ? "certificate-inactive-btn" : "certificate-btn"
              }
              data-pr-tooltip="Copy certificate data"
              data-pr-position="bottom" 
              onClick={() => handleCopy()}
              >
              <FiCopy /> Copy{" "}
            </button>
            <button className={
                expiry_on ? "certificate-inactive-btn" : "certificate-btn"
              }
              data-pr-tooltip="Download certificate data"
              data-pr-position="bottom"
              onClick={() => handleDownload()}
              >
              {" "}
              <i
                
                className={`pi pi-download ${
                    expiry_on ? "download-inactive" : "download-active"
                  }`}
                
              />
              Download
            </button>
          </div>
        </div>
      </>
    );
}

export default CertificateCard;