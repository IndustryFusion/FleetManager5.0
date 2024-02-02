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

  urn_id: string;
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
  const handleRowSelect = (data: any) => {
    setSelectedData(data);
  };
  console.log("card details.", asset);

  const renderGeneralContent = () => {
    return (
      <div>
        {asset && (
          <>
            {Object.entries(asset).map(([key, value]) => {
              if (
                key !== "http://www.industry-fusion.org/schema#urn_id" &&
                typeof value === "object" &&
                value?.type === "Property"
              ) {
                const label = key.replace(
                  "http://www.industry-fusion.org/schema#",
                  ""
                );
                return (
                  <div key={key}>
                    <p>
                      <span className="font-semibold mr-2">{label}:</span>
                      <span>{value.value}</span>
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </>
        )}
      </div>
    );
  };

  const renderRelationsContent = () => {
    return <div></div>;
  };

  const renderContent = () => {
    if (selectedTab === "general") {
      return renderGeneralContent();
    } else if (selectedTab === "relations") {
      return renderRelationsContent();
    }
  };

  return (
    <div className="ml-2">
      <div className="flex">
        <Button
          label="General"
          severity="secondary"
          outlined
          onClick={() => handleTabChange("general")}
        />
        <Button
          label="Relations"
          severity="secondary"
          outlined
          className="ml-5"
          onClick={() => handleTabChange("relations")}
        />
      </div>
      <div className="card-content scrollable-content">{renderContent()}</div>
    </div>
  );
}
