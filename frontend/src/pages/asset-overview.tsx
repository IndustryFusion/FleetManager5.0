import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import AssetDetailsCard from "../components/asset-view";
import HorizontalNavbar from "../components/horizontal-navbar";
import Footer from "../components/footer";
import { Toast } from "primereact/toast";
import { CiClock2 } from "react-icons/ci";
import { GrView } from "react-icons/gr";
import { ContextMenu } from 'primereact/contextmenu';
import { InputText } from "primereact/inputtext";
import "../../public/styles/asset-overview.css";
import { CSSProperties } from "react";
import { Asset, AssetRow } from "@/interfaces/assetTypes";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function Asset() {

    const [selectedProduct, setSelectedProduct] = useState<Asset | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [showExtraCard, setShowExtraCard] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [dataTablePanelSize, setDataTablePanelSize] = useState<number>(100);
    const [isEditDialogVisible, setIsEditDialogVisible] = useState<boolean>(false);
    const [productDetails, setProductDetails] = useState<boolean>(false);
    const [globalFilterValue, setGlobalFilter] = useState<string>('');
    const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);
    const toast = useRef<Toast>(null);
    const cm = useRef(null);
    const router = useRouter();

    const dataTableCardWidth = showExtraCard ? "50%" : "85vw";
    // Resize handler for responsiveness
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value;
        setGlobalFilter(value);
    };


    // Function to map the backend data to the Asset structure
    const mapBackendDataToAsset = (backendData: any[]): Asset[] => {
        console.log("Before Formatting", backendData);

        return backendData.map((item: any) => {
            const newItem: any = {};
            Object.keys(item).forEach((key) => {
                if (key.includes("http://www.industry-fusion.org/schema#")) {
                    const newKey = key.replace(
                        "http://www.industry-fusion.org/schema#",
                        ""
                    );

                    if (item[key].type === "Property") {
                        newItem[newKey] = item[key].value
                    }
                    else if (item[key].type === "Relationship") {
                        newItem[newKey] = item[key].object
                    }
                }
                else {
                    if (key == "type" || key == "id") {
                        newItem[key] = item[key]
                    }
                }
            });
            return newItem;
        });
    };

    const fetchAsset = async () => {
        try {
            const response = await axios.get(BACKEND_API_URL + "/asset", {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                }
            });

            const responseData = response.data;
            const mappedData = mapBackendDataToAsset(responseData);
            console.log("Formatted data:: ", mappedData);
            setAssets(mappedData);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleRowDoubleClick = (rowData: Asset) => {
        localStorage.setItem("currentAssetId", rowData.id);
        router.push("/asset/asset-specific");
    };


    const onRowSelect = (rowData: Asset) => {
        setShowExtraCard(true);
        setSelectedProduct(rowData);
        if (!isMobile) {
            setDataTablePanelSize(40);
        }
        console.log("Opening side panel, DataTablePanelSize set to 30");
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

                console.log("Asset deleted successfully");
                // Handle successful deletion (e.g., refresh the asset list)
            } else {
                console.error("Failed to delete asset");
            }
        } catch (error) {
            console.error("Error deleting asset:", error);
        }
    };

    // Adding resize event listener
    useEffect(() => {
        fetchAsset();
        handleResize(); // Call on mount for client-side rendering
        window.addEventListener("resize", handleResize); // Add resize listener
        return () => window.removeEventListener("resize", handleResize); // Clean up
    }, []);

    useEffect(() => {
        const filteredAssets = globalFilterValue.length > 0 ? assets.filter(ele =>
            ele?.product_name.toLowerCase().includes(globalFilterValue.toLowerCase())
        ) : assets;

        // Update the searchedAssets state
        setSearchedAssets(filteredAssets);
    }, [globalFilterValue, assets]);

    const containerStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    };

    const mainContentStyle: CSSProperties = {
        display: "flex",
        flex: 1,
        padding: "1%",
    };

    const dataTableStyle: CSSProperties = {
        flexGrow: 1,
        overflow: "auto",

    };

    const menuModel = [
        { label: 'Duplicate', icon: 'pi pi-copy' }
    ]

    const productIconTemplate = (rowData: Asset) => {
        return rowData?.product_icon ? (
            <img
                src={rowData?.product_icon}
                alt={rowData?.product_name}
                style={{ width: "70px", height: "auto" }}
            />
        ) : (
            <span>No Image</span>
        );
    };

    const actionItemsTemplate = (rowData:Asset): React.ReactNode => {
        return (
            <div className="flex">
                <button
                    className="action-items-btn"
                    onClick={() => {router.push(`/asset/edit/${rowData?.id}`); console.log("rowData",rowData)}}
                >
                    <i className="pi pi-pencil"></i>
                </button>
                <button
                    className="action-items-btn"
                    onClick={() => rowData && window.confirm("Are you sure you want to delete this asset?")
                        ? handleDeleteAsset(rowData?.id) : null // Call the delete function with the selected product's ID
                    }
                >
                    <i className="pi pi-trash"></i>
                </button>
                <button className="action-items-btn">
                    <GrView />    
                </button>
            </div>
        )
    }

    const manufacturerDataTemplate = (rowData: Asset): React.ReactNode => {
        return (
            <div className="flex flex-column">
                <img src={rowData?.logo_manufacturer} alt="maufacturer_logo" style={{ width: "80px", height: "auto" }} />
                <p className="m-0 mt-1">{rowData?.asset_manufacturer_name}</p>
            </div>
        )
    }

    const statusBodyTemplate = (rowData: AssetRow): React.ReactNode => {
        return (
            <div className="flex align-items-center ">
                {rowData?.status_type === 'Complete' ?
                    <div className="status-complete-tag">
                        <i className="pi pi-check mt-1 mr-1"></i>
                        <span> Complete</span>
                    </div>
                    :
                    <div className="status-incomplete-tag">
                        <i className="mr-1 mt-1">  <CiClock2 /></i>
                        <span> Incomplete</span>
                    </div>
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


    return (
        <div style={{zoom:"85%"}}>
            <Toast ref={toast} />
            <HorizontalNavbar />

            {/* Applying 'desktop-view' class only when side panel is open and not in mobile view */}
            <div style={mainContentStyle}>
                <div style={{ ...dataTableStyle, width: dataTableCardWidth }}>
                    {/* <Card className="" style={{ height: "auto", overflow: "auto" }}> */}
                    <div className="flex align-center justify-content-between mt-6  p-2" >

                        <h3 className="asset-heading font-bold ml-4">Assets Overview</h3>

                        <div className="mt-5 search-container">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    value={globalFilterValue}
                                    onChange={onGlobalFilterChange}
                                    placeholder="Search..."
                                    className="searchbar-input" />
                            </span>
                        </div>
                        <div >
                            <button
                                className="asset-btn ml-1 mt-5"
                                onClick={handleCreateAssetClick}
                            >Create  Asset</button>
                        </div>

                    </div>
                    <div className="pl-4 pr-4">
                        <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedProduct(null)} />

                        <DataTable
                            value={searchedAssets || []} // Use the fetched assets as the data source
                            paginator
                            rows={4}
                            rowsPerPageOptions={[4, 10, 20]}
                            selectionMode="single"
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                            onRowDoubleClick={(e) => handleRowDoubleClick(e.data as Asset)}
                            className="custom-row-padding"
                            style={{ width: "100%", marginTop: "0", minHeight: 'calc(100vh-200px)'}}
                            scrollable
                            scrollHeight="400px"
                            onContextMenuSelectionChange={(e) => setSelectedProduct(e.value)}
                            onRowClick={(e) => {
                                setProductDetails(true)
                                onRowSelect(e.data as Asset)
                            }
                            }
                        >

                            <Column
                                field="product_name"
                                header="Product Name"
                                body={productNameBodyTemplate}
                                style={{ width: "160px" }}
                                sortable
                                frozen
                            ></Column>
                            <Column
                                field="product_icon"
                                header="Product Image"
                                body={productIconTemplate}
                                style={{ width: "120px" }}
                            ></Column>
                            <Column
                                field="asset_type"
                                header="Asset Type"
                                body={assetTypeBodyTemplate}
                                style={{ width: "160px" }}
                            >
                            </Column>

                            <Column
                                field="asset_manufacturer_name"
                                header="Manufacturer"
                                body={manufacturerDataTemplate}
                            ></Column>

                            <Column
                                field="manufacturing_year"
                                header="Manufacturing Year"
                                sortable
                                style={{ width: "120px" }}
                            ></Column>


                            <Column
                                field="asset_serial_number"
                                header="Serial Number"
                            ></Column>
                            <Column
                                field="creation_date"
                                header="Creation Date"
                                sortable
                            >
                            </Column>

                            <Column field="voltage_type"
                                header="Voltage Type"
                            ></Column>
                            <Column
                                field="asset_category"
                                header="Category"
                                sortable></Column>
                            <Column
                                field="asset_communication_protocol"
                                header="Protocol"
                                style={{ width: "180px" }}
                            ></Column>
                            <Column field="live_asset_status"
                                header="Asset Status"
                                body={statusBodyTemplate}
                                frozen
                            ></Column>
                            <Column
                                body={actionItemsTemplate}
                                frozen
                            >
                            </Column>
                        </DataTable>

                    </div>
                    <Dialog
                        header="Edit Asset"
                        visible={isEditDialogVisible}
                        onHide={() => setIsEditDialogVisible(false)}
                        style={{ width: "90vw" }}
                    >
                        {/* {editingAsset && renderEditForm()} */}
                    </Dialog>
                </div>
                {selectedProduct && (

                    <Dialog visible={productDetails}
                        onHide={() => setProductDetails(false)}
                        className="asset-overview-dialog"
                    >
                        <div>
                            <AssetDetailsCard
                                asset={selectedProduct}
                            />
                        </div>
                    </Dialog>
                )}
            </div>

            <Footer />
        </div>
    );
}