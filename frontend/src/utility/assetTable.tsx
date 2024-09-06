import React from "react";
import { FiCopy, FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Asset } from "@/interfaces/assetTypes";
import "../../public/styles/asset-overview.css"
import { Checkbox } from "primereact/checkbox";

export const ifricIdHeader = (t: (key: string) => string): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center ml-4">
      <p>{t("overview:id")} </p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
    </div>
  );
};

export const productTypeHeader = (
  t: (key: string) => string
): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center">
      <p>{t("overview:assetType")} </p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
    </div>
  );
};

export const manufacturerHeader = (
  t: (key: string) => string
): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center">
      <p>{t("overview:manufacturer")} </p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
    </div>
  );
};

export const serialNumberHeader = (
  t: (key: string) => string
): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center">
      <p>{t("overview:serialNumber")} </p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
    </div>
  );
};
export const productNameHeader = (
  t: (key: string) => string,
  toggleColor: () => void,
  isBlue: boolean
) => {
  return (
    <div className="flex gap-1 align-items-center" >
      <p>{t("overview:productName")} </p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
    </div>
  );
};

export const modelTypeHeader = (
  t: (key: string) => string
): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center">
      <p>Type </p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
    </div>
  );
};


//all body templates of table

export const modelManufacturerTemplate = (rowData:any)=>{
  return (
    <div className="flex flex-column">
      {rowData?.assetdata?.logo_manufacturer && rowData?.assetData?.logo_manufacturer !== "NULL" && (
        <img
          src={rowData?.assetData?.logo_manufacturer}
          alt="maufacturer_logo"
          className="w-4rem shadow-2 border-round"
        />
      )}
      <p className="m-0 mt-1 tr-text">{rowData?.assetData?.asset_manufacturer_name}</p>
    </div>
  );
}
export const modelProductImageTemplate = (rowData:any)=>{
  return (
  <img
    src={rowData?.assetData?.product_icon}
    alt="product_image"
    width={"100px"}
    height={"100px"}
  />)
}
export const modelProductNameTemplate = (rowData:any)=>{
  console.log("rowData",rowData)
  return <p className="tr-text">{rowData?.assetData?.product_name}</p>;
}
export const modelTypeTemplate = (rowData:any)=>{
  return <p className="tr-text">{rowData?.assetData?.type}</p>; 
}
export const modelProductTypeTemplate = (rowData:any)=>{
  const assetType = rowData?.assetData?.type?.split("/").pop();
  return <p className="tr-text">{assetType}</p>; 
}

export const manufacturerDataTemplate = (rowData: any): React.ReactNode => {
  return (
    <div className="flex flex-column align-items-center">
      {rowData?.assetData?.logo_manufacturer !== "NULL" && rowData?.assetData?.logo_manufacturer && (
        <img
          src={rowData.assetData.logo_manufacturer}
          alt="manufacturer_logo"
          className="shadow-2 border-round"
          style={{
            maxWidth: '4rem', 
            maxHeight: '4rem', 
            objectFit: 'contain', 
          }}
        />
      )}
      <p className="m-0 mt-1 tr-text">{rowData?.assetData?.asset_manufacturer_name || "N/A"}</p>
    </div>
  );
};


export const productNameBodyTemplate = (rowData: any): React.ReactNode => {
  return <p className="tr-text">{rowData?.assetData?.product_name}</p>;
};

export const assetTypeBodyTemplate = (rowData: any): React.ReactNode => {
  const assetType = rowData?.assetData?.type?.split("/").pop();
  return <p className="tr-text">{assetType}</p>;
};

export const serialNumberBodyTemplate = (rowData: any): React.ReactNode => {
  return <p className="tr-text">{rowData?.assetData?.asset_serial_number}</p>;
};

export const actionItemsTemplate = (rowData: Asset, onMoveToRoom: (asset: Asset) => void) => {
  return (
    <img
      src="/move-to-room.svg" 
      alt="move-icon"
      className="context-menu-icon cursor-pointer"
      onClick={() => onMoveToRoom(rowData)}
    />
  );
};

export  const ownerBodyTemplate = (rowData: any) => {
  return <span>{rowData?.owner_company_name || 'N/A'}</span>;
};
export const checkboxContainer = (
  assetsSelected: Asset[],
  showAssetSelected: boolean,
  setSelectedAssets:any,
  assetsData:any
): React.ReactNode | null => {

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAssets([...assetsData]); // Set to assetsData when checked
    } else {
      setSelectedAssets([]); // Set to empty array when unchecked
    }
  };

  if (!showAssetSelected) {
    return null; // Early return if showSelectedAsset is false
  } else if (assetsSelected.length > 0) {
    return (
      <>
        <div className="flex checkbox-container">
          <div>
            {assetsSelected?.length > 0 ? (
              <div className="flex align-items-center">
               <Checkbox 
               className="select-all-checkbox mr-2"
               checked={assetsSelected.length>0}
               onChange={handleCheckboxChange}
               />
                <span>{assetsSelected?.length} Assets selected</span>
              </div>
            ) : null}
          </div>
          <div>
          <img src="/add.svg" alt="move-icon" className="mr-4" />
          <img src="/card-view.svg" alt="move-icon" className="mr-4" />
          <img src="/close-alerts.svg" alt="move-icon" className="mr-4" />   
            <FiEdit3 className="mr-4" />
            <FiCopy className="mr-4" />       
            <img src="/move.svg" alt="move-icon" className="mr-4" />
            <RiDeleteBinLine className="mr-4" />
          </div>
          <div>
            <p>Esc to deselect</p>
          </div>
        </div>
      </>
    );
  }
};

export const filterAssets = (
  sortedassets: any,
  selectedFilters: { [key: string]: { [key: string]: boolean } },
  activeTab:string
): any => {
  const noFiltersSelected =
    Object.keys(selectedFilters).length === 0 ||
    Object.values(selectedFilters).every((filter) =>
      Object.values(filter).every((value) => value === false)
    );

  if (noFiltersSelected) {
    return sortedassets;
  }

  return sortedassets.filter((asset) => {
    const manufacturerName = activeTab === "Models" ? asset?.properties?.asset_manufacturer_name : asset.asset_manufacturer_name
    return Object.keys(selectedFilters).every((filterCategory) => {
      const filters = selectedFilters[filterCategory];
      if (filters && Object.values(filters).some((value) => value === true)) {
        return Object.keys(filters).some((filterKey) => {
          if (filters[filterKey]) {
            if (
              (filterCategory === "type" && asset.type?.split("/").pop() === filterKey) ||
              (filterCategory === "manufacturer_name" &&
                manufacturerName  === filterKey)
            ) {
              return true;
            }
          }
          return false;
        });
      }
      return true;
    });
  });
};
