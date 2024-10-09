import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar'
import React, { useEffect, useState } from 'react';
import "../../public/styles/contract-manager.css";
import ContractHeader from '@/components/contractManager/contract-header';
import { InputText } from 'primereact/inputtext';
import { Tree } from 'primereact/tree';
import { NodeService } from '@/service/NodeService';
import ContractCards from '@/components/contractManager/contract-cards';
import { Checkbox } from 'primereact/checkbox'
import { getAccessGroup } from "@/utility/indexed-db";
import { getContracts } from '@/utility/contracts';
import ContractCard from '@/components/contractManager/contract-card';
;

const ContractManager = () => {
    const [nodes, setNodes] = useState([]); 
    const [companyIfricId, setCompanyIfricId] = useState("");
    const [selectedKey, setSelectedKey] = useState('');
    const [contractsData, setContractsData]= useState([]);
    const [filterContracts, setFilterContracts]=useState(false);


    useEffect(() => {
        NodeService.getTreeNodes().then((data) => setNodes(data));
    }, []);

    const getCompanyId = async()=>{
      const details = await getAccessGroup();
      setCompanyIfricId(details.company_ifric_id)
    }
    useEffect(() => {
      getCompanyId();
    })

    const fetchContracts =async(ifricId:string)=>{
     try{
     const response = await getContracts(ifricId);
     console.log("response in contracts page", response);
     setContractsData(response)
     }catch(error){
      console.error(error)
     }
    }

    useEffect(()=>{
    fetchContracts(companyIfricId)
    },[companyIfricId])


    const filterContractsData = [...contractsData].filter(contract => contract?.contract_type?.trim() === "https://industry-fusion.org/contracts/v0.1/predictiveMaintenanceLaserCutter")
    console.log("contractsData here", contractsData);
    
    console.log("filterContractsData", filterContractsData);
    console.log("filterContracts", filterContracts);
    
    

  return (
    <>
     <div className="flex">
     <Sidebar  />
        <div className="main_content_wrapper">
        <div className="navbar_wrapper">
            <Navbar navHeader="Contracts Manager"/>
            <div className='flex gap-4 contract-container'>
                <div className='contract-left-container'>
                <div className="contract-search-container"> 
              <InputText
                className="contract-search-input"
                // value={globalFilterValue}
                // onChange={onFilter}
                placeholder="Search contracts"
              />
              <img 
              className="search-expand"
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
                 <div className="contract-cards-container">
                 <ContractCards 
                 setFilterContracts={setFilterContracts}
                 />
                 {filterContracts &&  filterContractsData.length ?
                   filterContractsData.map(contract =>{
                    return(
                      <>
                      <ContractCard 
                      contract={contract}
                      />
                      </>
                    )
                  })
                 :
                 contractsData.length &&
                 contractsData.map(contract =>{
                  return(
                    <div >
                    <ContractCard 
                    contract={contract}
                    />
                    </div>
                  )
                })
                 }
                 
                  
                  </div>
               
                </div>
                
            </div>
        </div>
        </div>
        </div>
    </>
  )
}

export default ContractManager