import { useTranslation } from "next-i18next";
import { BreadCrumb } from "primereact/breadcrumb";
import "../../public/styles/horizontal-navbar.css";
import "../../public/styles/asset-overview.css"
import ProfileDialog from "./profile-dialog";
import { useState } from "react";
import { useRouter } from "next/router";

type NavbarProps={
  navHeader?: string
}

const Navbar:React.FC<NavbarProps> = ({ navHeader}) => {
  const { t } = useTranslation(["overview", "placeholder"]);
  const [profileDetail, setProfileDetail] = useState(false);
  const router = useRouter();

  let pathParts = router.asPath.split('/').filter((part) => part);
  if(pathParts[0] === "digital-pass-creator" ){
    pathParts = pathParts.filter(part => part === "digital-pass-creator");
  }
 
    const items = pathParts.map((part, index) => {
        let url = `/${pathParts.slice(0, index + 1).join('/')}`;
        let label = part.replace(/-/g, ' ');
         if(label === "asset overview"){
          label = "Table View"
         }else if(url === "/user-management?tab=Groups"){
          label = "User Management"
         }else if(url === "/asset-overview?tab=Models"){
          url="/asset-overview"
          label = "PDT Overview"
         } 
         label =label.replace(/\b\w/g, char => char.toUpperCase())
         const className = index === pathParts.length - 1 ? 'current-page' : '';
        return { label, url, className };
    });

    const home = { label: "Assets", url: "/asset-overview" };
    const homeRoute = { label: "Home", url: "/asset-overview" }; 
    const addUserItems = [
      {label:"Settings", url:""},
      {label:"User Management", url:"/user-management"},
      {label:"Add User", url:"/add-user",  className: "add-user-item"},
      ]    
      const userDetailsItems = [
        {label:"Settings", url:""},
        {label:"User Management", url:"/user-management"},
        {label:"User Details", url:"/user-details",  className: "user-details-item"},
     ]
     
  return (
    <>
      <div className="flex gap-3 align-items-center asset-overview-header justify-content-between">
        {pathParts[0] !== "dashboard" ? (
          <div className="flex align-items-center">
            <img
              src="/back-arrow.jpg"
              alt="back-arrow"
              className="cursor-pointer"
            />
            <div>
              <h2 className="nav-header">{navHeader}</h2>
              {router.route === "/add-user" ? (
                <BreadCrumb model={addUserItems} home={homeRoute} className="nav-breadcrumb"/>
              ) : router.route === "/user-details" ? (
                <BreadCrumb model={userDetailsItems} home={homeRoute} className="nav-breadcrumb" />
              ): (
                <BreadCrumb model={items} home={home} className="nav-breadcrumb"/>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="dashboard-user-name">Michael Scott</h2>
            <h3 className="user-company-name">Companyname GmbH & Co. KG</h3>
          </div>
        )}
        <div className="flex gap-4 nav-items">
          <img src="/notification-icon.svg" alt="notification-icon" />
          <img src="/app-icon.svg" alt="app-icon" />
          <img
            src="/profile-icon.jpg"
            alt="profile-icon"
            onClick={() => setProfileDetail(true)}
          />
        </div>
      </div>
      {profileDetail && (
        <ProfileDialog
          profileDetailProp={profileDetail}
          setProfileDetailProp={setProfileDetail}
        />
      )}
    </>
  );
};

export default Navbar;
