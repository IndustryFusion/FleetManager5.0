import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../../../public/styles/confirm-dialog.css";

interface ConfirmTransferDialogProps {
  visible: boolean;
  assetName: string;
  transferAsset:any;
  factoryOwner?: { companyName?: string };
  onHide: () => void;
  onConfirm: () => void;
}



export default function ConfirmTransferDialog({
  visible,
  assetName,
  transferAsset,
  factoryOwner,
  onHide,
  onConfirm,
}: ConfirmTransferDialogProps) {
  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
      <button
        className="global-button is-white"
        style={{ height: "30px" }}
        onClick={onHide}
      >
        <img src="/cancel-circle.svg" alt="" />
        Cancel
      </button>
      <Button
        className="global-button"
        style={{ height: "30px" }}
        onClick={onConfirm}
      >
        <img src="/signature-white.svg" alt="" height={18} width={18} />
        Confirm
      </Button>
    </div>
  );

  console.log("Factory",factoryOwner)
  return (
    <Dialog
      header="Confirm Ownership Transfer"
      visible={visible}
      style={{ width: "40vw", borderRadius: "10px" }}
      modal
      onHide={onHide}
      className="confirm-transfer-dialog"
      footer={footer}
    >
      <div className="confirm-dialog-container">
        <div className="confirm-dialog-content">
          <div>You are about to add new Owner to the PDT</div>
          <div className="counter-parties-container">
            <div className="contract-parties">
              <h3>Contract Parties</h3>
              <div className="parties-container">
                <div className="party-card">
                  <img
                    src={
                      transferAsset?.company_image || "/default-logo.png"
                    }
                    alt={transferAsset?.company_name}
                  />
                  <div className="party-info">
                    <strong>
                      {transferAsset?.company_name || "Current Company"}
                    </strong>
                    <p>
                      {transferAsset?.company_city || "City"},{" "}
                      {transferAsset?.company_country || "Country"}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="transfer-arrow">➡</div>

                {/* New/Transfer Company */}
                <div className="party-card">
                  <img
                    src={factoryOwner?.companyLogo || "/default-logo.png"}
                    alt={factoryOwner?.companyName}
                  />
                  <div className="party-info">
                    <strong>
                      {factoryOwner?.name|| "New Company"}
                    </strong>
                    <p>
                      {factoryOwner?.companyCity || "City"},{" "}
                      {factoryOwner?.companyCountry || "Country"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            This action will assign PDT Asset to the new company with below data
            sharing contract and new owner can see this PDT Asset in their IFX
            Eco-System, that is in, Factory Manager & Fleet Manager
          </div>
        </div>
        <div></div>
      </div>
    </Dialog>
  );
}
