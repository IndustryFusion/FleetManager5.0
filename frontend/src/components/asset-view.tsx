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

        // console.log(response.data?.[0]?.properties, "what's tenplate response");
        setTemplateKeys(Object.keys(response.data?.[0]?.properties));
        setTemplateObject(response.data?.[0]?.properties)
      } catch (error: any) {
        console.error(error);
        showToast('error', "Error", 'Fetching template schema');
      }
    }
    fetchSchema();
  }, []);





  const renderGeneralContent = () => {
    return (
      <div key={asset?.id}>
        {asset && Object.entries(asset).map(([key, value]) => {
          if (!key.includes("has") && typeof value !== "number") {
            return (
              <ul key={key} style={{ listStyleType: 'none', padding: 0, margin: 0 }} >
                <li className=" py-2 px-2 border-top-1 border-300 ">
                  <div className="flex justify-content-start flex-wrap">
                    <label className="text-900  font-medium">{key.split("_").length == 1 ? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase() : key.split("_")[0].charAt(0).toUpperCase() + key.split("_")[0].slice(1).toLowerCase() + " " + key.split("_")[1].charAt(0).toUpperCase() + key.split("_")[1].slice(1).toLowerCase()}</label>
                  </div>
                  <div className="flex justify-content-end flex-wrap">
                    <label className="text-900">{value}</label>
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
              <h5>Use Factory Manager to manage relationships.</h5>
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderParametersContent = () => {
    let newTemplate: any = {}
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
    console.log(newTemplate, "whta's the parameters");

    return (
      <div key={`${asset?.id}-${asset?.type}`}>
        {Object.keys(newTemplate).map((template, index) => (
          <ul key={newTemplate[template].title} style={{ listStyleType: 'none', padding: 0, margin: 0 }} >
            <li className=" py-2 px-2 border-top-1 border-300 ">
              <div className="flex justify-content-start flex-wrap">
                <label className="text-900  font-medium" >{newTemplate[template].title}
                </label>
                <span className="ml-1 text-gray-500">{newTemplate[template].unit}</span>
              </div>
              <div className="flex justify-content-end flex-wrap">
                <label className="text-900 ">{asset[template]}</label>
              </div>
            </li>
          </ul>
        ))}
      </div>
    )

  }


  return (
    <div className="mt-1 ml-1">
      <Toast ref={toast} />

      <div className=" mt-2" style={{ width: "100%" }}>
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
          <Card className="border-gray-800 border-1 border-round-lg">
            <h1 style={{ fontSize: "22px", fontWeight: "bold", marginTop: "2.2rem" }}>
              Asset Details
            </h1>
            <div className="card">
              <Button
                icon="pi pi-times"
                text
                className="p-button-rounded p-button-secondary p-button-sm"
                onClick={() => setShowExtraCard(false)}
                style={{ marginLeft: '90%', marginTop: "-50px", fontSize: "2rem" }}
              />
              <TabView scrollable>
                <TabPanel header="General" leftIcon="pi pi-list mr-2" > {renderGeneralContent()} </TabPanel>
                <TabPanel header="Relation" leftIcon="pi pi-link mr-2" > {renderRelationsContent()} </TabPanel>
                <TabPanel header="Parameters" leftIcon="pi pi-link mr-2" > {renderParametersContent()} </TabPanel>
              </TabView>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
