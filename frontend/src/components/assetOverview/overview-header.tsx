import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import "../../../public/styles/overview-page/overview-header.css";
import { encryptRoute } from "@/utility/auth";
import { getAccessGroup } from "@/utility/indexed-db";
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

  const handleCreatePDTClick = async () => {
    try {
      const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
      let targetUrl;
      
      if (environment === "local") {
        targetUrl = "http://localhost:3008/asset/create/create-pdt";
      } else if (environment === "dev") {
        targetUrl = "https://dev-platform.industryfusion-x.org/asset/create/create-pdt";
      } else {
        targetUrl = "https://platform.industryfusion-x.org/asset/create/create-pdt";
      }

      const accessGroup = accessgroupIndexDb || await getAccessGroup();
      
      if (!accessGroup?.ifricdi || !accessGroup?.company_ifric_id) {
        console.error("Missing required access group data");
        return;
      }


      const response = await encryptRoute({
        token: accessGroup.ifricdi,
        product_name: "Fleet Manager",
        company_ifric_id: accessGroup.company_ifric_id,
        route: targetUrl
      });

      if (response?.data?.path) {
        window.location.href = response.data.path;
      } else {
        router.push(targetUrl);
      }
    } catch (error: any) {
      console.error("Error encrypting route:", error);
    }
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
