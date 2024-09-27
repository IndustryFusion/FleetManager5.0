import axios from 'axios';

const IFX_PLATFORM_BACKEND_URL = process.env.NEXT_PUBLIC_IFX_PLATFORM_BACKEND_URL;
const IFRIC_PLATFORM_BACKEND_URL = process.env.NEXT_PUBLIC_IFRIC_PLATFORM_BACKEND_URL;

export const generateAssetCertificate = async (assetData: {
  asset_ifric_id: string;
  expiry: string;
  user_email:string,
  company_ifric_id:string
}) => {
  try {
    const response = await axios.post(
      `${IFRIC_PLATFORM_BACKEND_URL}/certificate/create-asset-certificate`,
      assetData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("assetData",assetData)
    return response.data;
  } catch (error:any) {
    console.error("Error generating asset certificate:", error);
    throw new Error(error.response?.data?.message || "Error generating certificate");
  }
};

export const fetchAssetCertificates = async (assetIfricId: string, companyIfricId: string) => {
  try {
      console.log("IFX_PLATFORM_BACKEND_URL",IFX_PLATFORM_BACKEND_URL)
    const response = await axios.get(
      `${IFX_PLATFORM_BACKEND_URL}/certificate/get-asset-certificate`,
      {
        params: {
          asset_ifric_id: assetIfricId,
          company_ifric_id: companyIfricId
        }
      }
    );
    return response.data;
  } catch (error:any) {
    console.error("Error fetching asset certificates:", error);
    throw new Error(error.response?.data?.message || "Error fetching certificates");
  }
};