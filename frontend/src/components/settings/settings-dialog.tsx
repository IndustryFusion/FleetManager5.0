import { Dialog } from "primereact/dialog";
import SettingsSidebar from "./settings-sidebar";
import "../../../public/styles/settings.css"
import ProfileContent from "./profile-content";

const SettingsDialog:React.FC<any> =({visible, setVisible})=>{
    return(
        <>
         <Dialog
        header="Details"
        visible={visible}
        style={{ width: "80vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
        className="settings-dialog"
      >

        <div className="flex">
            <div className="settings-left-content">
            <SettingsSidebar />
            </div>
            <div className="settings-right-content">
            <ProfileContent
            setVisible={setVisible}
            />
            </div>
        </div>
      </Dialog>    
      </>
    )
}

export default SettingsDialog;