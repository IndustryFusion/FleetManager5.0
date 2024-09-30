import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { useEffect, useState } from "react";
import CertificateCard from "@/components/settings/certificate-card";
import moment from "moment";
import { FaRegCalendar } from "react-icons/fa";
import axios from "axios";
import { getAccessGroup } from "@/utility/indexed-db";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import "../../../public/styles/certificates.css";
import { fetchCompanyCertificates, generateCompanyCertificate } from "@/utility/certificates";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const BACKEND_REGISTRY_API_URL =
  process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;

interface Certificate {
  id: string;
  company_ifric_id: string;
  expiry_on: string;
  created_on: string;
}

interface AccessGroupData {
  company_ifric_id: string;
  user_email: string;
}

const CompanyCertificates: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [accessGroupDBData, setAccessGroupDBData] =
    useState<AccessGroupData | null>(null);
  const [certificateData, setCertificateData] = useState<Certificate[]>([]);
  const [generateCertificateData, setGenerateCertificateData] = useState({
    company_ifric_id: "",
    expiry: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    user_email: "",
  });
  const [message, setMessage] = useState<{
    severity: "success" | "info" | "warn" | "error";
    text: string;
  } | null>(null);

  const handleDateChange = (e: { value: Date | Date[] }) => {
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

  


  const fetchCertificate = async (companyId: string) => {
    try {
      const response = await fetchCompanyCertificates(companyId);
      console.log("certificate response here", response?.data);
      
      setCertificateData(response?.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage({
          severity: "error",
          text: error.response.data.message || "Failed to fetch certificates",
        });
      } else {
        setMessage({ severity: "error", text: "An unexpected error occurred" });
      }
    }
  };

  const fetchAccessGroup = async () => {
    try {
      const data = await getAccessGroup();
      setAccessGroupDBData(data);
      setGenerateCertificateData((prev) => ({
        ...prev,
        company_ifric_id: data?.company_ifric_id || "",
        user_email: data?.user_email || "",
      }));
      return data?.company_ifric_id;
    } catch (error) {
      console.error("Failed to fetch access group:", error);
      setMessage({ severity: "error", text: "Failed to fetch company data" });
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const companyId = await fetchAccessGroup();
      console.log("companyId here", companyId);
      
      if (companyId) {
        await fetchCertificate(companyId);
      }
    } catch (error) {
      console.error("Error in fetching data:", error);
      setMessage({ severity: "error", text: "Failed to fetch initial data" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  
  const handleGenerateCertificate = async () => {
    setMessage(null);
    try {
      const response = await generateCompanyCertificate(generateCertificateData);

      if (response &&response.data.success === false) {
        setMessage({
          severity: "error",
          text: response.data.message || "Failed to generate certificate",
        });
      } else if (response && response.data.success === true) {
        setMessage({
          severity: "success",
          text: "Certificate generated successfully",
        });
        fetchData();
      } else {
        setMessage({
          severity: "warn",
          text: "Unexpected response from server",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage({
          severity: "error",
          text: error.response.data.message || "Failed to generate certificate",
        });
      } else {
        setMessage({ severity: "error", text: "An unexpected error occurred" });
      }
    }
  };

  return (
    <>
      <div className="mt-4 certificate-container" style={{width:"75%"}}>
        <div className="flex align-items-center">
          <div className="flex" style={{ gap: "2rem" }}>
            <div className="flex flex-column certificate-input-container -mt-1">
              <label className="certificate-label-text" htmlFor="companyID">
                Company ID
              </label>
              <InputText
                className="certificate-input mb-2"
                id="companyID"
                name="companyID"
                value={generateCertificateData.company_ifric_id}
                readOnly
              />
            </div>

            <div className="flex flex-column certificate-input-container">
              <label className="certificate-label-text" htmlFor="expiryDate">
                Expiry Date
              </label>
              <div className="flex-row" style={{ position: "relative" }}>
                <FaRegCalendar className="mr-5 calendar-icon" />
                <Calendar
                  className="mb-2"
                  id="calendar-24h"
                  value={date}
                  placeholder="Select expiry date"
                  showTime
                  onChange={handleDateChange}
                  dateFormat="yy-mm-dd"
                  hourFormat="24"
                />
                <Button
                  className="generate-cert-btn black_button_hover"
                  onClick={handleGenerateCertificate}
                >
                  Generate Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <Message
            severity={message.severity}
            text={message.text}
            className="-mt-1 mb-2"
          />
        )}

        <div className="certificate-card-container">
          {certificateData.length > 0 ? (
            certificateData.map((certificate, index) => (
              <CertificateCard
                certificate={certificate}
                key={`${certificate.id}-${certificate.created_on}-${index}`}
              />
            ))
          ) : (
            <Message
              severity="info"
              text="No certificates found."
              className="mt-2 "
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyCertificates;
