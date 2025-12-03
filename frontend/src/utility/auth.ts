
// 
// Copyright (c) 2024 IB Systems GmbH 
// 
// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 
// 
//   http://www.apache.org/licenses/LICENSE-2.0 
// 
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License. 
// 



import api from "./jwt";
import axios from "axios";
import { updatePopupVisible } from './update-popup';
import { jwtDecode, JwtPayload } from "jwt-decode";
import { storeAccessGroup, getAccessGroup } from "./indexed-db";

const FLEET_MANAGER_BACKEND_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

interface CustomJwtPayload extends JwtPayload {
    user: string;  
}

export const getCompanyDetailsById = async(company_id: string) => {
    try {
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-company-details/${company_id}`,{
            headers: {
              "Content-Type": "application/json",
            }         
        })
    
    } catch(error: any) {
        console.log('err from fetch company details by id ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getCompanyDetailsByRecordId = async(company_id: string) => {
    try {
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-company-details-id/${company_id}`,{
            headers: {
              "Content-Type": "application/json",
            }         
        })
    
    } catch(error: any) {
        console.log('err from fetch company details by record id ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getCompanyDetailsByIfricId = async(company_ifric_id: string) => {
    try {
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-company-details/${company_ifric_id}`,{
            headers: {
              "Content-Type": "application/json",
            }         
        })
    
    } catch(error: any) {
        console.log('err from fetch company details by ifric id',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const updateCompanyTwin = async(dataToSend: Record<string, any>) => {
    try {
        const ownerCertVerification = await verifyCompanyCertificate(dataToSend.owner_company_ifric_id);
        if(!ownerCertVerification?.data.status) {
            throw new Error('Owner Certificate is not verified');
        }
        const manufacturerCertVerification = await verifyCompanyCertificate(dataToSend.maufacturer_ifric_id);
        if(!manufacturerCertVerification?.data.status) {
            throw new Error('Manufacturer Certificate is not verified');
        }
        return await api.patch(
            `${FLEET_MANAGER_BACKEND_URL}/auth/update-company-twin`,
            dataToSend
        );
    } catch(error: any) {
        console.log('err from update company twin',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getCategorySpecificCompany = async(categoryName: string) => {
    try {
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-category-specific-company/${categoryName}`);
    } catch(error: any) {
        console.log('err from update company twin',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getAllCompanies = async () => {
  try {
    const response = await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-all-companies`);
    console.log("✅ API response: New Response", response.data);
    return response;
    } catch (error:any) {
    console.error("Error getting companies:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(error.response?.data?.message || "Error getting companies");
    }
  }
};

export const getAccessGroupData = async(token: string, from?: string) => {
    try {
        const registryHeader = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await axios.post(`${FLEET_MANAGER_BACKEND_URL}/auth/decrypt-route`, {token, product_name: "Fleet Manager"}, {
            headers: registryHeader
        });
        const loginData = {
            ...response.data.data,
            from: from
        };
        await storeAccessGroup(loginData);
        return { status: 200, message: "stored data successfully"}
    } catch(error: any) {
        throw error;
    }
}

export const verifyCompanyCertificate = async(company_ifric_id: string) => {
    try{
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/certificate/verify-company-certificate/${company_ifric_id}`);
    } catch(error: any){
        console.log("error getting company verification", error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const verifyAssetCertificate = async(company_ifric_id: string, asset_ifric_id: string) => {
    try{
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/certificate/verify-asset-certificate?asset_ifric_id=${asset_ifric_id}&company_ifric_id=${company_ifric_id}`);
    }
    catch(error: any){
        console.log("error getting asset verification", error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const verifyCompanyAssetCertificate = async(company_ifric_id: string, asset_ifric_id: string) => {
    try{
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/certificate/verify-company-asset-certificate/${company_ifric_id}/${asset_ifric_id}`);
    }
    catch(error: any){
        console.log("error getting asset verification", error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const generateAssetCertificate = async(dataToSend: Record<string, any>) => {
    try{
        return await api.post(`${FLEET_MANAGER_BACKEND_URL}/certificate/create-asset-certificate`, dataToSend)
    }
    catch(error: any){
        console.log("error getting asset verification", error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const fetchCompanyProduct = async (dataCompanyIfricId: string) => {
    try {
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-company-products/${dataCompanyIfricId}`,{
            headers: {
              "Content-Type": "application/json",
            },
        });
    
    } catch (error: any) {
        console.log('err from fetch company product ',error);
        if (error?.response && error?.response?.status === 401) {
          updatePopupVisible(true);
        } else {
          throw error;
        }
    }
};

export const getUserDetailsByEmail = async (dataToSend: Record<string, string>) => {
    try {
        return await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-user-details`, {
            headers: {
              "Content-Type": "application/json",
            },
            params: dataToSend,
        });

    } catch (error: any) {
        console.log('err from updating company user ',error);
        if (error?.response && error?.response?.status === 401) {
          updatePopupVisible(true);
        } else {
          throw error;
        }
    }
};

export const authenticateToken = async (token: string) => {
  try {
    const response = await api.get(`${FLEET_MANAGER_BACKEND_URL}/auth/authenticate-token/${token}`);
    return response.data;
  } catch(error: any) {
    throw error;
  }
}

/**
 * Encrypts a route for secure navigation between platform products
 * 
 * @param {string | undefined} environment - Environment ('dev', 'local', or production)
 * @param {string} pageName - Target page path (e.g., '/dashboard', '/certificates')
 * @param {string} productName - Product name ('Fleet Manager', 'DPP Creator', 'IFX Platform')
 * @param {string} [assetIfricId] - Optional asset IFRIC ID
 * @param {Function} [t] - Optional translation function for error messages
 * @returns {Promise<{success: boolean, url?: string, errorMessage?: string}>} Result object with success status, URL, and error message
 */
export const encryptRoute = async (
  environment: string | undefined,
  pageName: string,
  productName: string,
  t?: (key: string) => string
) => {
  try {
    const accessGroup = await getAccessGroup();
    
    if (!accessGroup?.ifricdi || !accessGroup?.company_ifric_id) {
      const errorMessage = t ? t('common:auth.missingAccessGroup') : "No token or company_ifric_id found in IndexedDB";
      console.error(errorMessage);
      return { success: false, errorMessage };
    }

    const baseUrl = getBaseUrl(environment, productName);
    let route = `${baseUrl}${pageName}`;
    

    const response = await api.post(
      `${FLEET_MANAGER_BACKEND_URL}/auth/encrypt-route`,
      {
        token: accessGroup.ifricdi,
        product_name: productName,
        company_ifric_id: accessGroup.company_ifric_id,
        route
      }
    );

    const encryptedPath = response?.data?.path;
    if (!encryptedPath) {
      const errorMessage = t ? t('common:auth.encryptionFailed') : "Failed to generate encrypted route path";
      console.error(errorMessage);
      return { success: false, errorMessage };
    }

    return { success: true, url: encryptedPath };
  } catch (error: any) {
    if (
      error?.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      updatePopupVisible(true);
    } else {
      const errorMessage = t ? t('common:auth.routeError') : "Error encrypting route";
      console.error(`${errorMessage}:`, error);
      return { success: false, errorMessage };
    }
    return { success: false, errorMessage: t ? t('common:auth.routeError') : "Error encrypting route" };
  }
};

export const getBaseUrl = (environment: string | undefined, productName: string): string => {
  switch (productName) {
    case "DPP Creator":
      if (environment === "dev") {
        return "https://dev-platform.industry-fusion.com";
      } else if (environment === "local") {
        return "http://localhost:3003";
      } else {
        return "https://platform.industry-fusion.com";
      }
    case "IFX Platform":
      if (environment === "dev") {
        return "https://dev-platform.industryfusion-x.org";
      } else if (environment === "local") {
        return "http://localhost:3008";
      } else {
        return "https://platform.industryfusion-x.org";
      }
    case "Contract Manager":
      if (environment === "dev") {
        return "https://dev-contract.industryfusion-x.org";
      } else if (environment === "local") {
        return "http://localhost:3020";
      } else {
        return "https://contract.industryfusion-x.org";
      }
    case "Fleet Manager":
      if (environment === "dev") {
          return "https://dev-fleet.industry-fusion.com";
      } else if (environment === "local") {
          return "http://localhost:3001";
      } else {
          return "https://fleet.industry-fusion.com";
      }
    case "Factory Manager":
      if (environment === "dev") {
        return "https://dev-factory.industry-fusion.com";
      } else if (environment === "local") {
        return "http://localhost:3002";
      } else {
        return "https://factory.industry-fusion.com";
      }
    default:
      if (environment === "dev") {
        return "https://dev-fleet.industry-fusion.com";
      } else if (environment === "local") {
        return "http://localhost:3001";
      } else {
        return "https://fleet.industry-fusion.com";
      }
  }
};