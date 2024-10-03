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
import Cookies from "js-cookie";
import {fetchAssets} from "@/utility/asset";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import OverviewHeader from "@/components/assetOverview/overview-header";
import { checkboxContainer, filterAssets } from "@/utility/assetTable";
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
  const [isSidebarExpand, setSidebarExpand] = useState(true);
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
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState("Assets");

  const setIndexedDb = async (token: string) => {
    try {
      await getAccessGroupData(token);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data.message);
        showToast("error", "Error", "Fetching assets");
      } else {
        console.error("Error:", error);
        showToast("error", "Error", error);
      }
    }
  }
  const getCompanyId = async()=>{
    const details = await getAccessGroup();
    setCompanyIfricId(details.company_ifric_id)
  }
  useEffect(() => {
    getCompanyId();
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setIndexedDb(token);
    }
  }, []);

  const dataTableStyle: CSSProperties = {
    flexGrow: 1,
    overflow: "auto",
  };

  const handleRowsPerPageChange = (event: any) => {
    setSelectedRowsPerPage(event.target.value);
  };
  
  const fetchAsset = async () => {
    try {
      const response = await fetchAssets();
      setAssetCount(response?.length || 0);
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
    if (assetStatus === "idle") {
      dispatch(fetchAssetsRedux());
    }
  }, [dispatch, assetStatus]);
  

  useEffect(()=>{
    setAssets(reduxAssets)
    setAssetCount(reduxAssets?.length)
  },[reduxAssets])

  useEffect(() => {
    dispatch(fetchTemplates());
    if (Cookies.get("login_flag") === "false") {
      router.push("/login");
    } else {
      const storedValue = localStorage.getItem("selectedRowsPerPage");
      if (storedValue) {
        setSelectedRowsPerPage(storedValue);
      } 
      if(assets.length === 0){
        fetchAsset();
      }
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape" && activeTab === "Assets" ) {
          setSelectedAssets([]);
          setShowSelectedAsset(false);      
          }
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }
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

  const assetIdBodyTemplate = (rowData: any) => {
    const key = expandValue[rowData?.assetData?.id] || false;
    return (
      <div>
        <div
          className="flex gap-1 justify-content-center align-items-center tr-text"
          style={{ width: "271px" }}
        >
          {rowData?.assetData?.asset_status === "complete" ? (
            <img src="/complete-icon.jpg" alt="complete-icon" />
          ) : (
            <img src="/incomplete-icon.jpg" alt="incomplete-icon" />
          )}
          <p className={key ? "expand-id-text" : "id-text"}>{rowData?.assetData?.id}</p>
          <button
            onClick={() => toggleExpansion(rowData?.assetData?.id)}
            className="transparent-btn"
          >
            <i className="pi pi-angle-down"></i>
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

  const sortedAssetsData = [...assets].sort((a, b) => {
    if (a.assetData.product_name.toUpperCase() < b.assetData.product_name.toUpperCase()) return -1;
    if (a.assetData.product_name.toUpperCase() > b.assetData.product_name.toUpperCase()) return 1;
    return 0;
  });


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



  return (
    <div className="container">
      <Toast ref={toast} />
      {isMoveToRoomDialogVisible && (
        <MoveToRoomDialog
        visible={isMoveToRoomDialogVisible}
        onHide={() => setIsMoveToRoomDialogVisible(false)}
        assetName={selectedProduct?.assetData?.product_name || "No Asset Name"}
        company_ifric_id={companyIfricId}
        assetIfricId={selectedProduct?.assetData?.id || "No Asset Name"}
        onSave={() => {
          setIsMoveToRoomDialogVisible(false);
          showToast("success", "Success", "Asset moved successfully");
          dispatch(fetchAssetsRedux())
        }}
      />
      )}
      <div className="flex">
        <div className={isSidebarExpand ? "sidebar-container" : "collapse-sidebar"}>
          <Sidebar isOpen={isSidebarExpand} setIsOpen={setSidebarExpand} />
        </div>
        <div
          className={`asset-overview ${
            isSidebarExpand ? "" : "asset-overview-expand"
          } ${
            isSidebarExpand && showExtraCard
              ? "asset-overview-sidebar-expand"
              : ""
          }`}
        >
          <Navbar 
          navHeader={"PDT Overview"}
          />
          <OverviewHeader
            assetCount={ assetCount }
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
            onFilter={activeTab === "Assets" && onFilter }
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
              {activeTab === "Assets" &&
              checkboxContainer(selectedAssets, showSelectedAsset, setSelectedAssets, filterAssetsData)
              }         
              {activeTab === "Assets" && (
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
                  activeTab={activeTab}
                  onMoveToRoom={handleMoveToRoom}
                  searchFilters={searchFilters}
                />
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
      </div>
      <Footer />
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
