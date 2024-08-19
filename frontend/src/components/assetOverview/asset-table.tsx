import { Asset } from "@/interfaces/assetTypes";
import {
  actionItemsTemplate,
  assetTypeBodyTemplate,
  ifricIdHeader,
  manufacturerDataTemplate,
  manufacturerHeader,
  modelManufacturerTemplate,
  modelProductImageTemplate,
  modelProductNameTemplate,
  modelProductTypeTemplate,
  modelTypeHeader,
  modelTypeTemplate,
  productNameBodyTemplate,
  productNameHeader,
  productTypeHeader,
  serialNumberBodyTemplate,
  serialNumberHeader,
} from "@/utility/assetTable";
import { Column } from "primereact/column";

import { DataTable } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";


const AssetTable: React.FC<any> = ({
  currentPage,
  selectedRowsPerPage,
  enableReordering,
  selectedAssets,
  setSelectedAssets,
  handleSelect,
  setShowSelectedAsset,
  setSelectedProduct,
  selectedProduct,
  cm,
  t,
  selectedGroupOption,
  qrCodeTemplate,
  toggleColor,
  isBlue,
  assetIdBodyTemplate,
  assetsData,
  activeTab,
}) => {

  const [rangeDisplay, setRangeDisplay] = useState('');
  const columnConfig = [
    {
      selectionMode: "multiple" as "multiple",
      headerStyle: { width: "3rem" },
      columnKey: "assetSelectCheckBox",
    },
    {
      field: "qr-code",
      header: t("overview:qrCode"),
      body: qrCodeTemplate,
      columnKey: "qrCode",
    },
    {
      field: "id",
      header: ifricIdHeader(t),
      body: assetIdBodyTemplate,
      columnKey: "ifricId",
      sortable: true,
    },
    {
      columnKey: "serialNumber",
      field: "asset_serial_number",
      header: serialNumberHeader(t),
      body: serialNumberBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "type",
      field: "type",
      header: productTypeHeader(t),
      body: assetTypeBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "productName",
      field: `product_name`,
      header: productNameHeader(t, toggleColor, isBlue),
      body: productNameBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "manufacturer",
      field: "asset_manufacturer_name",
      header: manufacturerHeader(t),
      body: manufacturerDataTemplate,
      sortable: true,
    },
    {
      columnKey: "actions",
      body: actionItemsTemplate,
    },
  ];

  const modelColumnConfig = [
    {
      selectionMode: "multiple" as "multiple",
      headerStyle: { width: "3rem" },
      columnKey: "assetSelectCheckBox",
    },
    {
      columnKey: "productName",
      field: "properties.product_name",
      header: productNameHeader(t, toggleColor, isBlue),
      body: modelProductNameTemplate,
      sortable: true,
    },
    {
      columnKey: "Type",
      field: "type",
      header: modelTypeHeader(t),
      body: modelTypeTemplate,
      sortable: true,
    },
    {
      columnKey: "Manufacturer",
      field: "properties.asset_manufacturer_name",
      header: manufacturerHeader(t),
      body: modelManufacturerTemplate,
      sortable: true,
    },
    {
      columnKey: "ProductType",
      field: "type",
      header: productTypeHeader(t),
      body: modelProductTypeTemplate,
      sortable: true,
    },
    {
      columnKey: "actions",
      body: actionItemsTemplate,
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
        onRowDoubleClick={(e) => handleSelect(e.data as Asset)}
        selection={selectedAssets}
        onSelectionChange={(e) => {
          if (Array.isArray(e.value)) {
            setSelectedAssets(e.value);
            setShowSelectedAsset(true);
          } else {
            console.error("Expected e.value to be an array, but got:", e.value);
          }
        }}
        sortField="product_name"
        onContextMenu={(e) => cm.current.show(e.originalEvent)}
        contextMenuSelection={selectedProduct}
        onContextMenuSelectionChange={(e) => setSelectedProduct(e.value)}
        rowGroupMode={selectedGroupOption !== null ? "subheader" : undefined}
        rowGroupHeaderTemplate={(data) => {
          let rowHeader;
          if (selectedGroupOption === "type") {
            rowHeader = data[selectedGroupOption]?.split("/").pop();
          } else if (
            activeTab === "Assets" &&
            selectedGroupOption === "asset_manufacturer_name"
          ) {
            rowHeader = data[selectedGroupOption];
          } else {
            rowHeader = data?.properties?.[selectedGroupOption];
          }
          return <>{selectedGroupOption !== null && rowHeader}</>;
        }}
        groupRowsBy={selectedGroupOption}
      >
        {activeTab === "Assets"
          ? columnConfig.map((col) => <Column key={col.columnKey} {...col} />)
          : modelColumnConfig.map((col) => (
              <Column key={col.columnKey} {...col} />
            ))}
      </DataTable>
      <span className="pagination-range-display">{rangeDisplay}  Assets </span>
    </>
  );
};

export default AssetTable;
