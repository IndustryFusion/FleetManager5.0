import { TabPanel, TabView } from 'primereact/tabview'
import React from 'react'

const ContractHeader = () => {
  return (
    <>
    <div>
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
    </div>
    </>
  )
}

export default ContractHeader