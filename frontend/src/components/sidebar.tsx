import { InputText } from "primereact/inputtext";
import "../../public/styles/sidebar.css";
import { useTranslation } from "next-i18next";
import { IoSettingsOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import SettingsDialog from "./settings/settings-dialog";

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar: React.FC<SideBarProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation(["overview", "placeholder"]);
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  return (
    <section className="sidebar">
      {isOpen ? (
        <>
          <div className="logo-container flex gap-3">
            <img
              src="/ifric-org_horizontal.jpg"
              alt="ifric-org-logo"
              className="ifric-org-logo-icon"
              onClick={() => router.push("/dashboard")}
            />
            <img
              src="/sidebar-icon.jpg"
              alt="sidebar-icon"
              onClick={() => setIsOpen(!isOpen)}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="sidebar-dashboard-item">
            <div className="flex align-items-center justify-content-between ">
              <div className="flex align-items-center sidebar-dashboard-text">
                <img
                  src="/dashboard-images/dashboard.jpg"
                  alt="asset-series-icon"
                  className="mr-2"
                />
                <p className="m-0">Dashboard</p>
              </div>
              <span className="new-tag">new</span>
            </div>
          </div>
          <div>
            <div>
              <h4 className="nav-heading">Digital Product Pass</h4>
              <ul className="nav-list">
                <li
                  className="flex align-items-center"
                  onClick={() => router.push("/asset-overview?tab=Models")}
                >
                  {" "}
                  <img
                    src="/dashboard-images/asset-series.jpg"
                    alt="asset-series-icon"
                    className="mr-2"
                  />
                  Asset Series
                </li>
                <li
                  className="flex align-items-center "
                  onClick={() => router.push("/asset-overview")}
                >
                  {" "}
                  <img
                    src="/dashboard-images/assets.jpg"
                    alt="assets-icon"
                    className="mr-2"
                  />
                  Assets
                </li>
                <li
                  className="flex align-items-center "
                  onClick={() =>
                    router.push(
                      "/digital-pass-creator/qr-code-generator/create"
                    )
                  }
                >
                  {" "}
                  <img
                    src="/qr-code-1.jpg"
                    alt="qr-code-icon"
                    className="mr-2"
                  />
                  Pass Creator
                </li>
              </ul>
            </div>
            <div className="second-item">
              <h4 className="nav-heading">Digital Twin</h4>
              <ul className="nav-list">
                <li className="flex align-items-center ">
                  {" "}
                  <img src="/ai-browser.jpg" alt="docs-icon" className="mr-2" />
                  Digital Twin Creator
                </li>
                <li className="flex align-items-center ">
                  {" "}
                  <img src="/ai-browser.jpg" alt="docs-icon" className="mr-2" />
                  Menupoint 2
                </li>
                <li className="flex align-items-center ">
                  {" "}
                  <img src="/ai-browser.jpg" alt="docs-icon" className="mr-2" />
                  Menupoint 3
                </li>
              </ul>
            </div>
            <div className="pass-quota-container">
              <h3 className="m-0">Product Pass Quota</h3>
              <img
                src="/usage-bar.jpg"
                alt="progress-bar"
                className="progress-bar"
              />
              <p className="progress-value m-0">Quota remaining: 9,159</p>
              <p className="progress-value m-0">Total quota: 10,000</p>

              <p className="upgrade-text">Upgrade Plan</p>
            </div>
            <div className="flex align-items-center item-container">
              <img src="/book.jpg" alt="docs-icon" className="mr-2" />
              <h3 className="item-heading">Helpcenter</h3>
            </div>
            <div
              className="flex align-items-center item-container"
              onClick={() => setVisible(true)}
            >
              <img src="/settings.jpg" alt="settings-icon" className="mr-2" />
              <h3 className="item-heading">Settings</h3>
            </div>
          </div>
        </>
      ) : (
        <div>
          <div className="flex">
            <img
              src="/ifric-org_horizontal-RGB.png"
              alt="ifric-org_horizontal-icon"
              className="ifric-org-logo-icon"
              onClick={() => router.push("/dashboard")}
            />
            <img
              onClick={() => setIsOpen(!isOpen)}
              src="/sidebar-right.png"
              alt="sidebar-right"
              className="sidebar-right-icon"
            />
          </div>
          <div className="collapse-sidebar-menu">
            <div className="flex flex-column gap-4 sidebar-items">
              <img
                src="/ai-browser-gray.svg"
                alt="menu-item-icon"
                width="100%"
                height="100%"
              />
              <img src="/qr-code-1.jpg" alt="qr-code-icon" />
              <img src="/ai-browser-gray.svg" alt="menu-item-icon" />
            </div>
            <div className="flex flex-column gap-4 sidebar-second-items">
              <img src="/ai-browser-gray.svg" alt="menu-item-icon" />
              <img src="/ai-browser-gray.svg" alt="menu-item-icon" />
              <img src="/ai-browser-gray.svg" alt="menu-item-icon" />
              <img src="/ai-browser-gray.svg" alt="menu-item-icon" />
            </div>
            <div className="flex flex-column gap-4 sidebar-second-items">
              <img src="/book.jpg" alt="docs-icon" className="mr-2" />
              <img src="/settings.jpg" alt="settings-icon" className="mr-2" />
            </div>
          </div>
          <div></div>
        </div>
      )}
      {visible && <SettingsDialog visible={visible} setVisible={setVisible} />}
    </section>
  );
};

export default Sidebar;
