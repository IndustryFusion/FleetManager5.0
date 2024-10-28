import Navbar from "@/components/navbar";
import React, { useEffect, useState, useRef } from "react";
import "../../public/styles/binding-request.css";
import ContractHeader from "@/components/bindingRequest/binding-header";
import { InputText } from "primereact/inputtext";
import { Tree } from "primereact/tree";
import { NodeService } from "@/service/NodeService";
import { Checkbox } from "primereact/checkbox";
import { getAccessGroup } from "@/utility/indexed-db";
import { getContracts } from "@/utility/contracts";
import ContractCard from "@/components/bindingRequest/binding-file";
import { IoArrowBack } from "react-icons/io5";
import ContractFolders from "@/components/bindingRequest/binding-folders";
import { Toast, ToastMessage } from "primereact/toast";
import axios from "axios";
import { fetchContractsRedux } from "@/redux/contract/contractSlice";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from '@/components/sidebar';

const ContractManager = () => {
  const [nodes, setNodes] = useState([]);
  const [companyIfricId, setCompanyIfricId] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  // const [contractsData, setContractsData] = useState([]);
  const [predictiveFilteredContractsData, setpredictiveFilteredContractsData] =
    useState([]);
  const [filterContracts, setFilterContracts] = useState(false);
  const [insuranceFilterContracts, setInsuranceFilterContracts] =
    useState(false);
  const [contractsOriginal, setContractsOriginal] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const dispatch = useDispatch();

  // Access the contracts data from Redux
  const contractsData = useSelector((state: any) => state.contracts.contracts);

  const showToast = (
    severity: ToastMessage["severity"],
    summary: string,
    message: string
  ) => {
    toast.current?.show({
      severity: severity,
      summary: summary,
      detail: message,
      life: 8000,
    });
  };

  useEffect(() => {
    NodeService.getTreeNodes().then((data) => setNodes(data));
  }, []);

  const getCompanyId = async () => {
    try {
    const details = await getAccessGroup();
    setCompanyIfricId(details.company_ifric_id);
    dispatch(fetchContractsRedux(companyIfricId));
    } catch(error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data.message);
        showToast("error", "Error", "Fetching assets");
      } else {
        console.error("Error:", error);
        showToast("error", "Error", error);
      }
    }
  };
  useEffect(() => {
    getCompanyId();
  });



  const handleFilterContracts = () => {
    setLoading(true);

    setTimeout(() => {
      const filteredData = contractsData.filter(
        (contract) =>
          contract?.contract_type?.trim() ===
          "https://industry-fusion.org/contracts/v0.1/predictiveMaintenanceLaserCutter"
      );
      setpredictiveFilteredContractsData(filteredData);
      setLoading(false);
    }, 2000); // Adjust the delay time in milliseconds (e.g., 1000 = 1 second)
  };

  useEffect(() => {
    if (filterContracts) {
      handleFilterContracts();
    }
  }, [filterContracts]);

  return (
    <>
      <div className="flex">
        <Toast ref={toast} />
          <Sidebar />
        <div className="main_content_wrapper">
          <div className="navbar_wrapper">
            <Navbar navHeader="Binding Request" />
            <div className="flex gap-4 contract-container">
              <div className="contract-left-container">
                <div className="contract-search-container">
                  <InputText
                    className="contract-search-input"
                    // value={globalFilterValue}
                    // onChange={onFilter}
                    placeholder="Search contracts"
                  />
                  <img
                    className="search-expand"
                    src="/search_icon.svg"
                    alt="search-icon"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="m-0 ml-1 folder-heading">Folders</h3>
                  <div className="card flex mt-1 contracts-tree">
                    <Tree
                      value={nodes}
                      selectionMode="single"
                      selectionKeys={selectedKey}
                      onSelectionChange={(e) => setSelectedKey(e.value)}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex gap-3">
                    <p
                      className="card-label-grey"
                      style={{ textDecoration: "underline" }}
                    >
                      Select All
                    </p>
                    <p
                      className="card-label-grey"
                      style={{ textDecoration: "underline" }}
                    >
                      Unselect All
                    </p>
                  </div>
                  <div className="flex gap-2 align-items-center">
                    <Checkbox />
                    <p className="m-0">Ewelina</p>
                  </div>
                  <div className="flex gap-2 align-items-center mt-2">
                    <Checkbox />
                    <p className="m-0">Patt Member</p>
                  </div>
                </div>
              </div>
              <div className="contract-right-container">
                <ContractHeader />
                <div className="contract-cards-container">
                  <ContractFolders
                    setFilterContracts={setFilterContracts}
                    setInsuranceFilterContracts={setInsuranceFilterContracts}
                    setContractsOriginal={setContractsOriginal}
                    contractsOriginal={contractsOriginal}
                  />
                  {loading ? (
                    <div></div>
                  ) : (
                    <>
                      {!contractsOriginal && (
                        <div className="ml-1">
                          <button
                            className="back-btn flex justify-content-center align-items-center border-none black_button_hover "
                            onClick={() => {
                              setInsuranceFilterContracts(false);
                              setFilterContracts(false);
                              setContractsOriginal(true);
                            }}
                          >
                            <IoArrowBack className="mr-1" />
                            <span className="mt-1">Back</span>
                          </button>
                        </div>
                      )}
                      {filterContracts &&
                        predictiveFilteredContractsData.length > 0 &&
                        predictiveFilteredContractsData.map((contract) => (
                          <div  key={contract._id}>
                             <ContractCard
                            contract={contract}
                          />
                          </div> 
                        ))}
                      {insuranceFilterContracts && (
                        <div>
                          <h3 className="not-found-text ml-4">
                            Insurance contract files not found
                          </h3>
                        </div>
                      )}
                      {contractsOriginal &&
                        contractsData.map((contract) => (
                          <div key={contract._id}>
                            <ContractCard contract={contract} />
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractManager;