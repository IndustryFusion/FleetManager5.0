import { Dropdown } from 'primereact/dropdown'
import { TabPanel, TabView } from 'primereact/tabview'
import React, { useState } from 'react'

const ContractHeader = () => {
    const sortOptions = [
        { label: "Contract name: A - Z", value: "contract_name" },
        { label: "Contract name: Z - A", value: "!contract_name" },
      ];
      const [selectedSortOption, setSelectedSortOption] = useState(sortOptions[0].value);

      const handleSortChange = (e: { value: string }) => {
        setSelectedSortOption(e.value);
      };

  return (
    <>
    <div className='contract-header-container'>
    <div>
              <TabView
                className="asset-tabs contract-tabs"
              >
                <TabPanel header="All"></TabPanel>
                <TabPanel header="Require Action" disabled></TabPanel>
                <TabPanel header="Signed" disabled></TabPanel>
                <TabPanel header="Pending" disabled></TabPanel>
                <TabPanel header="Requested Changes" disabled></TabPanel>
                <TabPanel header="Dismissed" disabled></TabPanel>
                <TabPanel header="Imported" disabled></TabPanel>
              </TabView>
    </div>
    <div className='flex gap-5 align-items-center'>
    <div className='flex'>
        <img src="/filter_icon.svg" alt="filter_icon" style={{marginRight:"8px"}} />
        <p className='filter-heading'>Filters</p>
    </div>
    <div className='flex gap-2'>
    <p className='filter-heading m-0 mt-2'>Sort by :</p>  
    <Dropdown
                className="contract-sort-dropdown"
                optionLabel="label"
                value={selectedSortOption}
                //placeholder="Sort"
                options={sortOptions}
              
                onChange={(e) => handleSortChange(e)}
                itemTemplate={(option) => option.label}
              />
    </div>
    </div>
    
    </div>
    </>
  )
}

export default ContractHeader