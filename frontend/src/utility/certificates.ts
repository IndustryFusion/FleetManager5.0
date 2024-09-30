
import api from "./jwt";
import { updatePopupVisible } from './update-popup';

const FLEET_BACKEND_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const IFRIC_REGISTRY_BACKEND_URL = process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;




export const fetchCompanyCertificates = async (companyId: string) => {
  console.log("api here", api);
  console.log("companyId in utility", companyId);
  
  try {
    return await api.get(`${FLEET_BACKEND_URL}/certificate/get-company-certificates/${companyId}`);
  } catch (error:any) {
    console.error("Error fetching company certificates:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(error.response?.data?.message || "Error fetching certificates");
    }
  }
};

export const generateCompanyCertificate = async (generateCertificateData: Record<string, any>) => {
  try {
    return await api.post(`${FLEET_BACKEND_URL}/certificate/create-company-certificate`, generateCertificateData);
  } catch (error:any) {
    console.error("Error generating asset certificate:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(error.response?.data?.message || "Error generating certificate");
    }
  }
};

