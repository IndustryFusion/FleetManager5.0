//
// Copyright (c) 2024 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React, { useState, useEffect, useRef, CSSProperties } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import AssetDetailsCard from "../components/assetOverview/asset-view";
import Footer from "../components/footer";
import { Toast, ToastMessage } from "primereact/toast";
import { Asset } from "@/interfaces/assetTypes";
import { fetchAssets, getAssetsAndOwnerDetails } from "@/utility/asset";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import OverviewHeader from "@/components/assetOverview/overview-header";
import { actionItemsTemplate, checkboxContainer, filterAssets } from "@/utility/assetTable";
import AssetTable from "@/components/assetOverview/asset-table";
import TableHeader from "@/components/assetOverview/table-header";;
import { fetchTemplates } from '@/redux/templates/templatesSlice';
import { AppDispatch, RootState, store } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import "../../public/styles/asset-overview.css";
import { getAccessGroup  } from "@/utility/indexed-db";
import MoveToRoomDialog from "@/components/move-to-room/move-to-room-dialog";
import { fetchAssetsRedux } from "@/redux/asset/assetsSlice";
import { FilterMatchMode } from "primereact/api";
import { getAccessGroupData } from "@/utility/auth";
import { ContextMenu } from "primereact/contextmenu";
import ConfirmTransferDialog from "@/components/move-to-room/confirm-dialog";

type ExpandValue = {
  [key: string]: boolean;
};


