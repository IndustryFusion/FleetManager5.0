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
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { TabPanel, TabView } from "primereact/tabview";
import { Asset } from "@/interfaces/assetTypes";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast, ToastMessage } from "primereact/toast";
import "../../public/styles/asset-view.css";
import { useTranslation } from "next-i18next";
interface AssetDetailsCardProps {
  asset: Asset | null;
  setShowExtraCard: any;
  templateId?: any;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function AssetDetailsCard({ asset, setShowExtraCard }: AssetDetailsCardProps) {

  const [selectedTab, setSelectedTab] = useState("general");
  const [selectedData, setSelectedData] = useState<{
    [key: string]: { type: string; value: string };
  } | null>(null);
  const [templateKeys, setTemplateKeys] = useState<string[]>([]);
  const [templateObject, setTemplateObject] = useState<any>({});
  const toast = useRef<any>(null);
  const { t } = useTranslation('overview');
  const showToast = (severity: ToastMessage['severity'], summary: string, message: string) => {
    toast.current?.show({ severity: severity, summary: summary, detail: message, life: 8000 });
  };


  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await axios.get(BACKEND_API_URL + `/templates/template-name/`, {
          params: {
            name: asset?.asset_category
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        })

        setTemplateKeys(Object.keys(response.data?.[0]?.properties));
        setTemplateObject(response.data?.[0]?.properties)
      } catch (error: any) {
        console.error(error);
        showToast('error', "Error", 'Fetching template schema');
      }
    }
    fetchSchema();
  }, []);





 const renderGeneralContent = (): JSX.Element => {
    let visibleRowIndex = 0; // Initialize a counter for visible rows
    return (
      <div key={asset?.id}>
        {asset && Object.entries(asset).map(([key, value]) => {
        if (!key.includes("has") && typeof value !== "number") {
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
                    <span className="text-900 ml-4" >{value}</span>
                </div>
              </li>
            </ul>
          )
        }
        else {
          return null;
        }
      })}
      </div>
    );
  };


  const renderRelationsContent = () => {
    return (
      <div>
        {asset && (
          <div>
            <p>
              <h5>{t('relationCommand')}</h5>
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderParametersContent = () => {
    let newTemplate: any = {};
    let visibleRowIndex = 0;  // Initialize a counter for visible rows
    for (let key of templateKeys) {
      if (asset?.hasOwnProperty(key) && templateObject[key].type === "number" && key !== "manufacturing_year") {
        newTemplate[key] = {
          title: templateObject[key].title,
          unit: templateObject[key].unit
        }
      } else {
        continue;
      }
    }
    return (
        <div key={`${asset?.id}-${asset?.type}`}>
          {Object.keys(newTemplate).map((template) => {
            const rowClass = visibleRowIndex % 2 === 0 ? 'list-row-even' : 'list-row-odd';
            visibleRowIndex++; // Increment the visible row index for each rendered row

            return (
              <ul key={newTemplate[template].title} style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <li className={`py-2 px-2 ${rowClass}`} style={{ minHeight: '3vh', display: 'flex', alignItems: 'center' }}>
                    <div className="flex justify-content-between align-items-center" style={{ width: '100%', padding: '1vh 2vw' }}>
                      <div className="flex align-items-center">
                        <label className="text-900 font-medium mr-2">{newTemplate[template].title}</label>
                        <span className="text-gray-500">{newTemplate[template].unit}</span>
                      </div>
                      <label className="text-900">{asset[template]}</label>
                    </div>
                </li>
              </ul>
            );
          })}
        </div>
    );
    
  }


  return (
    <div className="mt-1 ml-1">
      <Toast ref={toast} />
      <div className=" mt-2" style={{ width: "100%" }}>
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
          <Card className="border-gray-800 border-1 border-round-lg">
            <div className="flex justify-content-between mb-4">
              <h1 style={{ fontSize: "22px", fontWeight: "bold", marginTop: "2.2rem" }}>
                Asset Details
              </h1>
              <Button
                icon="pi pi-times"
                text
                className="p-button-rounded p-button-secondary p-button-sm"
                onClick={() => setShowExtraCard(false)}
                style={{ marginTop: "2rem", fontSize: "2rem" }}
              />
            </div>
            <div className="card">
              <TabView scrollable className="general-tab">
                <TabPanel header="Parameters" leftIcon="pi pi-link mr-2" > {renderParametersContent()} </TabPanel>
                <TabPanel header="General" leftIcon="pi pi-list mr-2" > {renderGeneralContent()} </TabPanel>
                <TabPanel header="Relation" leftIcon="pi pi-link mr-2" > {renderRelationsContent()} </TabPanel>
              </TabView>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

}
