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

export const ownerHeader =(t: (key: string) => string): React.ReactNode=>{
  return (
    <div className="flex gap-1 align-items-center">
      <p>{t("overview:owner")}</p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
    </div>
  );
}

export const serialNumberHeader = (
  t: (key: string) => string
): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center">
      <p>Machine Serial Number </p>
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


export const manufacturerDataTemplate = (rowData: any): React.ReactNode => {
  return (    
      <p className="m-0 mt-1 tr-text">{rowData?.assetData?.asset_manufacturer_name || "N/A"}</p>
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
    <button onClick={() => onMoveToRoom(rowData)} className="action-menu-icon cursor-pointer" >
      <img
      src="/move-icon.svg" 
      alt="move-icon" 
      className="mr-2"
    />
    Assign Owner
    </button>
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
): any => {
  const noFiltersSelected =
    Object.keys(selectedFilters).length === 0 ||
    Object.values(selectedFilters).every((filter) =>
      Object.values(filter).every((value) => value === false)
    );

  if (noFiltersSelected) {
    return sortedassets;
  }

  return sortedassets.filter(({assetData}) => {
    const manufacturerName =  assetData.asset_manufacturer_name
    return Object.keys(selectedFilters).every((filterCategory) => {
      const filters = selectedFilters[filterCategory];
      if (filters && Object.values(filters).some((value) => value === true)) {
        return Object.keys(filters).some((filterKey) => {
          if (filters[filterKey]) {
            if (
              (filterCategory === "type" && assetData.type?.split("/").pop() === filterKey) ||
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
