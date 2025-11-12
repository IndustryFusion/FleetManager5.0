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
  ownerHeader,
  createdDateHeader
} from "@/utility/assetTable";
import Image from "next/image";
import { Column } from "primereact/column";

import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";
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
  loading,
  activeTab,
  onMoveToRoom,
  searchFilters ,
  selectedProduct,
  setSelectedProduct,
  companyIfricId,
}) => {

  const [rangeDisplay, setRangeDisplay] = useState('');
  const rowSkeleton = (width: string = "100%") => (
    <Skeleton width={width} height="1rem" borderRadius="10px" />
  );
  const columnConfig = [
    {
      selectionMode: "multiple" as "multiple",
      headerStyle: { width: "3rem" },
      columnKey: "assetSelectCheckBox",
      body: loading ? () => rowSkeleton("1rem") : undefined,
    },
    {
      columnKey: "productName",
      field: "product_name",
      header: productNameHeader(t, toggleColor, isBlue),
      body: loading ? () => rowSkeleton("180px") : productNameBodyTemplate,
      sortable: false,
    },
    {
      columnKey: "id",
      field: "id",
      header: ifricIdHeader(t),
      body: loading ? () => rowSkeleton("100px") : assetIdBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "serialNumber",
      field: "asset_serial_number",
      header: serialNumberHeader(t),
      body: loading ? () => rowSkeleton("120px") : serialNumberBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "type",
      field: "type",
      header: productTypeHeader(t),
      body: loading ? () => rowSkeleton("100px") : assetTypeBodyTemplate,
      sortable: true,
    },
    // {
    //   columnKey: "manufacturer",
    //   field: "assetData.asset_manufacturer_name",
    //   header: manufacturerHeader(t),
    //   body: manufacturerDataTemplate,
    //   sortable: true,
    // },
    {
      columnKey: "Owner",
      field: "company_name",
      header: ownerHeader(t),
      body: loading ? () => rowSkeleton("160px") : ownerBodyTemplate,
      sortable: true,
    },
    {
      columnKey: "Created",
      field: "creation_date",
      header: createdDateHeader,
      body: loading ? () => rowSkeleton("160px"):"",
      sortable: true,
    },
    {
      columnKey: "Action",
      field: "action",
      header: t("overview:action"),
      body: loading
        ? () => rowSkeleton("80px")
        : (rowData: Asset) => actionItemsTemplate(rowData, onMoveToRoom, companyIfricId),
    },
  ];
 
  useEffect(() => {
    // Calculate the range of rows for the current page
    const startRow = currentPage * selectedRowsPerPage + 1;
    const endRow = Math.min(startRow + selectedRowsPerPage - 1, assetsData.length);
    setRangeDisplay(`${startRow}-${endRow}`);
  }, [currentPage, selectedRowsPerPage, assetsData]);

  const paginatorTemplate = {
    layout:
      "CurrentPageReport PrevPageLink PageLinks NextPageLink RowsPerPageDropdown",
      RowsPerPageDropdown: (options: any) => {
      const dropdownOptions = [
        { label: "5 Records per Page", value: 5 },
        { label: "10 Records per Page", value: 10 },
        { label: "20 Records per Page", value: 20 },
        { label: "40 Records per Page", value: 40 },
      ];

      return (
        <div className="flex align-items-center gap-1 ml-auto">
          <div style={{color: "var(--common-text-grey-400)"}}>Display:</div>
          <div className="global-button is-grey dropdown">
            <Dropdown
              value={options.value}
              options={dropdownOptions}
              onChange={(e) => options.onChange(e)}
              panelClassName="global_dropdown_panel"
            />
            <Image className="rotate-180" src="/sidebar/arrow_down.svg" width={16} height={16} alt="dropdown-icon"></Image>
          </div>
        </div>
      );
    },
      CurrentPageReport: (options: any) => {
      return (
        <span style={{ marginRight: "auto", minWidth: "220px", color: "var(--common-text-grey-400)" }}>
          {options.first} - {options.last} Assets
        </span>
      );
    },
  }
 
  return (
    <>   
      <DataTable
        value={
          loading
            ? Array.from({ length: Number(selectedRowsPerPage) })
            : assetsData
        }
        first={currentPage * Number(selectedRowsPerPage)}
        paginator
        paginatorTemplate={paginatorTemplate}
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
          "id",
          "asset_serial_number",
          "type",
          "product_name",
          "asset_manufacturer_name",
          'company_name'
        ]}
        sortMode="multiple"
        onContextMenu={(e) => cm.current.show(e.originalEvent)}
        contextMenuSelection={selectedProduct}
        onContextMenuSelectionChange={(e) => setSelectedProduct(e.value)}
        sortField="creation_date"
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
      {/* <span className="pagination-range-display">{rangeDisplay}  Assets </span> */}
    </>
  );
};

export default AssetTable;
