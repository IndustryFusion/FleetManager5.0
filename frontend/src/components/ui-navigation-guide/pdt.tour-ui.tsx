import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import Joyride, { CallBackProps, Step, STATUS } from "react-joyride";
import Cookies from "js-cookie";
import { CustomTooltip } from "./custom-tooltip";

type TourContextType = {
  startTour: () => void;
  isRunning: boolean;
};

interface BasePdtTourProps {
  children: React.ReactNode;
  steps: Step[];
  cookieName: string;
}

export const tourStyles = {
  options: {
    primaryColor: "#1e90ff",
    zIndex: 99999,
    arrowColor: "#fff",
    backgroundColor: "#fff",
    textColor: "#333",
    overlayColor: "rgba(0, 0, 0, 0.5)",
  },
  tooltipContainer: {
    textAlign: "left",
    padding: "20px",
  } as any,
};

export const PdtTourContext = createContext<TourContextType>({
  startTour: () => {},
  isRunning: false,
});

export const BasePdtTour: React.FC<BasePdtTourProps> = ({
  children,
  steps,
  cookieName,
}) => {
  const [run, setRun] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const hasStartedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Listen for custom event to start tour
    const handleStartTourEvent = (event: CustomEvent) => {
      const eventCookieName = event.detail?.cookieName;
      if (eventCookieName === cookieName && !hasStartedRef.current) {
        hasStartedRef.current = true;
        setRun(true);
      }
    };

    window.addEventListener('startTour' as any, handleStartTourEvent as EventListener);

    return () => {
      window.removeEventListener('startTour' as any, handleStartTourEvent as EventListener);
    };
  }, [isClient, cookieName]);

  const startTour = () => {
    if (!isClient) return;
    hasStartedRef.current = false;
    Cookies.remove(cookieName);
    setRun(true);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      hasStartedRef.current = false;
      Cookies.set(cookieName, "completed");
    }
  };

  if (!isClient) return <>{children}</>;

  return (
    <PdtTourContext.Provider value={{ startTour, isRunning: run }}>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        hideCloseButton
        disableScrolling={false}
        styles={tourStyles}
        scrollToFirstStep
        scrollOffset={250}
        floaterProps={{ disableAnimation: true }}
        callback={handleJoyrideCallback}
        tooltipComponent={CustomTooltip}
        locale={{
          last: "Finish",
          skip: "Skip tour",
          next: "Next",
          back: "Back",
        }}
      />
      {children}
    </PdtTourContext.Provider>
  );
};

export const usePdtTourHook = () => useContext(PdtTourContext);