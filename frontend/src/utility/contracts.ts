import { updatePopupVisible } from './update-popup';
import api from "./jwt";

const IFX_PLATFORM = process.env.NEXT_PUBLIC_IFX_PLATFORM_BACKEND_URL;

export const getContracts =async(companyIfricId: string)=>{
try{
 const response = await api.get(`${IFX_PLATFORM}/contract/get-company-contract/${companyIfricId}`)
 return response.data
}
catch (error:any) {
    console.error("Error generating asset certificate:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(error.response?.data?.message || "Error generating certificate");
    }
  }
}