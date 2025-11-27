import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { encryptRoute } from "@/utility/auth";
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
  const { t } = useTranslation(["overview", "placeholder", "common"]);
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  
  const handleCreatePDTClick = async () => {
    try {
      const result = await encryptRoute(environment, "/asset/create/create-pdt", "IFX Platform", undefined, t);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
        toast.current?.show({
          severity: 'success',
          summary: t('common:success'),
          detail: t('common:redirecting'),
          life: 3000
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: t('common:error'),
          detail: result.errorMessage || t('common:auth.routeError'),
          life: 5000
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common:error'),
        detail: t('common:auth.routeError'),
        life: 5000
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
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
