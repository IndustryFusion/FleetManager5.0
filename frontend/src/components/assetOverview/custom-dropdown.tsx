import { Dropdown } from "primereact/dropdown";
import "../../../public/styles/asset-overview.css";

type Asset = {
  type: string;
  properties?: {
    asset_manufacturer_name?: string;
  };
  asset_manufacturer_name?: string;
};

type FilterProp = {
  [key: string]: { [key: string]: boolean };
};

type DropdownWithCustomOptionsProps = {
  filterProp: FilterProp;
  setFilterProp: React.Dispatch<React.SetStateAction<FilterProp>>;
  tableData: Asset[];
  activeTab: string;
};

const DropdownWithCustomOptions: React.FC<DropdownWithCustomOptionsProps> = ({
  filterProp,
  setFilterProp,
  tableData,
  activeTab,
}) => {
  const assetTypes = Array.from(
    new Set<string>(tableData.map((asset) => asset.type))
  ).map((item) => item?.split("/").pop() as string);
  let assetManufacturerName: string[];

  if (activeTab === "Models") {
    assetManufacturerName = Array.from(
      new Set<string>(
        tableData.map(
          (asset) => asset.properties?.asset_manufacturer_name ?? ""
        )
      )
    );
  } else {
    assetManufacturerName = Array.from(
      new Set<string>(
        tableData.map((asset) => asset.asset_manufacturer_name ?? "")
      )
    );
  }

  const filterOptions = [
    {
      category: "Product Type",
      key: "type",
      options: assetTypes.map((type) => ({ label: type, type })),
    },
    {
      category: "Manufacturer",
      key: "manufacturer_name",
      options: assetManufacturerName.map((manufacturer) => ({
        label: manufacturer,
        type: manufacturer,
      })),
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    filterKey: string
  ) => {
    // Handle checkbox change
    console.log(e.target.value);
    const { value, checked } = e.target;
    setFilterProp((prevFilters) => ({
      ...prevFilters,
      [filterKey]: { ...prevFilters[filterKey], [value]: checked },
    }));
  };

  const CustomOption: React.FC<{
    option: {
      category: string;
      key: string;
      options: { label: string; type: string }[];
    };
  }> = ({ option }) => {
    return (
      <div>
        <h4 className="filter-header">{option.category}</h4>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {option.options.map((opt, index) => (
            <li key={index}>
              <input
                type="checkbox"
                value={opt.type}
                onChange={(e) => handleChange(e, option.key)}
                checked={
                  filterProp[option.key] &&
                  filterProp[option.key][opt.type] === true
                }
              />
              <label htmlFor={opt.type} style={{ marginLeft: "0.5em" }}>
                {opt.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="dropdown-container">
      <Dropdown
        value={null}
        options={filterOptions}
        optionLabel="category"
        placeholder="Filter"
        itemTemplate={(option) => <CustomOption option={option} />}
      />
    </div>
  );
};

export default DropdownWithCustomOptions;
