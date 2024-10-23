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
        <div className="sidebar_logo_wrapper">
          <Image
            src="/sidebar/logo_expanded.svg"
            width={184}
            height={0}
            alt="fleet logo"
            onClick={() => handleRoute("dashboard")}
            style={{ cursor: "pointer",height:"auto" }}
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
          <Button
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
          </Button>
          <Button
            className={`sidebar_navlink ${
              router.pathname.startsWith("/certificates")
                ? "is_active"
                : ""
            }`}
            tooltip={!sidebarOpen ? "Certificates" : undefined}
            tooltipOptions={{ position: "right", event: "both" }}
            onClick={() =>
              handleRoute("certificates")
            }
          >
            <Image
              src="/sidebar/certificate_icon.svg"
              width={18}
              height={18}
              alt="dashboard_icon"
            />
            <div
              className={`sidebar_navlink_text ${
                !sidebarOpen ? "sidebar_collapse_fade" : ""
              }`}
            >
              Certificates
            </div>
          </Button>
         <div style={{marginTop:"22rem"}}>
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
        </div>
      </div>
    </div>
  );
}
export default Sidebar;
