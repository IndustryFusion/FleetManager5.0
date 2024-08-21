import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import "../../../public/styles/add-user.css";
import "../../../public/styles/asset-overview.css";
import { Button } from "primereact/button";

interface cloneDialogProps{
  cloneDialog: boolean,
  setCloneDialog: React.Dispatch<React.SetStateAction<boolean>> ,
  activeTab:string 
}

const CloneDialog: React.FC<cloneDialogProps> = ({
  cloneDialog,
  setCloneDialog,
  activeTab,
}) => {
  const footerContent = (
    <div>
      <Button
        severity="danger"
        outlined
        label="Cancel"
        onClick={() => setCloneDialog(false)}
      />
      <Button label="Save" onClick={() => setCloneDialog(false)} autoFocus />
    </div>
  );
  return (
    <>
      <Dialog
        header="Clone"
        footer={footerContent}
        visible={cloneDialog}
        style={{ width: "30vw" }}
        onHide={() => {
          if (!cloneDialog) return;
          setCloneDialog(false);
        }}
        className="clone-dialog"
      >
        {activeTab === "Assets" && (
          <div>
            <div className="flex  align-items-center gap-4 mb-14">
              <label className="clone-label" htmlFor="asset">
                Asset
              </label>
              <InputText className="m-0 email-input"
              placeholder="Machine Serial Number"
              />
            </div>          
          </div>
        )}
        {activeTab === "Models" && (
          <div>
            <div className="flex align-items-center gap-4 mb-14">
              <label className="clone-label" htmlFor="product name">
                Product Name
              </label>
              <InputText className="m-0 email-input" />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default CloneDialog;
