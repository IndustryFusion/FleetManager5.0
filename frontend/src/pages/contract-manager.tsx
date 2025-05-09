import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import React, { useEffect, useState, useRef } from "react";
import "../../public/styles/contract-manager.css";
import ContractHeader from "@/components/contractManager/contract-header";
import { InputText } from "primereact/inputtext";
import { Tree } from "primereact/tree";
import { NodeService } from "@/service/NodeService";
import { Checkbox } from "primereact/checkbox";
import { getAccessGroup } from "@/utility/indexed-db";
import { getContracts } from "@/utility/contracts";
import ContractCard from "@/components/contractManager/contract-file";
import { IoArrowBack } from "react-icons/io5";
import ContractFolders from "@/components/contractManager/contract-folders";
import { Toast, ToastMessage } from "primereact/toast";
import axios from "axios";
import { fetchContractsRedux } from "@/redux/contract/contractSlice";
import { useDispatch, useSelector } from "react-redux";

type DataDoc = {
  _id: string;
  producerId: string;
  bindingId: string;
  assetId: string;
  dataType: string;
  assetType: string;
  attribute: string;
  value: string;
  severity: string;
  message: string;
  alertReceiveTime: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const ContractManager = () => {
  const [nodes, setNodes] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  // const [contractsData, setContractsData] = useState([]);
  const [predictiveFilteredContractsData, setpredictiveFilteredContractsData] = useState([]);
  const [iotAnalyticsContractsData, setIotAnalyticsContractsData] = useState([]);
  const [iotFinanceContractsData, setIotFinanceContractsData] = useState([]);
  const [filterContracts, setFilterContracts] = useState(false);
  const [iotAnalyticsFilterContracts, setIotAnalyticsFilterContracts] = useState(false);
  const [iotFinanceFilterContracts, setIotFinanceFilterContracts] = useState(false);
  const [contractsOriginal, setContractsOriginal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const toast = useRef<Toast>(null);
  const dispatch = useDispatch();

  const backendUrl = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

  const [docs, setDocs] = useState<DataDoc[]>([]);

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
    async function fetchDocs() {
      const details = await getAccessGroup();
      const res = await axios.get(backendUrl + '/consumer/get-consumer-bindings/' + details?.company_ifric_id);
      const fromTimestamp = encodeURIComponent("2025-05-01T10:35:00.234Z");
      const toTimestamp = encodeURIComponent(new Date().toISOString());
      for (let i = 0; i < res?.data.length; i++) {
        const bindingId = res?.data[i].contract_binding_ifric_id;
        const assetId = res?.data[i].asset_ifric_id;
        const producerId = res?.data[i].data_provider_company_ifric_id;
        if (bindingId && assetId && producerId) {
          const res2 = await axios.get(
            `${backendUrl}/consume-data-from-dataroom/${producerId}/${bindingId}/${assetId}?fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`
          );
          const data: DataDoc[] = res2.data;
          setDocs((prevDocs) => [...prevDocs, ...data]);
        }
      }
    }
    fetchDocs();
  }, []);

  const count = docs.length;
  const latestCreatedAt = docs.reduce((latest, doc) => {
    const current = new Date(doc.createdAt).getTime();
    return current > latest ? current : latest;
  }, 0);

  const uniqueAssetIds = Array.from(new Set(docs.map(doc => doc.assetId)));

  const getCompanyId = async () => {
    try {
      const details = await getAccessGroup();
      dispatch(fetchContractsRedux(details?.company_ifric_id));
    } catch (error: any) {
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
  }, []);

  const handleFilterContracts = () => {
    setLoading(true);

    setTimeout(() => {
      const filteredData = contractsData.filter(
        (contract) =>
          contract?.contract_type?.trim() ===
          "https://industry-fusion.org/contracts/v0.1/predictiveMaintenanceLaserCutter"
      );
      const iotAnalyticsFilteredData = contractsData.filter(
        (contract) =>
          contract?.contract_type?.trim() ===
          "https://industry-fusion.org/contracts/v0.1/iotAnalyticsLaserCutter"
      );

      const iotFinanceFilteredData = contractsData.filter(
        (contract) =>
          contract?.contract_type?.trim() ===
          "https://industry-fusion.org/contracts/v0.1/iotFinancePlasmaCutter"
      );
      setpredictiveFilteredContractsData(filteredData);
      setIotAnalyticsContractsData(iotAnalyticsFilteredData);
      setIotFinanceContractsData(iotFinanceFilteredData);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (
      filterContracts ||
      iotAnalyticsFilterContracts ||
      iotFinanceFilterContracts
    ) {
      handleFilterContracts();
    }
  }, [filterContracts, iotAnalyticsFilterContracts, iotFinanceFilterContracts]);

  return (
    <>
      <div className="flex">
        <Toast ref={toast} />
        <Sidebar />
        <div className="main_content_wrapper">
          <div className="navbar_wrapper">
            <Navbar navHeader="Contracts Manager" />
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
                  <h2 className="ml-5 mb-0">{showAll ? "Folders " : ""}</h2>
                  <ContractFolders
                    setFilterContracts={setFilterContracts}
                    setIotAnalyticsFilterContracts={
                      setIotAnalyticsFilterContracts
                    }
                    setIotFinanceFilterContracts={setIotFinanceFilterContracts}
                    setContractsOriginal={setContractsOriginal}
                    contractsOriginal={contractsOriginal}
                    setShowAll={setShowAll}
                  />
                  {loading ? (
                    <div></div>
                  ) : (
                    <>
                      {!contractsOriginal && (
                        <div className="ml-5">
                          <button
                            className="back-btn flex justify-content-center align-items-center border-none black_button_hover "
                            onClick={() => {
                              setIotAnalyticsFilterContracts(false);
                              setIotFinanceFilterContracts(false);
                              setFilterContracts(false);
                              setContractsOriginal(true);
                              setShowAll(true);
                            }}
                          >
                            <IoArrowBack className="mr-1" />
                            <span className="mt-1">Back</span>
                          </button>
                        </div>
                      )}
                      {filterContracts &&
                        predictiveFilteredContractsData.length > 0
                        ? predictiveFilteredContractsData.map((contract) => (
                          <div key={contract._id}>
                            <ContractCard contract={contract} />
                          </div>
                        ))
                        : filterContracts && (
                          <div>
                            <h3 className="not-found-text ml-4">
                              Predictive Maintenance contract files not found
                            </h3>
                          </div>
                        )}
                      {iotAnalyticsFilterContracts &&
                        iotAnalyticsContractsData.length > 0
                        ? iotAnalyticsContractsData.map((contract) => (
                          <div key={contract._id}>
                            <ContractCard contract={contract} />
                          </div>
                        ))
                        : iotAnalyticsFilterContracts && (
                          <div>
                            <h3 className="not-found-text ml-4">
                              Iot Analytics contract files not found
                            </h3>
                          </div>
                        )}

                      {iotFinanceFilterContracts &&
                        (iotFinanceContractsData.length > 0
                          ? iotFinanceContractsData.map((contract) => (
                            <div key={contract._id}>
                              <ContractCard contract={contract} />
                            </div>
                          ))
                          : iotFinanceFilterContracts && (
                            <h3 className="not-found-text ml-4">
                              Iot Finance contract files not found
                            </h3>
                          ))}
                      <div>
                        <h2 className="ml-5 mt-7 heading-file-text">
                          {showAll ? "Files" : ""}
                        </h2>
                        {contractsOriginal &&
                          contractsData.map((contract) => (
                            <div key={contract._id}>
                              <ContractCard contract={contract} />
                            </div>
                          ))}
                      </div>

                      <div>
                        <h2 className="ml-5 mt-7 heading-file-text">
                          Contract Based Shared Data Statistics
                        </h2>
                        {docs.length > 0 ? (
                          <div className="ml-5 mt-3 text-sm">
                            <p><strong>Total Documents:</strong> {count}</p>
                            <p><strong>Last Created At:</strong> {new Date(latestCreatedAt).toLocaleString()}</p>
                            <p><strong>Unique Asset IDs ({uniqueAssetIds.length}):</strong></p>
                            <ul className="list-disc ml-6">
                              {uniqueAssetIds.map(id => (
                                <li key={id}>{id}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="ml-5 mt-3 text-sm">Loading statistics...</p>
                        )}
                      </div>

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
