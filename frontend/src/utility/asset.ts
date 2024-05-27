
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

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;


    // Function to map the backend data to the Asset structure
    const mapBackendDataToAsset = (backendData: any[]): Asset[] => {

        return backendData.map((item: any) => {
            const newItem: any = {};
            Object.keys(item).forEach((key) => {
                if (key.includes("http://www.industry-fusion.org/schema#")) {
                    const newKey = key.replace(
                        "http://www.industry-fusion.org/schema#",
                        ""
                    );

                    if (item[key].type === "Property") {
                        newItem[newKey] = item[key].value
                    }
                    else if (item[key].type === "Relationship") {
                        newItem[newKey] = item[key].object
                    }
                }
                else {
                    if (key == "type" || key == "id" ) {
                        newItem[key] = item[key]
                    }else if(key=="templateId" ){
                        newItem[key] = item[key].value;
                    }
                }
            });
            return newItem;
        });
    };

export  const fetchAssets = async () => {
    try {
        const response = await axios.get(BACKEND_API_URL + "/asset", {
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
