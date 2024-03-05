import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { TabPanel, TabView } from "primereact/tabview";
import { Asset } from "@/interfaces/assetTypes";
import { Button } from "primereact/button";
import axios from "axios";
import { log } from "util";
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
  // This is a sample function that handles row selection, you should adapt it to your actual use case.
  // const handleRowSelect = (data: any) => {
  //   setSelectedData(data);
  // };

  console.log(asset, "what's in asset");



  useEffect(() => {
    const fetchSchema = async () => {

      try {
        const response = await axios.get(BACKEND_API_URL + `/templates/${asset?.templateId}`, {
          headers: {
            "Content-Type": "application/json",
          }
        })
        console.log(response, "what's tenplate response");
        console.log(response.data?.[0]?.properties, "what are all properties");
        console.log(Object.keys(response.data?.[0]?.properties), "all keys",);
        setTemplateKeys(Object.keys(response.data?.[0]?.properties));

        setTemplateObject(response.data?.[0]?.properties)
      } catch (error: any) {
        console.error(error)
      }
    }
    fetchSchema();
  }, []);



  const renderGeneralContent = () => {
    return (
      <div>
        {asset && (
          <div>
            {Object.entries(asset).map(([key, value]) => {    
              if (!key.includes("has") && typeof value !== "number") {
                return (
                  <div >
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }} >
                      <li className=" py-2 px-2 border-top-1 border-300 ">
                        <div className="flex justify-content-start flex-wrap">
                          <label className="text-900  font-medium">{key.split("_").length == 1 ? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase() : key.split("_")[0].charAt(0).toUpperCase() + key.split("_")[0].slice(1).toLowerCase() + " " + key.split("_")[1].charAt(0).toUpperCase() + key.split("_")[1].slice(1).toLowerCase()}</label>
                        </div>
                        <div className="flex justify-content-end flex-wrap">
                          <label className="text-900">{value}</label>
                        </div>
                      </li>
                    </ul>
                  </div>
                );
              }
              else {
                return null;
              }
            })}
          </div>
        )}
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
    console.log(templateKeys, "all temmplate keys");
    let obj:any = {}
    for (let key of templateKeys) {
      if (asset?.hasOwnProperty(key) && templateObject[key].type ===  "number" && key !== "manufacturing_year" ) {
        obj[key] = {
          title:templateObject[key].title,
          unit:templateObject[key].unit   
        }
      } else {
        continue;
      }
    }
    console.log(obj, "whta's the obj");
    
    return(
      Object.keys(obj).map( template => (
        <>
         <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }} >
                      <li className=" py-2 px-2 border-top-1 border-300 ">
                        <div className="flex justify-content-start flex-wrap">
                          <label className="text-900  font-medium" >{obj[template].title}
                        </label>
                        <span className="ml-1 text-gray-500">{obj[template].unit}</span>
                        </div>
                        <div className="flex justify-content-end flex-wrap">
                          <label className="text-900 ">{asset[template]}</label>
                        </div>
                        </li>
                        </ul>
                    </>
      )
      )    
    )
  }


  return (
    <div className="mt-1 ml-1">
      <h1 style={{ fontSize: "22px", fontWeight: "bold", marginTop: "1px" }}>
        Asset Details
      </h1>
      <div className=" mt-2" style={{ width: "100%" }}>
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
          <Card className="border-gray-800 border-1 border-round-lg">
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
