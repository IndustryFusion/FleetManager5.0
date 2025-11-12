import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import "../../../public/styles/overview-page/overview-header.css";
type overviewHeaderProps = {
  assetCount: number;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  accessgroupIndexDb: any;
};

const OverviewHeader: React.FC<overviewHeaderProps> = ({
  assetCount,
  activeTab,
  setActiveTab,
  accessgroupIndexDb 
}) => {
  const { t } = useTranslation(["overview", "placeholder"]);
  const router = useRouter();

  const handleCreatePDTClick = () => {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
    const targetUrl = environment === "dev"
      ? "https://dev-platform.industryfusion-x.org/dashboard"
      : "https://platform.industryfusion-x.org/dashboard";
    router.push(targetUrl);
  };

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
              </TabView>
            </div>
             
          </div>
          <Button
              className="global-button create-pdt-button"
              type="button"
              onClick={handleCreatePDTClick}  
            >
              <div>{t("overview:create_PDT")}</div>
            </Button>
        </div>
      </div>
    </>
  );
};

export default OverviewHeader;
