
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
import { storeAccessGroup } from "./indexed-db";

const REGISTRY_API_URL =process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;
const FLEET_MANAGER_BACKEND_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

interface CustomJwtPayload extends JwtPayload {
    user: string;  
}

export const fetchUserDetailsForRecoverPassword = async(email: string) => {
    try {
    const url = `${REGISTRY_API_URL}/auth/get-user-details-by-email-recover-password/${email}`;
    // Fetch user data
    const response = await axios.get(url, {
    headers: {
        "Content-Type": "application/json",
    }});
    return response.data;
    } catch(error: any) {
        console.log('err from update user details by email ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const fetchUserDetails = async(email: string) => {
    try {
    
    const url = `${REGISTRY_API_URL}/auth/get-user-details-by-email/${email}`;

    // Fetch user data
    const response = await api.get(url, {
    headers: {
        "Content-Type": "application/json",
    }});

    return response.data;
    } catch(error: any) {
        console.log('err from update user details by email ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const updateUserAccessGroup = async(userId: string | string[] | undefined, userData: Record<string, any>) => {
    try {
    return await api.patch(`${REGISTRY_API_URL}/auth/update-user-access-group/${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
        },
    })

    } catch(error: any) {
        console.log('err from update access group ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getUserDetails = async(userId: string | string[] | undefined) => {
    try {
        return await api.get(`${REGISTRY_API_URL}/auth/get-user-details/${userId}`,{
            headers: {
            "Content-Type": "application/json",
            },
        });
    
    } catch(error: any) {
        console.log('err from fetch user details by id ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getUserProductAccess = async(userId: string | string[] | undefined) => {
    try {
        return await api.get(`${REGISTRY_API_URL}/auth/get-user-product-access/${userId}`,{
            headers: {
              "Content-Type": "application/json",
            },
        });

    } catch(error: any) {
        console.log('err from fetch user details by id ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getCompanyAccessGroup = async(company_ifric_id: string) => {
    try {
        return await api.get(`${REGISTRY_API_URL}/auth/get-company-access-group/${company_ifric_id}`,{
            headers: {
              "Content-Type": "application/json",
            },
        });
    
    } catch(error: any) {
        console.log('err from fetch user company access group ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getAccessGroupById = async(access_group_id: string) => {
    try {
        return await api.get(`${REGISTRY_API_URL}/auth/get-access-group/${access_group_id}`,{
            headers: {
              "Content-Type": "application/json",
            },
        })
    
    } catch(error: any) {
        console.log('err from fetch access group by id ',error);
        if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        } else {
        throw error;
        }
    }
}

export const getCompanyDetailsById = async(company_id: string) => {
    try {
        return await api.get(`${REGISTRY_API_URL}/auth/get-company-details/${company_id}`,{
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
        return await api.get(`${REGISTRY_API_URL}/auth/get-company-details-id/${company_id}`,{
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
        return await api.get(`${REGISTRY_API_URL}/auth/get-company-details/${company_ifric_id}`,{
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

export const updateCompanyDetails = async(company_ifric_id: string, dataToSend: Record<string, any>) => {
    try {
        return await api.patch(
            `${REGISTRY_API_URL}/auth/update-company/${company_ifric_id}`,
            dataToSend,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
        );
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
            `${REGISTRY_API_URL}/auth/update-company-twin`,
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
        return await api.get(`${REGISTRY_API_URL}/auth/get-category-specific-company/${categoryName}`);
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
    const response = await api.get(`${REGISTRY_API_URL}/auth/get-all-companies`);
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
        const response = await axios.post(`${FLEET_MANAGER_BACKEND_URL}/auth/get-indexed-db-data`, {token, product_name: "Fleet Manager"}, {
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
        return await api.get(`${REGISTRY_API_URL}/auth/get-company-products/${dataCompanyIfricId}`,{
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
        return await api.get(`${REGISTRY_API_URL}/auth/get-user-details`, {
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