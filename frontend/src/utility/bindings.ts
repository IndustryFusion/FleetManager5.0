import axios from "axios";
import api from "./jwt";
import { updatePopupVisible } from "./update-popup";
import { Asset } from "@/types/asset-types";

const IFX_BACKEND_URL = process.env.NEXT_PUBLIC_IFX_BACKEND_URL;
const IFRIC_REGISTRY_BACKEND_URL = process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL

export const getBindings = async (companyIfricId: string) => {
  try {
    const response = await api.get(
      `${IFX_BACKEND_URL}/binding/get-company-binding/${companyIfricId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error getting contracts:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(
        error.response?.data?.message || "Error getting bindings"
      );
    }
  }
};

export const getBindingDetails = async (bindingIfricId: string) => {
  try {
    const response = await api.get(
      `${IFX_BACKEND_URL}/binding/${bindingIfricId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error getting contracts:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(
        error.response?.data?.message || "Error getting binding details"
      );
    }
  }
};

export const getContractData = async (contractId: string) => {


  try {
    const response = await axios.get(
      `${IFX_BACKEND_URL}/contract/get-contract-by-record/${contractId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error getting contract:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(
        error.response?.data?.message || "Error getting contract details"
      );
    }
  }
};

export const updateBindingDetails = async (
  bindingIfricId: string,
  dataToSend: Record<string, any>
) => {
  try {
    const response = await api.patch(
      `${IFX_BACKEND_URL}/binding/${bindingIfricId}`,
      dataToSend,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating binding:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(
        error.response?.data?.message || "Error updating binding"
      );
    }
  }
};

export const deleteBinding = async (bindingIfricId: string) => {
  try {
    const response = await api.delete(
      `${IFX_BACKEND_URL}/binding/${bindingIfricId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error deleting binding:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(
        error.response?.data?.message || "Error deleting binding"
      );
    }
  }
};

export const getCompanyDetails =async(companyIfricId:string)=>{
 try{
  const response =  await api.get(`${IFRIC_REGISTRY_BACKEND_URL}/auth/get-company-details/${companyIfricId}`);
  return response.data;
 }catch(error: any) {
  console.error("Error fetching company details:", error);
  if (error?.response && error?.response?.status === 401) {
    updatePopupVisible(true);
  } else {
    throw new Error(
      error.response?.data?.message || "Error fetching company details"
    );
  }
}
}

export const getSharedWithBindingCompanies =async(bindingIfricId: string)=>{
  try{
    const response = await api.get(`${IFX_BACKEND_URL}/binding/get-signed-company-by-binding-id/${bindingIfricId}`);
    return response.data;
  }
  catch(error: any) {
    console.error("Error fetching company details:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(
        error.response?.data?.message || "Error fetching company details"
      );
    }
  }
}






