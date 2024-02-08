import React from "react";
import "primeflex/primeflex.css";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import "primeicons/primeicons.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { ColorPicker } from "primereact/colorpicker";
// import AlertDetails from "@/alert/alertDetails";
import { useState } from "react";
import { CSSProperties } from "react";
import { Image } from "primereact/image";
import { useRouter } from "next/router";
// import NavLink from "../components/nav-links";
import { Tooltip } from 'primereact/tooltip';
import Cookies from "js-cookie";
interface Alerts {
  text: string;
  resource: string;
  severity: string;
}

interface HorizontalNavbarProps {
  count: number;
  alerts: Alerts[];
  backgroundColor: string;
}

const HorizontalNavbar: React.FC = () => {
  const router = useRouter();
  const isAssetOverviewRoute = router.pathname === '/asset-overview';
  const navbarStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 3.4rem 0px",
    backgroundColor: "white",
    zIndex: 1000,
    borderBottom: "solid",
    borderBottomWidth: "1px",
    borderRadius: "5px",
    borderColor: "#A9A9A9",

  };

  const navList: CSSProperties = {
    listStyle: "none",
    color: "#000000",
    fontWeight: "bold"
  }

  const logoStyle: CSSProperties = {
    height: "53px",
    width: "9rem",
    marginRight: "1rem",
    paddingBottom: "1rem" // Spacing after the logo
  };

  const navigateToFleet = () => {
    router.push("/asset-overview");
  };

  const navigateToFactoryManager = () => {
    router.push("/factory-manager");
  };

  const navigateToIndustryFusion = () => {
    router.push("https://industry-fusion.org/de");
  };

  const logout = () => {
    Cookies.set("login_flag", "false");
    router.push("/login");
  };

  

  return (
    <div style={navbarStyle}>
      <div className="flex align-items-center logo-container cursor-pointer"
        onClick={() => router.push("/asset-overview")}
      >
        <img src="/industryFusion_icon-removebg-preview.png" alt="Logo" style={logoStyle} />
      </div>
      <div className="flex  justify-content-between align-items-center" >
          <Button label="About Us" link onClick={navigateToIndustryFusion}
          className="mr-2"  style={{fontFamily: "Segoe UI", fontSize:"14px", fontWeight:"bold", color:"#615e5e"}} />
          <Button label="Contact Us" link
          className="mr-2"  style={{fontFamily: "Segoe UI", fontSize:"14px", fontWeight:"bold", color:"#615e5e"}} />

          <Button  icon= "pi pi-user" link 
          className="mr-2 "  style={{fontFamily: "Segoe UI", fontSize:"14px", fontWeight:"bold", color:"#615e5e"}} tooltip="Profile Details" tooltipOptions={{ position: 'bottom'}}/>

          <Button onClick={logout} icon= "pi pi-sign-out" link 
          className="mr-2"  style={{fontFamily: "Segoe UI", fontSize:"14px", fontWeight:"bold", color:"#615e5e"}} tooltip="logout" tooltipOptions={{ position: 'bottom'}}  />

      </div>
    </div>
  );
};

export default HorizontalNavbar;
