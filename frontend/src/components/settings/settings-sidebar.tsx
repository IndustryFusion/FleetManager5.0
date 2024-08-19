import { useRouter } from "next/router";


const SettingsSidebar = () => {
 const router = useRouter();

  return (
    <>
      <div>
        <h3 className="m-0">Settings</h3>
        <div className="second-item">
          <h4 className="nav-heading">Personal settings</h4>
          <ul className="nav-list">
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/profile-icon.svg" alt="docs-icon" className="mr-2" />
              Profile
            </li>
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/account.svg" alt="docs-icon" className="mr-2" />
              Account
            </li>
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/notification.svg" alt="docs-icon" className="mr-2" />
              Notifications
            </li>
          </ul>
        </div>
        <div className="second-item">
          <h4 className="nav-heading">company settings</h4>
          <ul className="nav-list">
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/company.svg" alt="docs-icon" className="mr-2" />
              Company
            </li>
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/general.svg" alt="docs-icon" className="mr-2" />
              General
            </li>
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/plans.svg" alt="docs-icon" className="mr-2" />
              Plans
            </li>
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/billing.svg" alt="docs-icon" className="mr-2" />
              Billing
            </li>
          </ul>
        </div>
        <div className="second-item">
          <h4 className="nav-heading">Admin settings</h4>
          <ul className="nav-list">
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/file-validation.svg" alt="docs-icon" className="mr-2" />
              Company Verification
            </li>
            <li className="flex align-items-center "
            onClick={()=>router.push("/user-management")}
            >
              {" "}
              <img src="/settings/user-multiple.svg" alt="docs-icon" className="mr-2" />
              User Management
            </li>
            <li className="flex align-items-center "
              onClick={()=>router.push("/user-management?tab=Groups")}
            >
              {" "}
              <img src="/settings/user-group.svg" alt="docs-icon" className="mr-2" />
              Access Groups
            </li>
            <li className="flex align-items-center ">
              {" "}
              <img src="/settings/integration.svg" alt="docs-icon" className="mr-2" />
              Integrations
            </li>
          </ul>
        </div>
        <div className="second-item">
          <h4 className="nav-heading">DPP Creator settings</h4>
          <ul className="nav-list">
            <li className="flex align-items-center "
            onClick={()=>router.push("/erp/settings")}
            >
              ERP Settings
            </li>
            <li className="flex align-items-center "       
            onClick={()=>router.push("/sync-history")}>
              Sync History
            </li>
          </ul>
          </div>
      </div>
    </>
  );
};

export default SettingsSidebar;
