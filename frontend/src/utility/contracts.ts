
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



import axios from "axios";
import api from "./jwt";
import { updatePopupVisible } from "./update-popup";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL

export const getContracts =async(companyIfricId: string)=>{
try{
 const response = await api.get(`${BACKEND_API_URL}/contract/get-company-contract/${companyIfricId}`)
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

export const createBinding = async (data: Record<string, any>) => {
  try {
   const res = await api.post(
      `${BACKEND_API_URL}/binding`,
      data 
    );
    console.log(res, "CreateBinding response")
    return res;
  } catch (error: any) {
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
      return null;
    } else {
      throw error;
    }
  }
};

export const getAssignedContracts = async (
  binding_company_ifric_id: string,
  contract_company_ifric_id: string,
  asset_ifric_id: string
) => {

  try {
    console.log(
    "BindingIfricId",  binding_company_ifric_id, "CompanyIfricId",contract_company_ifric_id, "AssetFricId",asset_ifric_id
    )
    const res = await axios.get(

      `${BACKEND_API_URL}/binding/get-contract-details-by-binding-company/${binding_company_ifric_id}/${contract_company_ifric_id}/${asset_ifric_id}`,{
          headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        }
      }
    );
     console.log(res,"Response")
    return res;
   
  } catch (error: any) {
    if (error?.response && error?.response?.status === 401) {
      updatePopupVisible(true);
      return null;
    } else {
      throw error;
    }
  }
};