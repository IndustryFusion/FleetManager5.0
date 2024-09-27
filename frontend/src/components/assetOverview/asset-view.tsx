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

import React, { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import 'primereact/resources/themes/saga-blue/theme.css';  
import { TabPanel, TabView } from "primereact/tabview";
import { Asset } from "@/interfaces/assetTypes";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast, ToastMessage } from "primereact/toast";
import "../../../public/styles/asset-view.css"
import { useTranslation } from "next-i18next";
import { fetchTemplateByName } from "@/utility/templates";
interface AssetDetailsCardProps {
  asset: Asset | null;
  setShowExtraCard: any;
  templateId?: any;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

export default function AssetDetailsCard({ asset, setShowExtraCard }: AssetDetailsCardProps) {
  const [templateKeys, setTemplateKeys] = useState<string[]>([]);
  const toast = useRef<any>(null);
  const { t } = useTranslation('overview');
  const showToast = (severity: ToastMessage['severity'], summary: string, message: string) => {
    toast.current?.show({ severity: severity, summary: summary, detail: message, life: 8000 });
  };


  useEffect(() => {
    const fetchSchema = async () => {
      try {
        if(asset && asset.asset_category) {
          const response = await fetchTemplateByName(asset.asset_category);
          setTemplateKeys(Object.keys(response?.data?.[0]?.properties));
        }
      } catch (error: any) {
        console.error(error);
        showToast('error', "Error", 'Fetching template schema');
      }
    }
    fetchSchema();
  }, []);

  const renderGeneralContent = (): JSX.Element => {
    let visibleRowIndex = 0; // Initialize a counter for visible rows
    let generalObject : {[key: string] :string} = {
      id: asset ? asset.id : '',
      type: asset ? asset.type : ''
    }
    for (let key of templateKeys) {
      let actualKey = key ? key.split(':').pop() : '';
      if (asset && actualKey && !key.includes("has") && !key.includes("eclass") && typeof asset[actualKey as keyof Asset ] !== "number") {
        generalObject[actualKey] = asset[actualKey as keyof Asset] as string;
      }
    }
    return (
      <div key={asset?.id} className="tab-content">
        {generalObject && Object.entries(generalObject).map(([key, value]) => {
          // Determine row class based on the count of visible rows
          const rowClass = visibleRowIndex % 2 === 0 ? 'list-row-even' : 'list-row-odd';
          visibleRowIndex++; // Increment the visible row index
          return (
            <ul key={key} style={{ listStyleType: 'none', padding: 0, margin: 0 }} >
              <li className={`py-2 px-2 ${rowClass}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="flex justify-content-between align-items-center" style={{ width: '100%', padding: '1vh 2vw' }}>
                    <div className="flex align-items-center">
                      <label className="text-900 font-medium -ml-4 ">
                        {key.split("_").map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ")}
                      </label>
                    </div>
                    <span className="text-900" style={{marginLeft: "13rem"}}>{value}</span>
                </div>
              </li>
            </ul>
          )
      })}
      </div>
    );
  };

  const renderEclassContent = (): JSX.Element => {
    let visibleRowIndex = 0; 
    let realtimeObject:Record<string, string> = {};
    for (let key of templateKeys) {
      let actualKey = key ? key.split(':').pop() : '';
      if ((asset && actualKey) && key.includes("eclass")) {
        realtimeObject[actualKey] = asset[actualKey as  keyof Asset] as string;
      }
    }
    return (
      <div key={asset?.id} className="tab-content">
        {realtimeObject && Object.entries(realtimeObject).map(([key, value]) => {
          // Determine row class based on the count of visible rows
          const rowClass = visibleRowIndex % 2 === 0 ? 'list-row-even' : 'list-row-odd';
          visibleRowIndex++; // Increment the visible row index
          return (
            <ul key={key} style={{ listStyleType: 'none', padding: 0, margin: 0 }} >
              <li className={`py-2 px-2 ${rowClass}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="flex justify-content-between align-items-center" style={{ width: '100%', padding: '1vh 2vw' }}>
                    <div className="flex align-items-center">
                      <label className="text-900 font-medium -ml-4 ">
                        {key.split("_").map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ")}
                      </label>
                    </div>
                    <span className="text-900 ml-4" >{value as string}</span>
                </div>
              </li>
            </ul>
          )
      })}
      </div>
    );
  };


  return (
    <>
      <Toast ref={toast} />
      <div className=" asset-view-card" style={{ width: "100%" }}>
          <div className=" asset-card">
            <div className="flex justify-content-between mb-4 asset-view-header">
              <h1> Asset Details </h1>
              <Button
                icon="pi pi-times"
                text
                className="p-button-rounded p-button-secondary p-button-sm"
                onClick={() => setShowExtraCard(false)}
                style={{ marginTop: "0.5rem", fontSize: "2rem" }}
              />
            </div>
           
              <TabView >
                <TabPanel header="General"> {renderGeneralContent()} </TabPanel>
                <TabPanel header="Eclass"> {renderEclassContent()} </TabPanel>
              </TabView>
           
          </div>
      </div>
    </>
  );

}
