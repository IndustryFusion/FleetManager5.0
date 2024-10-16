import { useTranslation } from "next-i18next";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dispatch, SetStateAction } from "react";
import "../../public/styles/add-contract.css"

interface DeleteDialogProps {
  deleteDialog: boolean;
  setDeleteDialog: Dispatch<SetStateAction<boolean>>;
  handleDelete: () => void;
  deleteItemName?: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  deleteDialog,
  setDeleteDialog,
  handleDelete,
  deleteItemName,
}) => {
  const { t } = useTranslation("overview");
  const header = () => <h4 className="m-0">Confirm Delete</h4>;
  return (
    <>
      <Dialog
        style={{ width: "600px" }}
        visible={deleteDialog}
        onHide={() => setDeleteDialog(false)}
        header={header}
      >
        <div className="mb-6 mt-5">
          <h3 className="delete-text"> {deleteItemName}</h3>
        </div>

        <div className="flex justify-content-end">
          <Button
            label={t("yes")}
            icon="pi pi-check"
            className="mr-2 delete-action-buttons"
            onClick={handleDelete}
          ></Button>
          <Button
            label={t("no")}
            icon="pi pi-times"
            severity="danger"
            outlined
            className="ml-3 delete-action-buttons"
            onClick={() => setDeleteDialog(false)}
          ></Button>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteDialog;
