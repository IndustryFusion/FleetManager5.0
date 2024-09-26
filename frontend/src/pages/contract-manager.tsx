import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar'
import React, { useEffect, useState } from 'react';
import "../../public/styles/contract-manager.css";
import ContractHeader from '@/components/contractManager/contract-header';
import { InputText } from 'primereact/inputtext';
import { Tree } from 'primereact/tree';
import { NodeService } from '@/service/NodeService';
import ContractCards from '@/components/contractManager/contract-cards';

const ContractManager = () => {
    const [isSidebarExpand, setSidebarExpand] = useState(true);
    const [nodes, setNodes] = useState([]); 
    const [selectedKey, setSelectedKey] = useState('');


    useEffect(() => {
        NodeService.getTreeNodes().then((data) => setNodes(data));
    }, []);

  return (
    <>
     <div className="flex">
        <div className={isSidebarExpand ? "sidebar-container" : "collapse-sidebar"}>
          <Sidebar isOpen={isSidebarExpand} setIsOpen={setSidebarExpand} />
        </div>
        
        <div className={isSidebarExpand ? "contract-container" : "contract-container-collpase"}>
            <Navbar navHeader="Contracts Manager"/>
            <div className='flex gap-4 '>
                <div className='contract-left-container'>
                <div className="contract-search-container"> 
              <InputText
                className="contract-search-input"
                // value={globalFilterValue}
                // onChange={onFilter}
                placeholder="Search contracts"
              />
              <img src="/search_icon.svg" alt="search-icon" />
            </div>
            <div className='mt-6'>
                <h3 className='m-0 ml-1 folder-heading'>Folders</h3>
                <div className="card flex mt-3 contracts-tree">
            <Tree
           
            value={nodes} selectionMode="single" selectionKeys={selectedKey} onSelectionChange={(e) => setSelectedKey(e.value)}  />
        </div>
            </div>
                </div>
                <div className='contract-right-container'>
                 <ContractHeader />
                 <ContractCards />
                </div>
            </div>
        </div>
        </div>
    </>
  )
}

export default ContractManager