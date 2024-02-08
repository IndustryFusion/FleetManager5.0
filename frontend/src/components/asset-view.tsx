import React, { useState } from "react";
import { Card } from "primereact/card";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { TabPanel, TabView } from "primereact/tabview";
import { Asset } from "@/interfaces/assetTypes";
import { Button } from "primereact/button";
interface AssetDetailsCardProps {
  asset: Asset | null;
  setShowExtraCard: any;
}

export default function AssetDetailsCard({ asset, setShowExtraCard }: AssetDetailsCardProps) {
  const [selectedTab, setSelectedTab] = useState("general");
  const [selectedData, setSelectedData] = useState<{
    [key: string]: { type: string; value: string };
  } | null>(null);

  // This is a sample function that handles row selection, you should adapt it to your actual use case.
  // const handleRowSelect = (data: any) => {
  //   setSelectedData(data);
  // };

  console.log("card details.", asset);

  const renderGeneralContent = () => {
    return (
      <div>
        {asset && (
          <div>
            {Object.entries(asset).map(([key, value]) => {
              if (!key.includes("has")) {
                
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
          style={{marginLeft: "25rem", marginTop:"-50px", fontSize:"2rem"}}
        />
              <TabView scrollable>
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
