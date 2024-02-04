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

const HorizontalNavbar: React.FC<HorizontalNavbarProps> = ({
  count,
  alerts,
  backgroundColor
}) => {
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
    backgroundColor: backgroundColor,
    zIndex: 1000,

  };

  const navList: CSSProperties = {
    listStyle: "none",
    color: "#000000",
    fontWeight: "bold"
  }

  const logoStyle: CSSProperties = {
    height: "53px", // Adjust as needed
    marginRight: "1rem",
    paddingBottom: "1rem" // Spacing after the logo
  };

  const navigateToFleet = () => {
    router.push("/asset-overview");
  };

  const navigateToFactoryManager = () => {
    router.push("/factory-manager");
  };

  return (
    <div style={navbarStyle}>
      <div className="flex align-items-center logo-container cursor-pointer"
        onClick={() => router.push("/asset-overview")}
      >
        <img src="/industryFusion_icon-removebg-preview.png" alt="Logo" style={logoStyle} />
      </div>
      <div className="flex  justify-content-between align-items-center" >
        <ul className="flex m-0 nav-lists " style={navList}>
          <li className="mr-4 ">About Us</li>
          <li className="mr-8 ">Contact Us</li>
        </ul>
      </div>
    </div>
  );
};

export default HorizontalNavbar;