const AssetOverView: React.FC = () => {
  const reduxAssets = useSelector((state: RootState) => state.assetsSlice.assets);
  const [assets, setAssets] = useState(reduxAssets);
  const assetStatus = useSelector((state: RootState) => state.assetsSlice.status);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Asset | null>(null);
  const [showSelectedAsset, setShowSelectedAsset] = useState(false);
  const [selectedRowsPerPage, setSelectedRowsPerPage] = useState<string>("10");
  const [assetCount, setAssetCount] = useState(0);
  const [showExtraCard, setShowExtraCard] = useState<boolean>(false);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [showContextMenu, setShowContextMenu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    global: {
      value: null as string | null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    id: {
      value: null as string | null,
      matchMode: FilterMatchMode.STARTS_WITH,
    },
    asset_serial_number: {
      value: null as string | null,
      matchMode: FilterMatchMode.STARTS_WITH,
    },
    type: {
      value: null as string | null,
      matchMode: FilterMatchMode.STARTS_WITH,
    },
    product_name: {
      value: null as string | null,
      matchMode: FilterMatchMode.STARTS_WITH,
    },
    asset_manufacturer_name: {
      value: null as string | null,
      matchMode: FilterMatchMode.STARTS_WITH,
    },
    owner_company_name:{
      value: null as string | null,
      matchMode: FilterMatchMode.STARTS_WITH,
    }
  });
  const [currentPage, setCurrentPage] = useState(0);
  const dataTableCardWidth = showExtraCard ? "70%" : "100%";
  const { t } = useTranslation(["overview", "placeholder"]);
  const [expandValue, setExpandValue] = useState<ExpandValue>({});
  const [enableReordering, setEnableReordering] = useState(false);
  const [isBlue, setIsBlue] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedGroupOption, setSelectedGroupOption] = useState(null);
  const [companyIfricId, setCompanyIfricId] = useState("");
  const [groupOptions, setGroupOptions] = useState([
    { label: "Product Type", value: "type" },
    { label: "Manufacturer", value: "asset_manufacturer_name" },
  ]);
  const toast = useRef<Toast>(null);
  const cm = useRef(null);
  const router = useRouter();
  const [accessgroupIndexDb, setAccessgroupIndexedDb] =useState<any>(null);
  const [isMoveToRoomDialogVisible, setIsMoveToRoomDialogVisible] = useState(false);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false); 
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState("Assets");
  const [transferAsset, setTransferAsset] = useState<any>(null);
  const [onAcceptFns, setOnAcceptFns] = useState<{
  save?: () => Promise<void>;
  assign?: () => Promise<void>;
}>({});
const [factoryOwner, setFactoryOwner] = useState<{
  id?: string;
  name?: string;
  companyIfricId?: string;
  company_category?: string;
  country?: string;
  logoUrl?: string;
  city?: string;
} | null>(null);
 const [testFactoryOwner,setTestFactoryOwner]=useState<any>([])

  const menuModel = [
    {
    label: "Contracts",
    icon: "",
    command: () => {
  }
  },
    {
    label: "Certificates",
    icon: "",
    command: () => {  
        if (selectedProduct?.id) {
        router.push({
            pathname: "/certificates",
            query: { asset_ifric_id: selectedProduct?.id },
        });
      } else {
        showToast(
          "error",
          "No Asset Selected",
          "Please select an asset first"
        );
      }
  }
  },
    {
    label: "Assign Owner",
    icon: "",
    command: (rowData:Asset) => {
      handleMoveToRoom(rowData)
  }
  }
  ]

  // console.log("selectedProduct here is", selectedProduct);
  
  const getCompanyId = async()=>{
    try {
      const details = await getAccessGroup();
      console.log("details ",details);
      setCompanyIfricId(details.company_ifric_id)
    } catch(error: any) {
      console.log("error from catch ",error);
      showToast("error", "Error", "Failed to fetch access group data");
    }
  }
  useEffect(() => {
    getCompanyId();
  },[])

  const dataTableStyle: CSSProperties = {
    flexGrow: 1,
    overflow: "auto",
  };

  const handleRowsPerPageChange = (event: any) => {
    setSelectedRowsPerPage(event.target.value);
  };
  
  const fetchAsset = async () => {
    try {
      setLoading(true);
      const company_ifric_id = (await getAccessGroup()).company_ifric_id;
      console.log(company_ifric_id);
      const response = await getAssetsAndOwnerDetails(company_ifric_id);
      console.log("ftch", response);
      const normalized = Array.isArray(response)
        ? response.map((item: any) => {
          if (item && item.assetData) return item;
          return { ...item, assetData: item };
        })
        : [];

      setAssets(normalized || []);
      setAssetCount(normalized.length || 0);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        showToast("error", "Error", "Fetching assets");
      } else {
        showToast("error", "Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assetStatus === "idle") {
      dispatch(fetchAssetsRedux());
    }
  }, [dispatch, assetStatus]);
  

  useEffect(()=>{
    setAssets(reduxAssets)
    setAssetCount(reduxAssets?.length)
  },[reduxAssets])

  useEffect(() => {
    const storedValue = localStorage.getItem("selectedRowsPerPage");
    if (storedValue) {
      setSelectedRowsPerPage(storedValue);
    }
    // if (assets.length === 0) {
    //   fetchAsset();
    // }
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeTab === "Assets") {
        setSelectedAssets([]);
        setShowSelectedAsset(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedRowsPerPage", String(selectedRowsPerPage));

    const paginator = document.querySelector(".p-paginator");
    if (paginator) {
      // Check if the select element already exists
      let selectElement: HTMLSelectElement | null =
        paginator.querySelector("select");
      if (!selectElement) {
        // If not, create and insert the select element
        selectElement = document.createElement("select");
        selectElement.value = selectedRowsPerPage;
        selectElement.onchange = handleRowsPerPageChange;
        selectElement.classList.add("paginator-dropdown-row");

        const options = ["4", "10", "20"].map((value) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          if (value === selectedRowsPerPage)
            option.setAttribute("selected", "");
          return option;
        });

        options.forEach((option) => selectElement?.appendChild(option));
        paginator.insertAdjacentElement("beforeend", selectElement);
      } else {
        // If the select element already exists, just update its value
        selectElement.value = selectedRowsPerPage;
      }
    }
  }, [
    selectedRowsPerPage,
    handleRowsPerPageChange
  ]);

  const toggleExpansion = (key: string) => {
    setExpandValue((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };
  const toggleColor = () => {
    setIsBlue(!isBlue);
  };

  const handleMoveToRoom = (asset: Asset) => {
    setSelectedProduct(asset);
    setIsMoveToRoomDialogVisible(true);
  };

  const handleSelect = (rowData: Asset) => {
    setShowExtraCard(true);
    setSelectedProduct(rowData);
  };

  const handleMoveToRoomClick = (asset: any) => {
    setTransferAsset(asset);
    setIsMoveToRoomDialogVisible(true);
  };

const handleTransferOwnershipClick = (
  saveFn: () => Promise<void>,
  assignFn: () => Promise<void>,
  asset: Asset,
  selectedOwner: {
    id?: string;
    name?: string;
    companyIfricId?: string;
    company_category?: string;
    country?: string;
    logoUrl?: string;
    city?: string;
  } | null
) => {
  // if (!selectedOwner) {
  //   showToast("error", "Missing Owner", "Please select a factory owner before transferring ownership.");
  //   return;
  // }

  // ✅ Use it here
  setFactoryOwner(selectedOwner);
  setTransferAsset(asset);
  setOnAcceptFns({ save: saveFn, assign: assignFn });
  setIsConfirmDialogVisible(true);
  setIsMoveToRoomDialogVisible(false);
};



const handleConfirmTransfer = async () => {
  if (!transferAsset) return;

  try {
    setIsConfirmDialogVisible(false); // close dialog
    if (onAcceptFns.save) await onAcceptFns.save();
    if (onAcceptFns.assign) await onAcceptFns.assign();
    showToast("success", "Success", "Ownership transferred successfully");
    dispatch(fetchAssetsRedux());
    router.push("/fleet-overview");
  } catch (error) {
    showToast("error", "Error", "Failed to transfer ownership");
  }
};;

  const assetIdBodyTemplate = (rowData: any) => {
    const key = expandValue[rowData?.id] || false;
    const formatId = (id: string) => {
    if (!id) return "";
    if (key) return id;
    const prefix = id.slice(10, 17);
    const lastSix = id.slice(-6);
    return (
      <span>
        <span className="id-prefix">{prefix}</span>
        <span className="id-dots">....</span>
        <span className="id-suffix">{lastSix}</span>
      </span>
    );
  };

  const handleCopy = (id: string) => {
    if (id) {
      navigator.clipboard.writeText(id);
      toast.current?.show({
        severity: "success",
        summary: "Copied",
        detail: "Industry Fusion ID copied to clipboard",
        life: 2000,
      });
    }
  };

    return (
      <div>
        <div
          className="flex gap-1 justify-content-left align-items-center"
        >
          {/* {rowData?.assetData?.asset_status === "complete" ? (
            <img src="/complete-icon.jpg" alt="complete-icon" />
          ) : (
            <img src="/incomplete-icon.jpg" alt="incomplete-icon" />
          )} */}
          <p className="tr-text-grey">{formatId(rowData?.id)}</p>
          <button
            onClick={() => handleCopy(rowData?.id)}
            className="transparent-btn"
            title="Copy ID"
          >
         <img src="/copy-icon.svg" width={16} height={16} />
        </button>
      </div>
    </div>
  );
};

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

  const sortedAssetsData = assets || [];

  const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...searchFilters };
    _filters['global'].value = value;
    setSearchFilters(_filters);
    setGlobalFilterValue(value);
  };

  const filterAssetsData = filterAssets(
    sortedAssetsData,
    selectedFilters,
  );


  console.log("transferasset",transferAsset)
  console.log("selectedprodct",selectedProduct)
  console.log("selectedasset",selectedAssets)
  console.log("factory Owner", factoryOwner?.name)

  return (
    <div className="container">
      {showContextMenu && (
        <ContextMenu
          model={menuModel}
          ref={cm}
        // onHide={() => setSelectedProduct(null)}
        />
      )}
      <Toast ref={toast} />
      {isMoveToRoomDialogVisible && (
        <MoveToRoomDialog
          visible={isMoveToRoomDialogVisible}
          onHide={() => setIsMoveToRoomDialogVisible(false)}
          asset={selectedProduct}
          assetName={selectedProduct?.product_name || "No Asset Name"}
          company_ifric_id={companyIfricId}
          onClick={() => handleMoveToRoomClick(selectedProduct)}
          assetIfricId={selectedProduct?.id || "No Asset Name"}
          onSave={() => {
            setIsMoveToRoomDialogVisible(false);
            showToast("success", "Success", "Asset moved successfully");
            dispatch(fetchAssetsRedux());
          }}
          onTransferOwnership={(saveFn, assignFn) =>
             handleTransferOwnershipClick(saveFn, assignFn, selectedProduct!)
          }
        />
      )}
      {isConfirmDialogVisible && transferAsset && (
        <ConfirmTransferDialog
          visible={isConfirmDialogVisible}
          onHide={() => setIsConfirmDialogVisible(false)}
          onConfirm={handleConfirmTransfer}
          assetName={transferAsset.product_name || "No Asset Name"}
          transferAsset={transferAsset}
          factoryOwner={testFactoryOwner}
        />
      )}
      <div className="flex">
        <Sidebar />
        <div className="main_content_wrapper">
          <div className="navbar_wrapper">
            <Navbar
              navHeader={"PDT Overview"}
            />
            <OverviewHeader
              assetCount={assetCount}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              accessgroupIndexDb={accessgroupIndexDb}
            />
            <TableHeader
              enableReordering={enableReordering}
              setEnableReordering={setEnableReordering}
              selectedGroupOption={selectedGroupOption}
              setSelectedGroupOption={setSelectedGroupOption}
              globalFilterValue={globalFilterValue}
              onFilter={activeTab === "Assets" && onFilter}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              groupOptions={groupOptions}
              tableData={
                activeTab === "Assets" && sortedAssetsData
              }
              activeTab={activeTab}
            />

            <div
              style={{
                paddingLeft: "24px",
                position: "relative",
                display: "flex",
                height: "calc(70vh - 14px)",
              }}
            >
              <div style={{ ...dataTableStyle, width: dataTableCardWidth }}>
                {activeTab === "Assets" && (
                  <>


                    {checkboxContainer(selectedAssets, showSelectedAsset, setSelectedAssets, filterAssetsData)}
                    <AssetTable
                      currentPage={currentPage}
                      selectedRowsPerPage={selectedRowsPerPage}
                      enableReordering={enableReordering}
                      selectedAssets={selectedAssets}
                      setSelectedAssets={setSelectedAssets}
                      handleSelect={handleSelect}
                      setShowSelectedAsset={setShowSelectedAsset}
                      setSelectedProduct={setSelectedProduct}
                      selectedProduct={selectedProduct}
                      cm={cm}
                      selectedGroupOption={selectedGroupOption}
                      t={t}
                      toggleColor={toggleColor}
                      isBlue={isBlue}
                      assetIdBodyTemplate={assetIdBodyTemplate}
                      assetsData={filterAssetsData}
                      loading={assetStatus === "loading"}
                      activeTab={activeTab}
                      onMoveToRoom={handleMoveToRoom}
                      searchFilters={searchFilters}
                      companyIfricId={companyIfricId}
                    />
                  </>


                )}
              </div>
              {showExtraCard && (
                <div style={{ width: "30%" }}>
                  <AssetDetailsCard
                    asset={selectedProduct}
                    setShowExtraCard={setShowExtraCard}
                  />
                </div>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "header",
        "overview",
        "placeholder",
      ])),
    },
  };
}

export default AssetOverView;
