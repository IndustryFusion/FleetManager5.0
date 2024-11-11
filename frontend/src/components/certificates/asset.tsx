import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { FaRegCalendar } from "react-icons/fa";
import moment from "moment";
import AssetCertificateCard from "./asset-certificate-card";
import {
  fetchAssetCertificates,
  generateAssetCertificate,
} from "@/utility/certificates";
import { getAccessGroup } from "@/utility/indexed-db";
import "../../../public/styles/certificates.css";

interface Certificate {
  id: string;
  asset_ifric_id: string;
  expiry_on: string;
  created_on: string;
}

const AssetsTab: React.FC<{ assetIfricId?: string | null }> = ({
  assetIfricId,
 
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [certificateData, setCertificateData] = useState<Certificate[]>([]);
  const [generateCertificateData, setGenerateCertificateData] = useState({
    asset_ifric_id: assetIfricId || "",
    company_ifric_id: "",
    expiry: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    user_email: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchInitialData = async () => {
    try {
      const accessGroupData = await getAccessGroup();
      setGenerateCertificateData((prev) => ({
        ...prev,
        company_ifric_id: accessGroupData?.company_ifric_id || "",
        user_email: accessGroupData?.user_email,
        asset_ifric_id: assetIfricId || prev.asset_ifric_id,
      }));

      if (assetIfricId && accessGroupData?.company_ifric_id) {
        await handleGetAssetCertificates(
          assetIfricId,
          accessGroupData.company_ifric_id
        );
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setErrorMessage("Failed to fetch initial data");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [assetIfricId]);

  const handleDateChange = (e: any) => {
    const selectedDate = e.value as Date;
    setDate(selectedDate);
    const formattedDate = moment(selectedDate)
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    setGenerateCertificateData((prev) => ({
      ...prev,
      expiry: formattedDate,
    }));
  };

  const handleGetAssetCertificates = async (
    asset_ifric_id: string,
    company_ifric_id: string
  ) => {
    if (!asset_ifric_id || !company_ifric_id) {
      setErrorMessage("Asset IFRIC ID and Company IFRIC ID are required");
      return;
    }

    try {
      const response = await fetchAssetCertificates(
        asset_ifric_id,
        company_ifric_id
      );
      console.log("response", response);

      if (response && response.success === false) {
        setErrorMessage(response.message);
        setCertificateData([]);
      } else if (Array.isArray(response)) {
        setCertificateData(response);
        setErrorMessage("");
      } else {
        setErrorMessage("Unexpected response format");
        setCertificateData([]);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setErrorMessage("Failed to fetch certificates");
      setCertificateData([]);
    }
  };

  const handleFetchCertificates = () => {
    const { asset_ifric_id, company_ifric_id } = generateCertificateData;
    if (asset_ifric_id && company_ifric_id) {
      handleGetAssetCertificates(asset_ifric_id, company_ifric_id);
    } else {
      setErrorMessage("Asset IFRIC ID and Company IFRIC ID are required");
    }
  };

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    setErrorMessage("");

    if (!generateCertificateData.asset_ifric_id) {
      setErrorMessage("Asset IFRIC ID is required");
      setIsGenerating(false);
      return;
    }

    if (!generateCertificateData.expiry) {
      setErrorMessage("Expiry date is required");
      setIsGenerating(false);
      return;
    }

    try {
      console.log("Generating certificate with data:", generateCertificateData);
      const response = await generateAssetCertificate(generateCertificateData);
      console.log("Certificate generation response:", response);

      if (response && response.success) {
        await handleGetAssetCertificates(
          generateCertificateData.asset_ifric_id,
          generateCertificateData.company_ifric_id
        );
      } else {
        setErrorMessage(response.message || "Failed to generate certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      setErrorMessage("Failed to generate certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-4 certificate-container">
      <div className="flex justify-content-between align-items-center">
        <div className="flex certificate-header-container" >
          <div className="certificate-input-container">
            <div className="certificate-label-row">
              <label className="certificate-label-text" htmlFor="assetID">
                Asset IFRIC ID
              </label>
              <Button
                icon="pi pi-angle-double-down"
                className="arrow-button"
                onClick={handleFetchCertificates}
                tooltip="Get Certificates"
                tooltipOptions={{ position: "top" }}
              />
            </div>
            <InputText
              className="certificate-input"
              id="assetID"
              name="assetID"
              value={generateCertificateData.asset_ifric_id}
              onChange={(e) =>
                setGenerateCertificateData((prev) => ({
                  ...prev,
                  asset_ifric_id: e.target.value,
                }))
              }
              // readOnly={!!assetIfricId}
            />
          </div>

          <div className="flex flex-column certificate-input-container">
            <label className="certificate-label-text" htmlFor="expiryDate">
              Expiry Date
            </label>
            <div
              className="flex align-items-center gap-2"
              style={{ position: "relative" }}
            >
              <FaRegCalendar className="mr-2 calendar-icon" />
              <Calendar
                className="mb-2"
                id="calendar-24h"
                value={date}
                onChange={handleDateChange}
                dateFormat="yy-mm-dd"
                showTime
                hourFormat="24"
              />
             
            </div>
          </div>
          <div>
          <Button
                label={isGenerating ? "Generating..." : "Generate Certificate"}
                onClick={handleGenerateCertificate}
                className="p-button-rounded p-button-black generate-cert-btn black_button_hover"
                disabled={isGenerating}
              />
          </div>
        </div>
      </div>

      {errorMessage && (
        <Message severity="error" text={errorMessage} className="-mt-1" />
      )}

      <div className="certificate-card-container mt-4">
        {certificateData.length > 0 ? (
          certificateData.map((certificate) => (
            <AssetCertificateCard
              key={`${certificate.id}-${certificate.created_on}`}
              certificate={certificate}
              
            />
          ))
        ) : (
          <Message
            severity="info"
            text="No Asset Certificates found."
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
};

export default AssetsTab;
