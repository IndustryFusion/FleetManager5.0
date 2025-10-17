import React from "react";
import { FiCopy, FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Asset } from "@/interfaces/assetTypes";
import "../../public/styles/asset-overview.css"
import { Checkbox } from "primereact/checkbox";
import { Tooltip } from "primereact/tooltip";

export const ifricIdHeader = (t: (key: string) => string): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center">
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
export const createdDateHeader = (
  t: (key: string) => string
): React.ReactNode => {
  return (
    <div className="flex gap-1 align-items-center">
      <p>Created</p>
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
  //  console.log("Row Data:", rowData);
  const productImage = rowData.product_image;
  const productName = rowData.product_name
|| "";

  return (
    <div className="flex align-items-center gap-2" style={{ width: "200px", lineBreak: "anywhere" }}>
      {productImage && productImage !== "NULL" ? (
        <img
          src={productImage}
          alt="product-image"
          className="profile-picture flex-shrink-0"
        />
      ) : (
        <div className="no-product-image">
          {productName ? productName[0].toUpperCase() : "?"}
        </div>
      )}
      <p className="tr-text-black">{productName}</p>
    </div>
  );
};

export const assetTypeBodyTemplate = (rowData: any): React.ReactNode => {
  const assetType = rowData?.type?.split("/").pop();
  return <p className="tr-text-grey">{assetType}</p>;
};

export const serialNumberBodyTemplate = (rowData: any): React.ReactNode => {
  const serialNumber: string = rowData?.asset_serial_number || "";
  let displaySerialNumber = serialNumber;
  let toolTipContent: string | null = null;

  if (serialNumber.length > 15) {
    displaySerialNumber = serialNumber.slice(0, 15) + "...";
    toolTipContent = rowData["eclass:displaySerialNumber"] || rowData["displaySerialNumber"] || serialNumber;
  }
  return (
    <>
      {toolTipContent && (
        <Tooltip target=".serial-tooltip" className="navbar_tooltip" position="bottom"/>
      )}
      <p className="tr-text-grey serial-tooltip" data-pr-tooltip={toolTipContent || undefined}>
        {displaySerialNumber}
      </p>
    </>
  );
};
export const actionItemsTemplate = (
  rowData: any,
  onMoveToRoom: (asset: any) => void,
  companyIfricId: string
) => {
  const ownerCompanyIfricId = rowData?.company_ifric_id;
  const isDifferentOwner = ownerCompanyIfricId && ownerCompanyIfricId !== companyIfricId;
  const buttonLabel = isDifferentOwner ? "Ownership Data" : "Assign Owner";
  return (
    <button
      onClick={isDifferentOwner ? undefined : () => onMoveToRoom(rowData)}
      className="action-menu-icon cursor-pointer"
    >
      <img src="/move-icon.svg" alt="move-icon" className="mr-2" />
      {buttonLabel}
    </button>
  );
};


export const ownerBodyTemplate = (rowData: any) => {
  console.log(rowData,"Rowdata")
  const ownerName = rowData?.company_name || "-";
  const ownerCompanyImage=rowData?.company_image;
  let displayOwnerName = ownerName;
  let toolTipContent = ownerName;
  const initial = ownerName !== "N/A" ? ownerName.charAt(0).toUpperCase() : "?";

  if (ownerName.length > 15) {
    displayOwnerName = ownerName.slice(0, 15) + "...";
    toolTipContent =
      rowData["displayOwnerName"] ||
      rowData["displayOwnerName"] ||
      ownerName;
  }
  return (
    <div className="flex gap-2" style={{ alignItems: "center", width: "180px" }}>
      {ownerCompanyImage && ownerCompanyImage !== "NULL" ?
      (
        <img src={ownerCompanyImage}
        alt="ownerCompanyImgae"
        className="profile-picture flex-shrink-0"/>
      ):(
         <div className="no-product-image">{initial}</div>
      )}
      <Tooltip target=".owner-tooltip" className="navbar_tooltip" position="bottom" />
      <p className="tr-text-grey owner-tooltip" data-pr-tooltip={toolTipContent}>
        {displayOwnerName}
      </p>
    </div>
  );
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

  return sortedassets.filter((item: { assetData: any }) => {
    const assetData = item.assetData;
    const manufacturerName = assetData.asset_manufacturer_name;
    return Object.keys(selectedFilters).every((filterCategory) => {
      const filters = selectedFilters[filterCategory];
      if (filters && Object.values(filters).some((value) => value === true)) {
        return Object.keys(filters).some((filterKey) => {
          if (filters[filterKey]) {
            if (
              (filterCategory === "type" && assetData.type?.split("/").pop() === filterKey) ||
              (filterCategory === "manufacturer_name" &&
                manufacturerName === filterKey)
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
