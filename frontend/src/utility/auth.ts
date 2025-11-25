
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

export const getAccessGroupData = async(token: string) => {
    try {
        const registryHeader = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await axios.post(`${FLEET_MANAGER_BACKEND_URL}/auth/decrypt-route`, {token, product_name: "Fleet Manager"}, {
            headers: registryHeader
        });
        await storeAccessGroup(response.data.data);
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

export const encryptRoute = async (
  token: string,
  productName: string,
  companyIfricId: string,
  route: string
) => {
  try {
    return await api.post(
      `${FLEET_MANAGER_BACKEND_URL}/auth/encrypt-route`,
      {
        token,
        product_name: productName,
        company_ifric_id: companyIfricId,
        route
      }
    );
  } catch (error: any) {
    if (
      error?.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      updatePopupVisible(true);
    } else {
      throw error;
    }
  }
};

export const getEncryptedCertificateRoute = async (assetIfricId: string): Promise<string | null> => {
  try {
    const accessGroup = await getAccessGroup();
    
    if (!accessGroup?.ifricdi || !accessGroup?.company_ifric_id) {
      console.error("No token or company_ifric_id found in IndexedDB");
      return null;
    }

    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
    let baseUrl: string;
    
    if (environment === "dev") {
      baseUrl = "https://dev-platform.industry-fusion.com";
    } else if (environment === "local") {
      baseUrl = "http://localhost:3003";
    } else {
      baseUrl = "https://platform.industry-fusion.com";
    }

    const route = `${baseUrl}/certificates?asset_ifric_id=${assetIfricId}`;

    const routeResponse = await encryptRoute(
      accessGroup.ifricdi,
      "Fleet Manager",
      accessGroup.company_ifric_id,
      route
    );

    const encryptedPath = routeResponse?.data?.path;
    if (!encryptedPath) {
      console.error("Failed to generate encrypted route path");
      return null;
    }

    return encryptedPath;
  } catch (error) {
    console.error("Error generating encrypted route path:", error);
    return null;
  }
};