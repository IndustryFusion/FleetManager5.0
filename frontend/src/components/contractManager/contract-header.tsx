import { TabPanel, TabView } from 'primereact/tabview'
import React from 'react'

const ContractHeader = () => {
  return (
    <>
    <div className='contract-header-container'>
    <div>
              <TabView
                className="asset-tabs"
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
    <div>
        Filters
    </div>
    <div className='flex gap-2'>
    Sort by
    </div>
    </div>
    </>
  )
}

export default ContractHeader