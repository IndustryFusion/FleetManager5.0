import React, { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { TabPanel, TabView } from "primereact/tabview";
import { classNames } from "primereact/utils";
import { VirtualScroller } from "primereact/virtualscroller";
import { TabMenu } from 'primereact/tabmenu';

interface Asset {
  id: string;
  type: string;
  manufacturer: string;
  manufacturing_year: string;
  serial_number: string;
  creation_date: string;
  asset_communication_protocol: string;
  product_icon: string;
  product_name: string;
  voltage_type: string;
  asset_manufacturer_name: string;
  asset_serial_number: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  ambient_operating_temperature_min: number;
  ambient_operating_temperature_max: number;
  relative_humidity_min: number;
  relative_humidity_max: number;
  atmospheric_pressure_min: number;
  atmospheric_pressure_max: number;
  dustiness_max: number;
  supply_voltage: number;
  frequency: number;
  electric_power: number;
  logo_manufacturer: string;
  documentation: string;
  ce_marking: string;
  hasObject: string;
}

interface AssetDetailsCardProps {
  asset: Asset;
}

export default function AssetDetailsCard({ asset }: AssetDetailsCardProps) {
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

                  <div className="surface-0">

                    <ul className="list-none p-0 m-0">
                      <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
                        <div className="text-500 w-6 md:w-4 font-medium">{key.split("_").length == 1 ? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase() : key.split("_")[0].charAt(0).toUpperCase() + key.split("_")[0].slice(1).toLowerCase() + " " + key.split("_")[1].charAt(0).toUpperCase() + key.split("_")[1].slice(1).toLowerCase()}</div>
                        <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{value}</div>
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
              <h3>Use Factory Manager to manage relationships.</h3>
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
        <div className="flex flex-column align-items-left">
          <Card className="border-gray-800 border-1 border-round-lg">
            <div className="card">
              <TabView>
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
