import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React from 'react';
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from 'react-i18next';
import "../../../public/styles/add-contract.css"

interface DeleteDialogProps {
    deleteDialog: boolean;
    setDeleteDialog: Dispatch<SetStateAction<boolean>>;
    handleDelete: () => void;
    deleteItemName?: React.ReactNode;
    id: string
  }
  

const DeleteDialogBox:React.FC<DeleteDialogProps> = ({
    deleteDialog,
    setDeleteDialog,
    handleDelete,
    deleteItemName,
    id
  }) => {
 
    const { t } = useTranslation("overview");
    const header = () => <h4 className="m-0">Confirm Delete</h4>;
  
    const footerContent =(
      <div>
        <Button
          className="cancel-btn"
          label="Cancel"
          onClick={() => setDeleteDialog(false)}
        />
        <Button
        className="action-btn-save"
        label="Save" onClick={() => handleDelete(id)} autoFocus />
      </div>
    );
  
    return (
      <>
        <Dialog
          style={{ width: "600px" }}
          visible={deleteDialog}
          onHide={() => setDeleteDialog(false)}
          header={header}
          footer={footerContent}
          draggable={false}
          resizable={false}
        >
          <div className="mb-4 mt-5">
            {deleteItemName}
          </div>
        
        </Dialog>
      </>
    );
  
}

export default DeleteDialogBox;