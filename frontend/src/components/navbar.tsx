import { useTranslation } from "next-i18next";
import { BreadCrumb } from "primereact/breadcrumb";
import "../../public/styles/horizontal-navbar.css";
import "../../public/styles/asset-overview.css";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Button } from "primereact/button";
import ProfileMenu from "./profile-menu";

type NavbarProps = {
  navHeader?: string;
};
type BreadcrumbItem = {
  label: string;
  url?: string;
  className?: string;
  command?: (event: any) => void;
};

const Navbar: React.FC<NavbarProps> = ({ navHeader }) => {
  const { t } = useTranslation(["overview", "placeholder"]);
  const [profileDetail, setProfileDetail] = useState(false);
  const router = useRouter();

  const fullPath = router.asPath;
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    let items: BreadcrumbItem[] = [];

    const createLastItem = (label: string): BreadcrumbItem => ({
      label,
      className: "current-page",
      command: (event: any) => {
        event.originalEvent.preventDefault();
        event.originalEvent.stopPropagation();
      },
    });

    if (fullPath.includes("/certificates?asset_ifric_id=")) {
      return [
        { label: "Asset", url: "/asset-overview" },
        createLastItem("Certificates"),
      ];
    }
    if (fullPath.includes("/contract-manager")) {
      return [createLastItem("Contract Manager")];
    }
    if (fullPath.includes("/binding-manager")) {
      return [createLastItem("Binding Manager")];
    }
    if (fullPath.includes("/binding-request")) {
      return [createLastItem("Binding Request")];
    }
    if (fullPath.includes("/contract")) {
      return [createLastItem("Contract ")];
    }

    let pathParts = fullPath.split("/").filter((part) => part);
    if (pathParts.length > 0) {
      pathParts[pathParts.length - 1] =
        pathParts[pathParts.length - 1].split("?")[0];
    }

    if (
      pathParts[0] === "asset" ||
      pathParts[0] === "assets" ||
      pathParts[0] === "asset-overview"
    ) {
      items.push({
        label: "Asset",
        url: "/asset-overview",
      });
      if (pathParts.length === 1) {
        items[0].className = "current-page";
        return items;
      }
    } else {
      items.push({
        label: pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1),
        url: `/${pathParts[0]}`,
        className: pathParts.length === 1 ? "current-page" : "",
      });
      if (pathParts.length === 1) {
        return items;
      }
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();
  const showBackButton = breadcrumbItems.length >= 2;

  const handleBackClick = () => {
    router.back();
  };

  const home = {
    label: "",
    url: "/asset-overview",
    template: () => (
      <div className="flex gap-1 align-items-center">
        {showBackButton && (
          <Button
            icon="pi pi-angle-double-left"
            onClick={handleBackClick}
            className="p-button-text p-button-rounded p-button-secondary -ml-1"
            style={{ color: "#6c757d" }}
            aria-label="Go back"
          />
        )}
        <Link href="/asset-overview" legacyBehavior>
          <Image
            src="/sidebar/home_icon.svg"
            alt="Home"
            width={20}
            height={19}
            style={{ cursor: "pointer" }}
            className=""
          />
        </Link>
      </div>
    ),
  };

  return (
    <>
      <div className="flex gap-3 align-items-center asset-overview-header justify-content-between">
        <div>
        <h2 className="nav-header">{navHeader}</h2>
        <BreadCrumb
          model={breadcrumbItems}
          home={home}
          className={`nav-breadcrumb p-0 border-none bg-transparent ${
            breadcrumbItems.length < 2 ? "mt-2 ml-2" : ""
          }`}
        />
        </div>
        <div className="flex gap-4 nav-items">
          <button className="nav_icon_button"><img src="/notification-icon.svg" alt="notification-icon" /></button>
          <button className="nav_icon_button"><img src="/app-icon.svg" alt="app-icon" /></button>
          <ProfileMenu />
        </div>
      </div>
    </>
  );
};

export default Navbar;
