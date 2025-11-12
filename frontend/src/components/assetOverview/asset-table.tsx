import { Asset } from "@/interfaces/assetTypes";
import {
  assetTypeBodyTemplate,
  ifricIdHeader,
  manufacturerDataTemplate,
  manufacturerHeader,
  productNameBodyTemplate,
  productNameHeader,
  productTypeHeader,
  serialNumberBodyTemplate,
  serialNumberHeader,
  ownerBodyTemplate,
  actionItemsTemplate,
  ownerHeader
} from "@/utility/assetTable";
import { Column } from "primereact/column";

import { DataTable } from "primereact/datatable";
import React, { useEffect,useState } from "react";


const AssetTable: React.FC<any> = ({
  currentPage,
  selectedRowsPerPage,
  enableReordering,
  selectedAssets,
  setSelectedAssets,
  handleSelect,
  setShowSelectedAsset,
  t,
  cm,
  selectedGroupOption,
  toggleColor,
  isBlue,
  assetIdBodyTemplate,
  assetsData,
  activeTab,
  onMoveToRoom,
  searchFilters ,
  selectedProduct,
  setSelectedProduct
}) => {

  const [rangeDisplay, setRangeDisplay] = useState('');
  const columnConfig = [
    {
      selectionMode: "multiple" as "multiple",
      headerStyle: { width: "3rem" },
      columnKey: "assetSelectCheckBox",
    },
    {
      field: "assetData.id",
      header: ifricIdHeader(t),
      body: assetIdBodyTemplate,
      columnKey: "ifricId",
      sortable: true,
    },
    {
      columnKey: "serialNumber",
      field: "assetData.asset_serial_number",
      header: serialNumberHeader(t),
      body: serialNumberBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "type",
      field: "assetData.type",
      header: productTypeHeader(t),
      body: assetTypeBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "productName",
      field: "assetData.product_name",
      header: productNameHeader(t, toggleColor, isBlue),
      body: productNameBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "manufacturer",
      field: "assetData.asset_manufacturer_name",
      header: manufacturerHeader(t),
      body: manufacturerDataTemplate,
      sortable: true,
    },
  
     {
      columnKey: "Owner",
      field: "owner_company_name",
      header: ownerHeader(t),
      body: ownerBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "Action",
      field: "action",
      header: t("overview:action"),
      body: (rowData: Asset) => actionItemsTemplate(rowData, onMoveToRoom),
    },
  ];
 
  useEffect(() => {
    // Calculate the range of rows for the current page
    const startRow = currentPage * selectedRowsPerPage + 1;
    const endRow = Math.min(startRow + selectedRowsPerPage - 1, assetsData.length);
    setRangeDisplay(`${startRow}-${endRow}`);
  }, [currentPage, selectedRowsPerPage, assetsData]);
 
  return (
    <>   
      <DataTable
        value={assetsData} // Use the fetched assets as the data source
        first={currentPage * Number(selectedRowsPerPage)}
        paginator
        reorderableColumns={enableReordering}
        selectionMode="multiple"
        rows={Number(selectedRowsPerPage)}     
        className="custom-row-padding asset-dynamic-table"
        tableStyle={{
          width: "100%",
          overflow: "auto",  
        }}
        scrollable
        scrollHeight={`calc(100vh - 10px)`}
        onRowClick={(e) => setSelectedAssets(e.data as [])}
        selection={selectedAssets}
        onSelectionChange={(e) => {
          if (Array.isArray(e.value)) {
            setSelectedAssets(e.value);
            setShowSelectedAsset(true);
          } else {
            console.error("Expected e.value to be an array, but got:", e.value);
          }
        }}
        filters={searchFilters}
        globalFilterFields={[
          "assetData.id",
          "assetData.asset_serial_number",
          "assetData.type",
          "assetData.product_name",
          "assetData.asset_manufacturer_name",
          'owner_company_name'
        ]}
        sortMode="multiple"
        onContextMenu={(e) => cm.current.show(e.originalEvent)}
        contextMenuSelection={selectedProduct}
        onContextMenuSelectionChange={(e) => setSelectedProduct(e.value)}
         sortField="product_name"
         sortOrder={-1}
        rowGroupMode={selectedGroupOption !== null ? "subheader" : undefined}
        rowGroupHeaderTemplate={(data) => {      
          let rowHeader;
          if (selectedGroupOption === "type") {
            rowHeader = data.assetData[selectedGroupOption]?.split("/").pop();
          } else if (
            activeTab === "Assets" &&
            selectedGroupOption === "asset_manufacturer_name"
          ) {
            rowHeader = data.assetData[selectedGroupOption];
          } 
          return <>{selectedGroupOption !== null && rowHeader}</>;
        }}
        groupRowsBy={selectedGroupOption ? `assetData.${selectedGroupOption}` : undefined}
      >
        {activeTab === "Assets"
          && columnConfig.map((col) => <Column key={col.columnKey} {...col} />) }
      </DataTable>
      <span className="pagination-range-display">{rangeDisplay}  Assets </span>
    </>
  );
};

export default AssetTable;
