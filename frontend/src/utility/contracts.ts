
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
import { updatePopupVisible } from "./update-popup";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL
const IFX_BACKEND_URL = process.env.NEXT_PUBLIC_IFX_BACKEND_URL

export const getTemplateByName = async (templateName: string) => {
    try {
      return await api.get(`${BACKEND_API_URL}/templates/template-name?name=${templateName}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    } catch (error: any) {
      if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        return null;
      } else {
        throw error;
      }
    }
};

export const getCompanyCertificate = async (company_ifric_id: string) => {
    try {
      return await api.get(`${BACKEND_API_URL}/certificate/get-company-certificates/${company_ifric_id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
      });
    } catch (error: any) {
      if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        return null;
      } else {
        throw error;
      }
    }
};

export const getTemplateByType = async (type: string) => {
    try {
        return await api.get(
            `${process.env.NEXT_PUBLIC_TEMPLATE_SANDBOX_BACKEND_URL}/templates/mongo-templates/type/${type}`, {
            headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            },
        });
    } catch (error: any) {
      if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        return null;
      } else {
        throw error;
      }
    }
};

export const createContract = async (dataToSend: Record<string,any>) => {
    try{
        return await api.post(`${IFX_BACKEND_URL}/contract`, dataToSend,{
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },  
        })
    }
    catch (error: any) {
        if (error?.response && error?.response?.status === 401) {
          updatePopupVisible(true);
          return null;
        } else {
          throw error;
        }
      }
}


export const getContracts =async(companyIfricId: string)=>{
try{
 const response = await api.get(`${IFX_BACKEND_URL}/contract/get-company-contract/${companyIfricId}`)
 return response.data
}
catch (error:any) {
    console.error("Error getting contracts:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(error.response?.data?.message || "Error getting contracts");
    }
  }
}

export const getContractDetails = async(contractIfricId:string)=>{
try{
    const response = await api.get(`${IFX_BACKEND_URL}/contract/${contractIfricId}`)
    return response.data
}catch (error:any) {
    console.error("Error getting contracts:", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw new Error(error.response?.data?.message || "Error getting contracts");
    }
  }
}

export const updateContractDetails = async(contractIfricId:string,dataToSend: Record<string,any>)=>{
    try{
        const response = await api.patch(`${IFX_BACKEND_URL}/contract/${contractIfricId}`,dataToSend,{
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },  
        })
        return response.data
    }catch (error:any) {
        console.error("Error updating contracts:", error);
        if (error?.response && error?.response?.status === 401) {
          updatePopupVisible(true);
        } else {
          throw new Error(error.response?.data?.message || "Error updating contracts");
        }
      }
    }

export const deleteContract = async(contractIfricId:string)=>{
  try{
    const response = await api.delete(`${IFX_BACKEND_URL}/contract/${contractIfricId}`);
    return response.data;
  }catch (error:any) {
        console.error("Error updating contracts:", error);
        if (error?.response && error?.response?.status === 401) {
          updatePopupVisible(true);
        } else {
          throw new Error(error.response?.data?.message || "Error deleteing contracts");
        }
      }
    }

    
    export const getContractTemplatesById = async (id: string) => {
      try {
          return await api.get(
              `${BACKEND_API_URL}/templates/contract/${id}`, {
              headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              },
          });
      } catch (error: any) {
        if (error?.response && error?.response?.status === 401) {
          updatePopupVisible(true);
          return null;
        } else {
          throw error;
        }
      }
    };

    export const getContractByType = async (type: string) => {
      try {
        console.log("type ",type);
        return await api.get(`${IFX_BACKEND_URL}/contract/get-contract-by-type/${type}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
        });
      } catch (error: any) {
        if (error?.response && error?.response?.status === 401) {
          updatePopupVisible(true);
          return null;
        } else {
          throw error;
        }
      }
  };
  export const getAssetByType = async (type: string) => {
    try {
      return await api.get(`${BACKEND_API_URL}/asset/type/${type}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
      });
    } catch (error: any) {
      if (error?.response && error?.response?.status === 401) {
        updatePopupVisible(true);
        return null;
      } else {
        throw error;
      }
    }
};

export const getAssetCertificateById = async (asset_ifric_id: string, company_ifric_id: string) => {
  try {
    return await api.get(
      `${BACKEND_API_URL}/certificate/get-asset-certificates`,
      {
        params: {
          asset_ifric_id,
          company_ifric_id
        }
      }
    );
  } catch (error: any) {
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
      return null;
    } else {
      throw error;
    }
  }
};
export const createBinding = async (data: Record<string, any>) => {
  try {
    return await api.post(
      `${IFX_BACKEND_URL}/binding`,
      data
    );
  } catch (error: any) {
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
      return null;
    } else {
      throw error;
    }
  }
};

export const getContractByTemplates = async () => {
  try {
      return await api.get(
          `${BACKEND_API_URL}/templates/get-contract-by-template`, {
          headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          },
      });
  } catch (error: any) {
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
      return null;
    } else {
      throw error;
    }
  }
};

export const getManufacturerAssets = async (company_ifric_id: string, type: string) => {
  try {
    const result: Record<string,any> = [];
    const response = await api.get(
      BACKEND_API_URL +
        `/asset/get-company-manufacturer-asset/${company_ifric_id}`,
      {
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
      }
    );
    if(response.data) {
      response.data.forEach((value: Record<string,any>) => {
        if(value.assetData.type === type) {
          result.push(value.assetData);
        }
      })
    }
    return result;
  } catch (error: any) {
    console.log("err from fetch asset ", error);
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
    } else {
      throw error;
    }
  }
};