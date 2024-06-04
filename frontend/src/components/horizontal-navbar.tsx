// 
// Copyright (c) 2024 IB Systems GmbH 
// 
// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 
// 
//   http://www.apache.org/licenses/LICENSE-2.0 
// 
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License. 
// 

import React from "react";
import "primeflex/primeflex.css";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { useState } from "react";
import { CSSProperties } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { resetTimer, logout } from "@/redux/auth/authSlice";
import ProfileDialog from "./profile-dialog";
import Language from "./language";
import { useTranslation } from "next-i18next";
import "../../public/styles/navbar.css"
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
  const { t } = useTranslation('header');
  const isAssetOverviewRoute = router.pathname === '/asset-overview';
  const [profileDetail, setProfileDetail] = useState(false);
  const dispatch = useDispatch();


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


  const logoStyle: CSSProperties = {
    width: "45px",
    padding: "0.5rem 0"
  }
  const logoText: CSSProperties = {
    fontWeight: "600",
    color: "#615E5E",
    fontFamily: "Inter",
    fontSize: "21px"
  }

  const navListItem: CSSProperties = {
    fontFamily: "Segoe UI",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#615e5e"

  }

  const navigateToIndustryFusion = "https://industry-fusion.org/de"

  const handleLogout = () => {
    Cookies.set("login_flag", "false");
    router.push("/login", undefined, {locale: 'en'});
    dispatch(resetTimer());
    dispatch(logout());
  };

  return (
    <div style={navbarStyle}>
      <div className="flex align-items-center gap-1 logo-container cursor-pointer"
        onClick={() => router.push("/asset-overview")}
      >
        <img src="/industryFusion_icon-removebg-preview.png" alt="Logo" style={logoStyle} />
        <p style={logoText}>Fleet Manager</p>
      </div>
      <div className="flex  justify-content-between align-items-center" >
        <div className="mr-3 language-dropdown">
          <Language />
        </div>
        <Button label={t('aboutUs')} link
          rel="noopener noreferrer"
          onClick={() => window.open(navigateToIndustryFusion, '_blank')}
          className="mr-2 " style={navListItem} />
        <Button label={t('contactUs')} link
          rel="noopener noreferrer"
          onClick={() => window.open(navigateToIndustryFusion, '_blank')}
          className="mr-2 " style={navListItem} />
        <Button icon="pi pi-user" link
          className="mr-2 " style={navListItem} tooltip="Profile Details" tooltipOptions={{ position: 'bottom' }}
          onClick={() => setProfileDetail(true)}
        />
        <Button onClick={handleLogout} icon="pi pi-sign-out" link
          className="mr-2" style={navListItem} tooltip="logout" tooltipOptions={{ position: 'bottom' }} />
        {profileDetail &&
          <ProfileDialog
            profileDetailProp={profileDetail}
            setProfileDetailProp={setProfileDetail}
          />
        }

      </div>
    </div>
  );
};

export default HorizontalNavbar;
