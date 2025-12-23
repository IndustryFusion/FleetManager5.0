import React from "react";
import { TooltipRenderProps } from "react-joyride";
import { useTranslation } from "react-i18next";

export const CustomTooltip: React.FC<TooltipRenderProps> = ({
  step,
  tooltipProps,
  primaryProps,
  skipProps,
  backProps,
  closeProps,
  isLastStep,
  index,
  size,
}) => {
  const { t } = useTranslation("ui-guide-custom-tooltip");

  return (
    <div
      {...tooltipProps}
      style={{
        padding: "20px",
        width: 600,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ marginBottom: 15, color: "#333" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {step.title && <h2 style={tourStyles.header}>{step.title}</h2>}
          <span style={tourStyles.stepCount}>
            {t("step_counter", { current: index + 1, total: size })}
          </span>
        </div>

        {step.content && <div style={{ marginTop: 10 }}>{step.content}</div>}
      </div>

      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <div style={{ marginRight: "auto" }}>
          {index > 0 ? (
            <button
              style={tourStyles.dontShow}
              onClick={(event) => {
                skipProps.onClick(event);
              }}
            >
              {t("dont_show")}
            </button>
          ) : (
            <button {...skipProps} style={tourStyles.buttonSkip}>
              {t("skip_tour")}
            </button>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          {index > 0 && (
            <button {...skipProps} style={tourStyles.buttonSkip}>
              {t("skip_tour")}
            </button>
          )}

          {index > 0 && (
            <button {...backProps} className="global-button is-grey">
              {t("back")}
            </button>
          )}

          <button {...primaryProps} className="global-button">
            {index === 0 ? t("start_tour") : isLastStep ? t("finish") : t("next_step")}
          </button>
        </div>
      </div>
    </div>
  );
};

export const tourStyles = {
  header: {
    color: "#2B2B2B",
    fontFamily: "League Spartan",
    fontSize: "18px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
  },
  buttonSkip: {
    color: "#3CA0C9",
    textAlign: "right",
    fontFamily: "League Spartan",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 500,
    lineHeight: "normal",
    background: "transparent",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
  dontShow: {
    color: "#3CA0C9",
    textAlign: "right",
    fontFamily: "League Spartan",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 500,
    lineHeight: "normal",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  stepCount:{
    color: "#3CA0C9",
    textAlign: "right",
    fontFamily: "League Spartan",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: "500",
    linHeight: "20px",
  }
};