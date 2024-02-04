import React, { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { classNames } from "primereact/utils";
import { VirtualScroller } from "primereact/virtualscroller";

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

  const handleTabChange = (tabName: string) => {
    setSelectedTab(tabName);
  };

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
                  <div key={key}>
                    <p>
                      <span className="font-semibold mr-2">{key.split("_").length == 1 ? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase() : key.split("_")[0].charAt(0).toUpperCase() + key.split("_")[0].slice(1).toLowerCase() + " " + key.split("_")[1].charAt(0).toUpperCase() + key.split("_")[1].slice(1).toLowerCase()}:</span>
                      <span>{value}</span>
                    </p>
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

    if(Object.keys(asset).some(key => key.includes("has")) == false) {
      return (
        <div>
          <p>
            <span>No Relationships!</span>
          </p>
        </div>
      )
    }
    else {
      return (
        <div>
          {asset && (
            <div>
              {Object.entries(asset).map(([key, value]) => {
                if (key.includes("has")) {
                  return (
                    <div key={key}>
                      <p>
                        <span className="font-semibold mr-2">{key.split(/(?=[A-Z])/)[1]}:</span>
                        <span>{value}</span>
                      </p>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      );
    }
  };

  const renderContent = () => {
    if (selectedTab === "general") {
      return renderGeneralContent();
    } else if (selectedTab === "relations") {
      return renderRelationsContent();
    }
  };

  return (
    <div>
      <div className="grid">
        <div className="xl:col-4 md:col-6">
          <Button
            label="General"
            severity="secondary"
            outlined
            onClick={() => handleTabChange("general")}
            className="text-center p-2 border-round-sm bg-primary font-bold"
          />
        </div>
        <div className="xl:col-4 md:col-6">
          <Button
            label="Relations"
            severity="secondary"
            outlined
            onClick={() => handleTabChange("relations")}
            className="text-center p-2 border-round-sm bg-primary font-bold"
          />
        </div>
      </div>

      <hr />

      <div className="grid">
        <div className="col">
          <div className="card-content scrollable-content">{renderContent()}</div>
        </div>
      </div>

    </div>

  );
}
