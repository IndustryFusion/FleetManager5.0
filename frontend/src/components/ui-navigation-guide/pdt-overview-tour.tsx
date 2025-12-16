import React, { useEffect, useState } from "react";
import { BasePdtTour, usePdtTourHook } from "./pdt.tour-ui";
import { Step } from "react-joyride";
import { useTranslation } from "next-i18next";

type PdtOverviewTourProps = {
  children: React.ReactNode;
  hasData?: boolean;
};

const TOUR_COOKIE_NAME = "pdt_overview_tour";

export const PdtOverviewTour: React.FC<PdtOverviewTourProps> = ({ children, hasData = false }) => {
  const { t } = useTranslation("overview");
  const [filteredSteps, setFilteredSteps] = useState<Step[]>([]);


  const generateSteps = () => {
    const conditionalSteps: Step[] = [];
    
    if (hasData) {
      conditionalSteps.push({
        target: ".ui-guide-certificate-btn",
        title: t("ui-guide.certificate_title"),
        content: (
          <div>
            <p>{t("ui-guide.certificate_content")}</p>
          </div>
        ),
        placement: "bottom"
      });

      if (document.querySelector(".ui-guide-assign-owner")) {
        conditionalSteps.push({
          target: ".ui-guide-assign-owner",
          title: t("ui-guide.assign_owner_title"),
          content: (
            <div>
              <p>{t("ui-guide.assign_owner_content")}</p>
            </div>
          ),
          placement: "bottom"
        });
      }

      if (document.querySelector(".ui-guide-ownership-data")) {
        conditionalSteps.push({
          target: ".ui-guide-ownership-data",
          title: t("ui-guide.ownership_data_title"),
          content: (
            <div>
              <p>{t("ui-guide.ownership_data_content")}</p>
            </div>
          ),
          placement: "bottom"
        });
      }
    }

    const tourSteps: Step[] = [
    {
      target: "body",
      title: t("ui-guide.welcome_title"),
      content: (
        <div>
           {t("ui-guide.welcome_message")}
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },

    {
        target: ".create-pdt-button",
        title: t("ui-guide.create_btn_title"),
        content: (
            <div>
                 <p>{t("ui-guide.create_btn_content")}</p>
            </div>
        ),
        placement: "bottom"
    },
    {
        target: ".search-container",
        title: t("ui-guide.search_title"),
        content: (
            <div>
                <p>{t("ui-guide.search_content")}</p>
            </div>
        ),
        placement: "bottom"
    },
    {
        target: ".ui-guide-filter-dropdown",
        title: t("ui-guide.filter_title"),
        content: (
            <div>
                <p>{t("ui-guide.filter_content")}</p>
            </div>
        ),
        placement: "bottom"
    },
    {
        target: ".ui-guide-group-dropdown",
        title: t("ui-guide.group_title"),
        content: (
            <div>
                 <p>{t("ui-guide.group_content")}</p>
            </div>
        ),
        placement: "bottom"
    },
    ...conditionalSteps,
    {
        target: ".asset-dynamic-table",
        title: t("ui-guide.table_title"),
        content: (
            <div>
                 <p>{t("ui-guide.table_content")}</p>
            </div>
        ),
        placement: "bottom"
    },
        {
      target: "body",
      title: t("ui-guide.congratulations_title"),
      content: (
        <div>
          <p>{t("ui-guide.congratulations_message")}</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    ];
    setFilteredSteps(tourSteps);
  };

  useEffect(() => {
    generateSteps();
    
    // Listen for startTour event to re-generate steps based on current DOM
    const handleStartTour = (event: CustomEvent) => {
      if (typeof window !== "undefined" && event.detail?.cookieName === TOUR_COOKIE_NAME) {
         // Tiny timeout to let any potential renders finish, though usually not needed if triggered by user action
         setTimeout(generateSteps, 0); 
      }
    };

    window.addEventListener('startTour' as any, handleStartTour as EventListener);
    return () => {
        window.removeEventListener('startTour' as any, handleStartTour as EventListener);
    };
  }, [hasData, t]);

  return (
    <BasePdtTour steps={filteredSteps} cookieName={TOUR_COOKIE_NAME}>
      {children}
    </BasePdtTour>
  );
};

export const usePdtOverviewTour = usePdtTourHook;