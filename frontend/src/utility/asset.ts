
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

import { Asset } from "@/interfaces/assetTypes";
import axios from "axios";
import {EClassProperty,EClassResponse,FilteredEClassData} from "../interfaces/e-class"
import { FilteredGeneralDataSchema } from "@/interfaces/schema-general";
import * as XLSX from 'xlsx';
import { fetchAssetsRedux } from "@/redux/asset/assetsSlice";
import { fetchTemplates } from "@/redux/templates/templatesSlice";
import { fetchModelObjects } from "@/redux/model-objects/modelObjectsSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { RefObject, useEffect } from "react";
import { showToast } from "./toast";
import { Toast } from "primereact/toast";
import Papa from 'papaparse';

interface ModelObjectData {
  [key: string]: any;
}
const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

    export const getCompanyIfricId = (): string => {
    if (typeof window !== 'undefined' && localStorage.getItem('company_ifric_id')) {
        return localStorage.getItem('company_ifric_id') as string;
    }
    return "";
    };

    // Function to map the backend data to the Asset structure
    export const mapBackendDataToAsset = (backendData: any[]): Asset[] => {
        return backendData.map((item: any) => {
        const newItem: any = {};
        Object.keys(item).forEach((key) => {
            if (key.includes("/")) {
            const newKey = key.split('/').pop() || '';
                if(item[key].type === "Property") {
                newItem[newKey] = item[key].value
                }
                else if (item[key].type === "Relationship") {
                    newItem[newKey] = item[key].object
                }
                }
                else {
                if (key == "type" || key == "id" ) {
                    newItem[key] = item[key]
                } else if(key=="templateId" ){
                    newItem[key] = item[key].value;
                    }
                }
            });
            return newItem;
        });
    };

    export const fetchAssets = async () => {
    try {
        const companyIfricId = getCompanyIfricId();
        console.log('companyIfricId ',companyIfricId);
        const response = await axios.get(BACKEND_API_URL + `/asset/${companyIfricId}`, {
        headers: {
            "Content-Type": "application/ld+json",
            "Accept": "application/ld+json"
            }
        });
        const responseData = response.data;
        const mappedData = mapBackendDataToAsset(responseData);
        return mappedData;
        } catch (error:any) {
            console.error("Error:", error);  
        }
    };

    export const importExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
    };

    export const importCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
        const csv = event.target?.result as string;
        Papa.parse(csv, {
            header: true,
            complete: (results) => resolve(results.data),
            error: (error: any) => reject(error),
        });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
    };

    export const prefixJsonKeys = (json: any[]): any[] => {
    return json.map((item) => {
        const prefixedItem: any = {};
        for (const key in item) {
        if (item.hasOwnProperty(key)) {
            prefixedItem[`${key}`] = item[key];
        }
        }
        return prefixedItem;
    });
    };

    export const postJsonData = async (data: any, toast: RefObject<Toast>) => {
    try {
        console.log("data posjjson",data)
        const base64EncodedType = btoa(data.type);
        const response = await axios.post(
        `${BACKEND_API_URL}/asset/${base64EncodedType}`,
        data,
        {
            headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            },
            withCredentials: true,
        }
        );
        if (response.status === 201 && response.data.success ===true ) {
        showToast(toast, 'success', 'Success', 'Data posted successfully');
        } else {
        showToast(toast, 'error', 'Error', 'Failed to post data');
        }
    } catch (error) {
        showToast(toast, 'error', 'Error', 'Error posting data');
        console.error(error);
    }
    };

    export const createModelObject = async (
    data: ModelObjectData,
    toast: RefObject<Toast>
    ): Promise<void> => {
    try {
        const formattedData = {
        type: data.type,
        company_id:getCompanyIfricId(),
        product_name: data.properties.product_name,
        properties: data
        };
        console.log("formattedData",formattedData)
        const response = await axios.post(
        `${BACKEND_API_URL}/model-object/`,
        formattedData,
        {
            headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            },
            withCredentials: true,
        }
        );
        if (response.status === 201) {
        showToast(toast, 'success', 'Success', 'Model object created successfully');
        return response.data;
        } else {
        showToast(toast, 'error', 'Error', 'Failed to create model object');
        throw new Error('Failed to create model object');
        }
    } catch (error) {
        showToast(toast, 'error', 'Error', 'Error creating model object');
        console.error('Error creating model object:', error);
        throw error;
    }
    };
