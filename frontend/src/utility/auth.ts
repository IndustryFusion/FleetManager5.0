
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

const REGISTRY_API_URL =process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;

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