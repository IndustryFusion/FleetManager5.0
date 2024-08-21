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
import { ContextMenu } from "primereact/contextmenu";
import { Asset } from "@/interfaces/assetTypes";
import Cookies from "js-cookie";
import {fetchAssets, prefixJsonKeys, postJsonData, importExcelFile, importCsvFile, createModelObject, getCompanyIfricId} from "@/utility/asset";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import QRCodeDialog from "@/components/qrcode-dialog";
import { FiCopy, FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import OverviewHeader from "@/components/assetOverview/overview-header";
import { checkboxContainer, filterAssets } from "@/utility/assetTable";
import AssetTable from "@/components/assetOverview/asset-table";
import TableHeader from "@/components/assetOverview/table-header";
import CloneDialog from "@/components/assetOverview/clone-dialog";
import FileImportDialog from "@/components/import-asset/file-mode";
import { fetchTemplates } from '@/redux/templates/templatesSlice';
import { AppDispatch, RootState, store } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import "../../public/styles/asset-overview.css";
import { getAccessGroup  } from "@/utility/indexed-db";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const context = process.env.CONTEXT;
type ExpandValue = {
  [key: string]: boolean;
};
type Model = {
  type: string;
};

const AssetOverView: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [selectedModelAssets, setSelectedModelAssets]=useState<Asset[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Asset | null>(null);
  const [showSelectedAsset, setShowSelectedAsset] = useState(false);
  const [selectedRowsPerPage, setSelectedRowsPerPage] = useState<string>("4");
  const [assetCount, setAssetCount] = useState(0);
  const [modelAssetCount, setModelAssetCount] = useState(0);
  const [showExtraCard, setShowExtraCard] = useState<boolean>(false);
  const [globalFilterValue, setGlobalFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const dataTableCardWidth = showExtraCard ? "70%" : "100%";
  const { t } = useTranslation(["overview", "placeholder"]);
  const [qrCodeLink, setQrCodeLink] = useState<string | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const qrCodeDialogRef = useRef<HTMLDivElement>(null);
  const [expandValue, setExpandValue] = useState<ExpandValue>({});
  const [enableReordering, setEnableReordering] = useState(false);
  const [isBlue, setIsBlue] = useState(false);
  const [isSidebarExpand, setSidebarExpand] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedGroupOption, setSelectedGroupOption] = useState(null);
  const [modelData, setModelData] = useState<any[]>([]);
  const [groupOptions, setGroupOptions] = useState([
    { label: "Product Type", value: "type" },
    { label: "Manufacturer", value: "asset_manufacturer_name" },
  ]);
  const [importOptions, setImportOptions] = useState([
    { label: "ERP mode", value: "ERP" },
    { label: "FILE mode", value: "FILE" },
    { label: "Scanner mode", value: "SCANNER" },
  ]);
  const [cloneDialog, setCloneDialog] = useState(false);
  const toast = useRef<Toast>(null);
  const cm = useRef(null);
  const router = useRouter();
  let deleteWarning = t("overview:deleteWarning");
  const [isFileImportDialogVisible, setIsFileImportDialogVisible] = useState(false);
  const [accessgroupIndexDb, setAccessgroupIndexedDb] =useState<any>(null);
  useEffect(() => {
    getAccessGroup((data) => {
      setAccessgroupIndexedDb(data);
  
    });
  }, []);


  console.log("selectedProduct inmodel", selectedProduct);
  
  const menuModel = [
    {
      label: "Edit",
      icon: <FiEdit3 />,
      command: () => {
        if (activeTab === "Assets") {
          getAccessGroup((latestAccessGroup) => {
            if (latestAccessGroup?.update) {
              if (selectedProduct && selectedProduct.id) {
                router.push(`/asset/edit/${selectedProduct.id}`);
              } else {
                showToast("error", "Error", "No product selected for editing");
              }
            } else {
              showToast("error", "Access Denied", "You don't have permission to edit");
            }
          });
        } else if (activeTab === "Models") {
          router.push("/model-object/edit");
        }
      },
      disabled: !accessgroupIndexDb?.update
    } ,
      { 
        label: "Clone", 
        icon: <FiCopy />, 
        command: () => {
          getAccessGroup((latestAccessGroup) => {
            if (latestAccessGroup?.create) { 
              setCloneDialog(true);
            } else {
              showToast("error", "Access Denied", "You don't have permission to clone");
            }
          });
        },
        disabled: !accessgroupIndexDb?.create
      },
      {
        label: "Deactivated Alert",
        icon: <img src="/comment-remove.jpg" alt="remove-comment-icon"/>,
        command: () => { },
        disabled: true
      },
      { 
        label: "Move to Room", 
        icon: <img src="/logout.svg" alt="remove-comment-icon"/>,
        command: () => {},
        disabled: true
      },
      {
        label: "Delete",
        icon: <RiDeleteBinLine />,
        command: () => {
          if (activeTab === "Assets") {
          getAccessGroup((latestAccessGroup) => {
            if (latestAccessGroup?.delete) {
              if (selectedProduct && window.confirm(deleteWarning)) {
                handleDeleteAsset(selectedProduct.id);
              }
            } else {
              showToast("error", "Access Denied", "You don't have permission to delete");
            }
          });
        }
        },
        disabled: !accessgroupIndexDb?.delete
      },
    ]



  const { query } = router;
  const templates = useSelector((state: RootState) => state.templates.templates);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (query.tab) {
      const tab = Array.isArray(query.tab) ? query.tab[0] : (query.tab || "Assets");
      setActiveTab(tab);
    }
  }, [query.tab]);
  const initialTab = Array.isArray(query.tab) ? query.tab[0] : (query.tab || "Assets");
  const [activeTab, setActiveTab] = useState(initialTab);

  const dataTableStyle: CSSProperties = {
    flexGrow: 1,
    overflow: "auto",
  };

  const handleImportOptionSelect = (option: string) => {
    switch (option) {
      case "ERP":
        router.push("/erp/settings");
        break;
      case "FILE":
        setIsFileImportDialogVisible(true);
        break;
      case "SCANNER":
        break;
      default:
        console.error("Unknown import option");
    }
  };
  const handleRowsPerPageChange = (event: any) => {
    setSelectedRowsPerPage(event.target.value);
  };

  const fetchAsset = async () => {
    try {
      const response = await fetchAssets();
      console.log('response ',response)
      setAssetCount(response?.length || 0);
      setAssets(response || []);
      console.log("all assets here", response);
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
  const fetchModelAssets = async () => {
    try {
      const response = await axios.get(BACKEND_API_URL + "/model-object", {
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
      });
      // console.log("response here", response);

      setModelData(response?.data);
      setModelAssetCount(response?.data?.length || 0);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(fetchTemplates());
    fetchModelAssets();
  }, []);

  useEffect(() => {
    if (Cookies.get("login_flag") === "false") {
      router.push("/login");
    } else {
      const storedValue = localStorage.getItem("selectedRowsPerPage");
      if (storedValue) {
        setSelectedRowsPerPage(storedValue);
      }
      fetchAsset();
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape" && activeTab === "Assets" ) {
          setSelectedAssets([]);
          setShowSelectedAsset(false);
          showToast("success", "success", "All assets deselected");      
          }else if(event.key === "Escape" && activeTab === "Models"){
            setSelectedModelAssets([]);
            setShowSelectedAsset(false);
            showToast("success", "success", "All assets deselected");
          }
       
        
      };
      window.addEventListener("keydown", handleEsc);

      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, []);

  useEffect(() => {
    if (isDialogVisible) {
      setTimeout(renderQrCode, 100); // Add a delay to ensure the dialog is fully rendered
    }
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
    handleRowsPerPageChange,
    isDialogVisible,
    qrCodeLink,
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

  const handleSelect = (rowData: Asset) => {
    setShowExtraCard(true);
    setSelectedProduct(rowData);
  };
  const handleDeleteAsset = async (assetId: string) => {
    try {
      const response = await axios.delete(
        BACKEND_API_URL + `/asset/${assetId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const updatedAssets = assets.filter((asset) => asset.id !== assetId);
        setAssets(updatedAssets);
        showToast("success", "Deleted success", "Asset deleted successfully");
      } else {
        console.error("Failed to delete asset");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data.message);
        showToast("error", "Error", "Deleting asset");
      } else {
        console.error("Error:", error);
        showToast("error", "Error", error);
      }
    }
  };

  //Render QR CODE
  const renderQrCode = async () => {
    if (qrCodeLink && qrCodeDialogRef.current) {
      try {
        const QRCodeStyling = (await import("qr-code-styling")).default;
        const qrCodeInstance = new QRCodeStyling({
          width: 300,
          height: 300,
          data: qrCodeLink,
          image: "/industryFusion_icon-removebg-preview.png",
          dotsOptions: {
            color: "#000000",
            type: "rounded",
          },
          backgroundOptions: {
            color: "#FFFFFF",
          },
          cornersSquareOptions: {
            color: "#716a6a",
          },
          cornersDotOptions: {
            color: "#000000",
          },
          imageOptions: {
            crossOrigin: "anonymous",
          },
        });
        qrCodeDialogRef.current.innerHTML = "";
        qrCodeInstance.append(qrCodeDialogRef.current);
      } catch (error) {
        console.error("Failed to load QRCodeStyling or create QR code:", error);
      }
    } else {
      console.error(
        "qrCodeDialogRef.current is null or qrCodeLink is null",
        qrCodeDialogRef.current,
        qrCodeLink
      );
    }
  };
  const assetIdBodyTemplate = (rowData: any) => {
    const key = expandValue[rowData?.id] || false;
    return (
      <div>
        <div
          className="flex gap-1 justify-content-center align-items-center tr-text"
          style={{ width: "271px" }}
        >
          {rowData?.asset_status === "complete" ? (
            <img src="/complete-icon.jpg" alt="complete-icon" />
          ) : (
            <img src="/incomplete-icon.jpg" alt="incomplete-icon" />
          )}
          <p className={key ? "expand-id-text" : "id-text"}>{rowData?.id}</p>
          <button
            onClick={() => toggleExpansion(rowData?.id)}
            className="transparent-btn"
          >
            <i className="pi pi-angle-down"></i>
          </button>
        </div>
      </div>
    );
  };
  const qrCodeTemplate = (rowData: Asset) => {
    const handleQrCodeClick = () => {
      setQrCodeLink(`https://public.ifric.org/` + rowData.id);
      setIsDialogVisible(true);
    };
    return (
      <button onClick={handleQrCodeClick} className="transparent-btn">
        <img src="/qr-code-2.jpg" alt="qr-icon" style={{ cursor: "pointer" }} />
      </button>
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
    if (a.product_name < b.product_name) return -1;
    if (a.product_name > b.product_name) return 1;
    return 0;
  });
  const sortedModelAssetsData = [...modelData].sort((a: Model, b: Model) => {
    if (a?.type < b.type) return -1;
    if (a.type > b.type) return 1;
    return 0;
  });

  const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilter(value);

    if (value.length === 0) {
      fetchAsset();
    } else {
      const filteredAssets =
        value.length > 0
          ? [...assets].filter((ele) =>
              ele?.product_name
                .toLowerCase()
                .includes(globalFilterValue.toLowerCase())
            )
          : assets;
      setAssets(filteredAssets);
    }
  };

  const onModelAssetsFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilter(value);

    if (value.length === 0) {
      fetchModelAssets();
    } else {
      const filteredAssets =
        value.length > 0
          ? [...modelData].filter(
              (ele) =>
                ele &&
                ele.properties &&
                ele?.properties?.product_name
                  .toLowerCase()
                  .includes(globalFilterValue.toLowerCase())
            )
          : modelData;
      setModelData(filteredAssets);
    }
  };

  const filterAssetsData = filterAssets(
    sortedAssetsData,
    selectedFilters,
    activeTab
  );
  const filterModelAssets = filterAssets(
    sortedModelAssetsData,
    selectedFilters,
    activeTab
  );

  const matchingTemplateType = (category: string, templates: any[]) => {
    const res = templates.find((template) => template.parsedData.$id.includes(category));
    return res;
  };

  const handleFileImport = async (file: File) => {
    try {
      const state = store.getState() as RootState;
      const templates = state.templates.templates;
      let jsonData;
      if (file.name.endsWith('.csv')) {
        jsonData = await importCsvFile(file);
      } else {
        jsonData = await importExcelFile(file);
      }
      const filteredData = jsonData.slice(4); // Filter out the first four rows
      const prefixedData = prefixJsonKeys(filteredData);
      for (const item of prefixedData) {
        try {
          const assetCategory = item.asset_category;
          const matchingTemplate = matchingTemplateType(assetCategory, templates);
          let dataToPost;
          if (matchingTemplate) {
            dataToPost = {
              type: matchingTemplate.parsedData.$id,
              title: matchingTemplate.title,
              company_ifric_id: getCompanyIfricId(),
              properties: item
            };
          } else {
            dataToPost = {
              type: "https://industry-fusion.org/base/v0.1/common",
              title: "Common template",
              company_ifric_id: getCompanyIfricId(),
              properties: item
            };
          }
          await postJsonData(dataToPost, toast);
          await createModelObject(dataToPost, toast);
        } catch (innerError) {
          console.error('Error processing item:', item, innerError);
          showToast("error", "Error", `Error processing item with serial number ${item.asset_serial_number}`);
        }
      }
      showToast("success", "Success", "File import completed");
    } catch (error) {
      console.error('Error during file import:', error);
      showToast("error", "Error", "File import failed");
    }
  };


  return (
    <div className="container">
      <Toast ref={toast} />
      <FileImportDialog
        visible={isFileImportDialogVisible}
        onHide={() => setIsFileImportDialogVisible(false)}
        onImport={handleFileImport}
      />
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
          navHeader={activeTab === "Assets" ?"Asset Overview":"Model Overview"}
          />
          <OverviewHeader
            assetCount={activeTab === "Assets" ? assetCount : modelAssetCount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            importOptions={importOptions}
            onImportOptionSelect={handleImportOptionSelect}
            accessgroupIndexDb={accessgroupIndexDb}
          />
          <TableHeader
            enableReordering={enableReordering}
            setEnableReordering={setEnableReordering}
            selectedGroupOption={selectedGroupOption}
            setSelectedGroupOption={setSelectedGroupOption}
            globalFilterValue={globalFilterValue}
            onFilter={activeTab === "Assets" ? onFilter : onModelAssetsFilter}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            groupOptions={groupOptions}
            tableData={
              activeTab === "Assets" ? sortedAssetsData : sortedModelAssetsData
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
              <ContextMenu
                model={menuModel}
                ref={cm}
                onHide={() => setSelectedProduct(null)}
              />
              {activeTab === "Assets" &&
              checkboxContainer(selectedAssets, showSelectedAsset, setSelectedAssets, filterAssetsData)
              } 
              {activeTab === "Models" && selectedModelAssets.length > 0 &&
                 checkboxContainer(selectedModelAssets, showSelectedAsset, setSelectedModelAssets, filterModelAssets)
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
                  qrCodeTemplate={qrCodeTemplate}
                  toggleColor={toggleColor}
                  isBlue={isBlue}
                  assetIdBodyTemplate={assetIdBodyTemplate}
                  assetsData={filterAssetsData}
                  activeTab={activeTab}
                />
              )}
              {activeTab === "Models" && (
                <AssetTable
                  currentPage={currentPage}
                  selectedRowsPerPage={selectedRowsPerPage}
                  enableReordering={enableReordering}
                  selectedAssets={selectedModelAssets}
                  setSelectedAssets={setSelectedModelAssets}
                  handleSelect={handleSelect}
                  setShowSelectedAsset={setShowSelectedAsset}
                  setSelectedProduct={setSelectedProduct}
                  selectedProduct={selectedProduct}
                  cm={cm}
                  selectedGroupOption={selectedGroupOption}
                  t={t}
                  qrCodeTemplate={qrCodeTemplate}
                  toggleColor={toggleColor}
                  isBlue={isBlue}
                  assetIdBodyTemplate={assetIdBodyTemplate}
                  assetsData={filterModelAssets}
                  activeTab={activeTab}
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
          <QRCodeDialog
            qrCodeLink={qrCodeLink}
            dialogProp={isDialogVisible}
            setDialogProp={setIsDialogVisible}
            qrCodeDialogRef={qrCodeDialogRef}
          />
          {cloneDialog && 
          <CloneDialog
          cloneDialog={cloneDialog}
          setCloneDialog={setCloneDialog}
          activeTab={activeTab}
          />
          }
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
