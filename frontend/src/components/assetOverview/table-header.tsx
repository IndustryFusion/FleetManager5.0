import { Dropdown } from "primereact/dropdown";
import DropdownWithCustomOptions from "./custom-dropdown";
import { InputText } from "primereact/inputtext";
import { useTranslation } from "next-i18next";
import { Asset } from "@/interfaces/assetTypes";

interface GroupOption {
  label: string;
  value: string;
}


interface TableHeaderProps {
  enableReordering: boolean;
  setEnableReordering: React.Dispatch<React.SetStateAction<boolean>>;
  selectedGroupOption: string | null;
  setSelectedGroupOption: (value: string | null) => void;
  globalFilterValue: string;
  onFilter?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFilters: any; // You can refine this type based on your filters data structure
  setSelectedFilters: (filters: any) => void;
  groupOptions: GroupOption[];
  tableData: Asset[]; // You can refine this type based on your data structure
  activeTab: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  enableReordering,
  setEnableReordering,
  selectedGroupOption,
  setSelectedGroupOption,
  globalFilterValue,
  onFilter,
  selectedFilters,
  setSelectedFilters,
  groupOptions,
  tableData,
  activeTab
}) => {
  const { t } = useTranslation(["overview", "placeholder"]);

  const getStrokeColor = () => {
    return enableReordering ? "#2196f3" : "#95989a"; // Change #000 to the desired color when not enabled
  };

  const CustomOptions = (option: any) => {
    return (
      <>
        <label htmlFor="">
          <input
            type="radio"
            name="groupOption"
            id=""
            checked={selectedGroupOption === option.value}
            onChange={() => setSelectedGroupOption(option.value)}
          />
          {option.label}
        </label>
      </>
    );
  };

    return(
        <>
         <div className="table-header flex justify-content-between">
            <div className="search-container">
              <img src="/search_icon.svg" alt="search-icon" />
              <InputText
                className="search-input"
                value={globalFilterValue}
                onChange={onFilter}
                placeholder={t("placeholder:search")}
              />
            </div>
            <div className="right-content">
              <ul>
                <div className="ui-guide-filter-dropdown">
                <img src="/filter_icon.jpg" alt="group-icon" style={{marginRight:"8px"}} />
                <DropdownWithCustomOptions
                  filterProp={selectedFilters}
                  setFilterProp={setSelectedFilters}
                  tableData={tableData}
                 
                />
                </div>             
                <div className="ui-guide-group-dropdown">
                <img src="/group_icon.svg" alt="group-icon" style={{marginRight:"8px"}} />
                <Dropdown
                  optionLabel="label"
                  placeholder="Group"
                  options={groupOptions}
                  onChange={(e) => setSelectedGroupOption(e.value)}
                  itemTemplate={(option) => CustomOptions(option)}
                />
                </div>
                <li
                  className="ui-guide-manage-columns"
                  onClick={() => setEnableReordering(!enableReordering)}
                  style={{ color: getStrokeColor() }}
                >
                  <svg
                    className="mr-2"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.1213 1.87868C13 2.75736 13 4.17157 13 7C13 9.8284 13 11.2426 12.1213 12.1213C11.2426 13 9.8284 13 7 13C4.17157 13 2.75736 13 1.87868 12.1213C1 11.2426 1 9.8284 1 7C1 4.17157 1 2.75736 1.87868 1.87868C2.75736 1 4.17157 1 7 1C9.8284 1 11.2426 1 12.1213 1.87868Z"
                      stroke={getStrokeColor()}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.78947 1V13"
                      stroke={getStrokeColor()}
                      strokeWidth="1.2"
                    />
                    <path
                      d="M9.21048 1V13"
                      stroke={getStrokeColor()}
                      strokeWidth="1.2"
                    />
                  </svg>
                  Manage Columns
                </li>
              </ul>
            </div>
          </div>
        </>
    )
}
export default TableHeader;
