import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
interface Optiontype {
  label: string;
  value: string;
}

const ContractHeader = () => {
  const router = useRouter();
  const sortOptions = [
    { label: "Asc", value: "contract_name" },
    { label: "Desc", value: "!contract_name" },
  ];
  const [selectedSortOption, setSelectedSortOption] = useState(
    sortOptions[0].value
  );

  const handleSortChange = (e: { value: string }) => {
    setSelectedSortOption(e.value);
  };
  const CustomOption = (option: Optiontype) => {
    return (
      <div className="custom-option">
        <input
          type="radio"
          name="sort-option"
          checked={selectedSortOption === option.value}
          onChange={() => setSelectedSortOption(option.value)}
        />
        <span> {option.label}</span>
      </div>
    );
  };

  return (
    <>
      <div className="contract-header-container">
        <div>
          <TabView className="asset-tabs contract-tabs">
            <TabPanel header="All"></TabPanel>
            <TabPanel header="Require Action" disabled></TabPanel>
            <TabPanel header="Signed" disabled></TabPanel>
            <TabPanel header="Pending" disabled></TabPanel>
            <TabPanel header="Requested Changes" disabled></TabPanel>
            <TabPanel header="Dismissed" disabled></TabPanel>
            <TabPanel header="Imported" disabled></TabPanel>
          </TabView>
        </div>
        <div className="flex gap-5 align-items-center">
          <div className="flex">
            <img
              src="/filter_icon.svg"
              alt="filter_icon"
              style={{ marginRight: "8px" }}
            />
            <p className="filter-heading">Filters</p>
          </div>
          <div>
            <div className="hover_state_group">
              <img
                src="/sort_icon.svg"
                alt="sort-icon"
                style={{ marginBottom: "-2px", marginRight: "4px" }}
              />
              <Dropdown
                appendTo="self"
                className="sort-dropdown"
                optionLabel="label"
                placeholder="Sort"
                options={sortOptions}
                onChange={(e) => handleSortChange(e)}
                itemTemplate={(option) => CustomOption(option)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractHeader;
