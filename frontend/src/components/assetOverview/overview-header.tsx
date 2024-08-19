import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";

type overviewHeaderProps = {
  assetCount: number;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  importOptions: any;
  onImportOptionSelect: (option: string) => void;
  accessgroupIndexDb: any;
};

const OverviewHeader: React.FC<overviewHeaderProps> = ({
  assetCount,
  activeTab,
  setActiveTab,
  importOptions,
  onImportOptionSelect,
  accessgroupIndexDb 
}) => {
  const { t } = useTranslation(["overview", "placeholder"]);
  const router = useRouter();

  const handleCreateAssetClick = () => {
    router.push("/asset/create/create-asset"); // This will navigate to the /templates
  };
  const handleCreateModelClick = () => {
    router.push("model-object/create"); // This will navigate to the /templates
  };
  const tooltipContent = "You don't have access";
  return (
    <>
      <div className="asset-header">
        <div className="flex justify-content-between">
          <div className="flex">
            <p className="total-assets-text">
              <span className="asset-count mr-1">{assetCount}</span>
              <span className="asset-text">Assets</span>
            </p>

            <div>
              <TabView
                className="asset-tabs"
                activeIndex={activeTab === "Assets" ? 0 : 1}
                onTabChange={(e) =>
                  setActiveTab(e.index === 0 ? "Assets" : "Models")
                }
              >
                <TabPanel header="Assets"></TabPanel>
                <TabPanel header="Models"></TabPanel>
              </TabView>
            </div>
          </div>
          <div className="flex gap-2">
          <div>
        
            <Dropdown
              optionLabel="label"
              placeholder="Import Asset"
              options={importOptions}
              className="import-dropdown"
              onChange={(e) => onImportOptionSelect(e.value)}
              disabled={!accessgroupIndexDb?.create} 
              tooltip={!accessgroupIndexDb?.create ? tooltipContent : undefined}
              tooltipOptions={{ position: 'bottom', showOnDisabled: true }}
            />
              <i className="pi pi-download" style={{marginRight:"8px", color:"#95989A"}} />
            </div>
            <Button
              className="add-asset-btn flex justify-content-center align-items-center border-none"
              onClick={handleCreateAssetClick}
              disabled={!accessgroupIndexDb?.create} 
             tooltip={!accessgroupIndexDb?.create ? tooltipContent : undefined}
              tooltipOptions={{ position: 'bottom', showOnDisabled: true }}
            >
              {t("overview:addAsset")}
              <img src="/plus-icon.png" alt="plus icon" />
            </Button>
            <Button
              className="add-asset-btn flex justify-content-center align-items-center border-none"
              onClick={handleCreateModelClick}
              disabled={!accessgroupIndexDb?.create} 
              tooltip={!accessgroupIndexDb?.create ? tooltipContent : undefined}
              tooltipOptions={{ position: 'bottom', showOnDisabled: true }}
            >
              Add Model
              <img src="/plus-icon.png" alt="plus icon" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewHeader;
