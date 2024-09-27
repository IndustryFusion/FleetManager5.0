import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar'
import React, { useEffect, useState } from 'react';
import "../../public/styles/contract-manager.css";
import ContractHeader from '@/components/contractManager/contract-header';
import { InputText } from 'primereact/inputtext';
import { Tree } from 'primereact/tree';
import { NodeService } from '@/service/NodeService';
import ContractCards from '@/components/contractManager/contract-cards';
import { Checkbox } from 'primereact/checkbox';

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
              <img 
              className={isSidebarExpand ? "search-expand" : "search-collapse"}
              src="/search_icon.svg" alt="search-icon" />
            </div>
            <div className='mt-6'>
                <h3 className='m-0 ml-1 folder-heading'>Folders</h3>
             <div className="card flex mt-1 contracts-tree">
            <Tree
            value={nodes} selectionMode="single" selectionKeys={selectedKey} onSelectionChange={(e) => setSelectedKey(e.value)}  />
            </div>
            </div>
            <div className='mt-6'>
            <h3 className='m-0 ml-1 folder-heading'>Simple Lawfirm Members</h3>
            <div className='flex gap-3'>
                <p className='card-label-grey' style={{textDecoration:"underline"}}>Select All</p>
                <p className='card-label-grey' style={{textDecoration:"underline"}}>Unselect All</p>
            </div>
            <div className='flex gap-2 align-items-center'>
                <Checkbox />
                <p className='m-0'>Ewelina</p>
            </div>
            <div className='flex gap-2 align-items-center mt-2'>
                <Checkbox />
                <p className='m-0'>Patt Member</p>
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