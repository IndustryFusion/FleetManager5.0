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

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode, MouseEvent } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AssetDetailsCard from "../components/asset-view";
import HorizontalNavbar from "../components/horizontal-navbar";
import Footer from "../components/footer";
import { Toast, ToastMessage } from "primereact/toast";
import { GrView } from "react-icons/gr";
import { ContextMenu } from 'primereact/contextmenu';
import { InputText } from "primereact/inputtext";
import "../../public/styles/asset-overview.css";
import { CSSProperties } from "react";
import { Asset } from "@/interfaces/assetTypes";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import Cookies from "js-cookie";
import { fetchAssets } from "@/utility/asset";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const Asset: React.FC = () => {

    const [selectedProduct, setSelectedProduct] = useState<Asset | null>(null);
    const [selectedRowsPerPage, setSelectedRowsPerPage] = useState<string>("4");
    const [assets, setAssets] = useState<Asset[]>([]);
    const [showExtraCard, setShowExtraCard] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [dataTablePanelSize, setDataTablePanelSize] = useState<number>(100);
    const [globalFilterValue, setGlobalFilter] = useState<string>('');
    const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<Asset | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const toast = useRef<Toast>(null);
    const cm = useRef(null);
    const router = useRouter();
    const dataTableCardWidth = showExtraCard ? "50%" : "100%";
    const { t } = useTranslation(['overview', 'placeholder']);
    //Resize handler for responsiveness
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };


    const handleSelect = (rowData: Asset) => {
        setShowExtraCard(true);
        setSelectedProduct(rowData);
        if (!isMobile) {
            setDataTablePanelSize(40);
        }
    }


    const handleRowsPerPageChange = (event: any) => {
        setSelectedRowsPerPage(event.target.value);
    };

    const handleCreateAssetClick = () => {
        router.push("/templates"); // This will navigate to the /templates
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
                const updatedAssets = assets.filter(asset => asset.id !== assetId)
                setAssets(updatedAssets)
                showToast('success', 'Deleted success', 'Asset deleted successfully')
            } else {
                console.error("Failed to delete asset");
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error("Error response:", error.response?.data.message);
                showToast('error', 'Error', 'Deleting asset');
            } else {
                console.error("Error:", error);
                showToast('error', 'Error', error);
            }
        }
    };

    const fetchAsset = async () => {
        try {
            const response = await fetchAssets();
            setAssets(response || []);

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error("Error response:", error.response?.data.message);
                showToast('error', 'Error', 'Fetching assets');
            } else {
                console.error("Error:", error);
                showToast('error', 'Error', error);
            }
        }
    }



    //Adding resize event listener
    useEffect(() => {
        if (Cookies.get("login_flag") === "false") {
            router.push("/login");
        }
        else {
            const storedValue = localStorage.getItem('selectedRowsPerPage');

            if (storedValue) {
                setSelectedRowsPerPage(parseInt(storedValue, 10));
            }

            fetchAsset();
            handleResize(); // Call on mount for client-side rendering
            window.addEventListener("resize", handleResize); // Add resize listener
            return () => window.removeEventListener("resize", handleResize); // Clean up
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('selectedRowsPerPage', String(selectedRowsPerPage));

        const paginator = document.querySelector('.p-paginator');
        if (paginator) {
            // Check if the select element already exists
            let selectElement = paginator.querySelector('select');
            if (!selectElement) {
                // If not, create and insert the select element
                selectElement = document.createElement('select');
                selectElement.value = selectedRowsPerPage;
                selectElement.onchange = handleRowsPerPageChange;

                selectElement.classList.add('paginator-dropdown-row');

                const options = ['4', '10', '20'].map(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    if (value === selectedRowsPerPage) option.setAttribute('selected', '');
                    return option;
                });

                options.forEach(option => selectElement.appendChild(option));
                paginator.insertBefore(selectElement, paginator.firstChild);
            } else {
                // If the select element already exists, just update its value
                selectElement.value = selectedRowsPerPage;
            }
        }
    }, [selectedRowsPerPage, handleRowsPerPageChange]);




    const containerStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    };

    const mainContentStyle: CSSProperties = {
        display: "flex",
        padding: "1%",
        zoom: "90%",
    };

    const dataTableStyle: CSSProperties = {
        flexGrow: 1,
        overflow: "auto",

    };

    const menuModel = [
        { label: 'Duplicate', icon: 'pi pi-copy' }
    ]

    const productIconTemplate = (rowData: Asset) => {
        if (rowData && rowData.product_icon && rowData.product_icon !== 'NULL') {
            return (
                <img
                    src={rowData.product_icon}
                    style={{ width: "70px", height: "auto" }}
                />
            );
        } else {
            return <span>No Image</span>;
        }
    };

    const actionItemsTemplate = (rowData: Asset): React.ReactNode => {
        let deleteWarning = t('overview:deleteWarning');
        return (
            <div className="flex">
                <button
                    className="action-items-btn"
                    onClick={() => { router.push(`/asset/edit/${rowData?.id}`) }}
                >
                    <i className="pi pi-pencil"></i>
                </button>
                <button
                    className="action-items-btn"
                    onClick={() => rowData && window.confirm(deleteWarning)
                        ? handleDeleteAsset(rowData?.id) : null // Call the delete function with the selected product's ID
                    }
                >
                    <i className="pi pi-trash"></i>
                </button>           
            </div>
        )
    }

    const manufacturerDataTemplate = (rowData: Asset): React.ReactNode => {
        return (
            <div className="flex flex-column">
                {rowData?.logo_manufacturer && rowData.logo_manufacturer !== 'NULL' &&
                    <img src={rowData?.logo_manufacturer} alt="maufacturer_logo" className="w-4rem shadow-2 border-round" />
                }
                <p className="m-0 mt-1">{rowData?.asset_manufacturer_name}</p>
            </div>
        )
    }

    const statusBodyTemplate = (rowData: Asset): React.ReactNode => {
        return (
            <div>
                {rowData?.asset_status === 'complete' ?
                    <Button label={"complete"} severity="success" text disabled className="mr-2 mt-1" icon="pi pi-check-circle"> </Button>
                    :
                    <Button label={"incomplete"} severity="danger" text disabled className="mr-2 mt-1" icon="pi pi-exclamation-circle"> </Button>
                }
            </div>
        );
    }
    const productNameBodyTemplate = (rowData: any) => {
        return <>{rowData?.product_name}</>;
    };
    const assetTypeBodyTemplate = (rowData: any) => {
        const assetType = rowData?.type?.split('/')[5];
        return <>{assetType}</>;
    };

    const showToast = (severity: ToastMessage['severity'], summary: string, message: string) => {
        toast.current?.show({ severity: severity, summary: summary, detail: message, life: 8000 });
    };

    const exportJsonData = async () => {
        let newExportdata = []
        for (let i = 0; i < selectedAssets?.length; i++) {
            try {
                const response = await axios.get(
                    BACKEND_API_URL + `/asset/${selectedAssets[i].id}`,
                    {
                        headers: {
                            "Content-Type": "application/ld+json",
                            "Accept": "application/ld+json",
                        },
                        withCredentials: true,
                    }
                );
                if (response) { newExportdata.push(response.data); }
            }
            catch (err) {
                console.log('Failed to get data for export ' + err);
            }
        }

        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(newExportdata, null, 2)
        )}`;

        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "data.json";
        link.click();
    };

    const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGlobalFilter(value);

        if (value.length === 0) {
            fetchAsset();
        }
        else {
            const filteredAssets = value.length > 0 ? [...assets].filter(ele =>
                ele?.product_name.toLowerCase().includes(globalFilterValue.toLowerCase())
            ) : assets;
            setAssets(filteredAssets);
        }
    }

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label={t('overview:newAsset')} icon="pi pi-plus" className="bg-green-305 border-transparent" severity="success" onClick={handleCreateAssetClick} />
            </div>
        );
    };

    const centerContent = () => {
        return (
            <div className="search-container">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onFilter}
                        placeholder={t('placeholder:search')}
                        className="searchbar-input" style={{ borderRadius: "10px" }} />
                </span>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <>
                <Button label={t('overview:export')} icon="pi pi-upload" className="p-button-help bg-purple-305  border-transparent" onClick={exportJsonData} />
            </>
        )
    };



    return (
        <div>
            <Toast ref={toast} />
            <HorizontalNavbar />
            {/* Applying 'desktop-view' class only when side panel is open and not in mobile view */}
            <div style={mainContentStyle}>
                <div style={{ ...dataTableStyle, width: dataTableCardWidth }}>
                    {/* <Card className="" style={{ height: "auto", overflow: "auto" }}> */}
                    <div className="flex align-center justify-content-between mt-6  p-2" >
                        <div>
                            <p className="hover" style={{ fontWeight: "bold", fontSize: "1.4rem", marginTop: "20px", marginLeft: "20px" }}>
                                {t('overview:assetOverview')}
                            </p>
                        </div>
                    </div>
                    <div className="pl-4 pr-4">
                        <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedProduct(null)} />
                        <Toolbar start={leftToolbarTemplate} center={centerContent} end={rightToolbarTemplate}
                            style={{ marginBottom: "-20px", marginTop: "-15px", backgroundColor: "#a7e3f985", borderColor: "white" }}></Toolbar>
                        <DataTable
                            value={assets} // Use the fetched assets as the data source
                            currentpage={currentPage}
                            first={currentPage * Number(selectedRowsPerPage)}
                            paginator
                            selectionMode="multiple"
                            rows={Number(selectedRowsPerPage)}
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                            className="custom-row-padding"
                            tableStyle={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 300px)' }}
                            scrollable
                            scrollHeight='calc(100vh - 350px)'
                            onRowClick={(e) => setSelectedAssets(e.data as Asset)}
                            onRowDoubleClick={(e) => handleSelect(e.data as Asset)}
                            selection={selectedAssets}
                            onSelectionChange={(e) => {
                                if (Array.isArray(e.value)) {
                                    setSelectedAssets(e.value);
                                }
                                else {
                                    console.error('Expected e.value to be an array, but got:', e.value);
                                }
                            }}
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                            <Column
                                field="product_name"
                                header={t('overview:productName')}
                                body={productNameBodyTemplate}
                                style={{ width: "160px" }}
                                sortable

                            ></Column>
                            <Column
                                field="product_icon"
                                header={t('overview:productImage')}
                                body={productIconTemplate}
                                style={{ width: "160px" }}
                            ></Column>
                            <Column
                                field="asset_type"
                                header={t('overview:assetType')}
                                body={assetTypeBodyTemplate}
                                style={{ width: "150px" }}
                            >
                            </Column>
                            <Column
                                field="asset_manufacturer_name"
                                header={t('overview:manufacturer')}
                                body={manufacturerDataTemplate}
                                style={{ width: "120px" }}
                            ></Column>
                            <Column
                                field="manufacturing_year"
                                header={t('overview:manufacturingYear')}
                                sortable
                                style={{ width: "100px" }}
                            ></Column>
                            <Column
                                field="asset_serial_number"
                                header={t('overview:serialNumber')}
                            ></Column>
                            <Column
                                field="creation_date"
                                header={t('overview:creationDate')}
                                sortable
                            >
                            </Column>
                            <Column field="voltage_type"
                                header={t('overview:voltageType')}
                            ></Column>
                            <Column
                                field="asset_category"
                                header={t('overview:catagory')}
                                sortable></Column>
                            <Column
                                field="asset_communication_protocol"
                                header={t('overview:protocol')}
                                style={{ width: "100px" }}
                            ></Column>
                            <Column field="asset_status"
                                header={t('overview:assetStatus')}
                                body={statusBodyTemplate}

                            ></Column>
                            <Column
                                body={actionItemsTemplate}
                            >
                            </Column>
                        </DataTable>
                    </div>
                </div>
                {showExtraCard &&
                    <div style={{ width: "45%" }}>
                        <AssetDetailsCard asset={selectedProduct} setShowExtraCard={setShowExtraCard} />
                    </div>
                }
            </div>
            <Footer />
        </div>
    );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
      props: {
        ...(await serverSideTranslations(locale, [
          'header',
          'overview',
          'placeholder'
        ])),
      },
    }
}

export default Asset;