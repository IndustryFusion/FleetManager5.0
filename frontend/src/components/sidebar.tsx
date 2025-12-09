import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { fetchAssetsRedux } from "../redux/asset/assetsSlice";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { AppDispatch, RootState } from "@/redux/store";
import SettingsDialog from "./settings/settings-dialog";
import "../../public/styles/sidebar.css";
import { encryptRoute } from "@/utility/auth";
import { getAccessGroup } from "@/utility/indexed-db";

// interface SideBarProps {
//   isOpen: boolean;
//   setIsOpen: Dispatch<SetStateAction<boolean>>;
// }

function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation(["overview", "placeholder"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [quota, setQuota] = useState<number | null>(null);
  const assets = useSelector((state: RootState) => state.assetsSlice.assets);
  const dispatch = useDispatch<AppDispatch>();
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT ||"" ;
  useEffect(() => {
    dispatch(fetchAssetsRedux());
  }, [dispatch]);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        setQuota(assets.length !== 0 ? assets.length : null);
      } catch (error) {
        // Handle error appropriately
        console.error("Failed to fetch quota:", error);
      }
    };

    // // Fetch quota immediately on mount
    fetchQuota();
  }, [assets]); // Empty dependency array ensures this runs once on mount
  
  const handleIFNavigation = async () => {
    try {
      let pageName = "ifxRoute";
      const product_name = "IFRIC Dashboard";
      const routeResponse = await encryptRoute(
        pageName,
        product_name,
        t
    );
      
      const encryptedPath = routeResponse?.url;
      if (encryptedPath) {
        window.open(encryptedPath, '_self');
      } else {
        console.error("Failed to generate encrypted route path");
      }
    } catch (error) {
      console.error("Error generating encrypted route:", error);
    }
  }

  function handleSidebarClose() {
    setSidebarOpen(false);
  }
  function handleSidebarOpen() {
    if (sidebarOpen === false) {
      setSidebarOpen(true);
    } else {
      return;
    }
  }
  function handleRoute(value: string) {
    router.push(`/${value}`);
  }
  return (
    <div
      className={`sidebar_wrapper ${!sidebarOpen ? "collapse" : ""}`}
      //onClick={handleSidebarOpen}
      //onMouseEnter={handleSidebarOpen}
    >
      <div className="sidebar_header">
        <div className={`sidebar_logo_wrapper ${!sidebarOpen ? "logo_small" : ""}`}>
          <Image
            src="/sidebar/logo_expanded.svg"
            width={183}
            height={46}
            alt="fleet logo"
            onClick={() => handleRoute("dashboard")}
            style={{ cursor: "pointer",height:"auto" }}
            className="sidebar_logo"
          ></Image>
          <Image
            src="/sidebar/sidebar_collapse_icon.svg"
            width={14}
            height={14}
            alt="collapse_icon"
            onClick={handleSidebarClose}
            className="sidebar_close"
          ></Image>
        </div>
        {!sidebarOpen && (
          <Image
            src="/sidebar/sidebar_expand_icon.svg"
            width={14}
            height={14}
            alt="expand_icon"
            onClick={handleSidebarOpen}
            className="sidebar_open"
          ></Image>
        )}
      </div>
      <div className="sidebar_content">
        <div className="sidebar_link_wrapper">
          <Button
            className={`sidebar_navlink ${
              router.pathname.startsWith("/asset-overview")
                ? "is_active"
                : ""
            }`}
            tooltip={!sidebarOpen ? "Data Twins" : undefined}
            tooltipOptions={{ position: "right", event: "both" }}
            onClick={() => handleRoute("asset-overview")}
          >
            <Image
              src="/sidebar/asset_series_icon.svg"
              width={18}
              height={18}
              alt="dashboard_icon"
            />
            <div
              className={`sidebar_navlink_text ${
                !sidebarOpen ? "sidebar_collapse_fade" : ""
              }`}
            >
             Data Twins
            </div>
          </Button>
          {/* <Button
           className={`sidebar_navlink ${
            router.pathname.startsWith("/contract-manager")
              ? "is_active"
              : ""
          }`}
            onClick={() => handleRoute("contract-manager")}
            tooltip={!sidebarOpen ? "Contracts" : undefined}
            tooltipOptions={{ position: "right", event: "both" }}
          >
            <Image
              src="/sidebar/assets_icon.svg"
              width={18}
              height={18}
              alt="dashboard_icon"
            />
            <div
              className={`sidebar_navlink_text ${
                !sidebarOpen ? "sidebar_collapse_fade" : ""
              }`}
            >
              Contracts
            </div>
          </Button> */}
          {/* <Button
            className={`sidebar_navlink ${
              router.pathname === "/contract-manager" ? "is_active" : ""
            }`}
            onClick={() => handleRoute("contract-manager")}
            tooltip={!sidebarOpen ? "Contract Manager" : undefined}
            tooltipOptions={{ position: "right", event: "both" }}
          >
            <Image
              src="/sidebar/contract_icon.svg"
              width={18}
              height={18}
              alt="dashboard_icon"
            />
            <div
              className={`sidebar_navlink_text ${
                !sidebarOpen ? "sidebar_collapse_fade" : ""
              }`}
            >
              Contract Manager
            </div>
          </Button> */}
          {/* <Button
            className={`sidebar_navlink ${
              router.pathname === "/binding-manager" ? "is_active" : ""
            }`}
            onClick={() => handleRoute("binding-manager")}
            tooltip={!sidebarOpen ? "Binding Manager" : undefined}
            tooltipOptions={{ position: "right", event: "both" }}
          >
            <Image
              src="/sidebar/contract_icon.svg"
              width={18}
              height={18}
              alt="dashboard_icon"
            />
            <div
              className={`sidebar_navlink_text ${
                !sidebarOpen ? "sidebar_collapse_fade" : ""
              }`}
            >
              Binding Manager
            </div>
          </Button> */}
          {/* <Button
            className={`sidebar_navlink ${
              router.pathname === "/binding-request" ? "is_active" : ""
            }`}
            onClick={() => handleRoute("binding-request")}
            tooltip={!sidebarOpen ? "Binding Request" : undefined}
            tooltipOptions={{ position: "right", event: "both" }}
          >
            <Image
              src="/sidebar/contract_icon.svg"
              width={18}
              height={18}
              alt="dashboard_icon"
            />
            <div
              className={`sidebar_navlink_text ${
                !sidebarOpen ? "sidebar_collapse_fade" : ""
              }`}
            >
              Binding Request
            </div>
          </Button> */}
        </div>
      </div>
      <div className="sidebar_actions">
        <Button
          tooltip={!sidebarOpen ? "Help Center" : undefined}
          tooltipOptions={{ position: "right", event: "both" }}
          className={`sidebar_navlink ${
            router.pathname === "/help-center" ? "is_active" : ""
          }`}
          onClick={() => handleRoute("help-center")}
        >
          <Image
            src="/sidebar/help_center_icon.svg"
            width={18}
            height={18}
            alt="dashboard_icon"
          />
          <div
            className={`sidebar_navlink_text ${
              !sidebarOpen ? "sidebar_collapse_fade" : ""
            }`}
            style={{ color: "#95989A" }}
          >
            Help Center
          </div>
        </Button>
        <Button
          tooltip={!sidebarOpen ? "Settings" : undefined}
          tooltipOptions={{ position: "right", event: "both" }}
          className="sidebar_navlink"
          onClick={() => setVisible(true)}
        >
          <Image
            src="/sidebar/settings_icon.svg"
            width={18}
            height={18}
            alt="dashboard_icon"
          />
          <div
            className={`sidebar_navlink_text ${
              !sidebarOpen ? "sidebar_collapse_fade" : ""
            }`}
            style={{ color: "#95989A" }}
          >
            Settings
          </div>
        </Button>
      </div>
      {visible && (
        <SettingsDialog visible={visible} setVisible={setVisible} />
      )}
      <div className="sidebar-bottom">
            <Button
              className={`sidebar_navlink if_button ${!sidebarOpen ? 'mini_version' : ''}`}
              tooltip={!sidebarOpen ? t("sidebar.back_to_if") : undefined}
              tooltipOptions={{ position: "right", event: "both", className: "sidebar_tooltip" }}
              onClick={() => {
               handleIFNavigation();
              }}
          >
            <img
              src="/hive (1).svg"
              width={40}
              height={40}
              alt="Buy Components Icon"
            />
            <div
              className={`sidebar_navlink_text ${!sidebarOpen ? "sidebar_collapse_fade" : ""
                }`}
            >
              IndustryFusion-X
            </div>
            <img
              src="/arrow-left-02.svg"
              width={16}
              height={16}
              alt="Back arrow"
              style={{marginLeft: 'auto'}}
            />
          </Button>
        </div>
    </div>
  );
}
export default Sidebar;
