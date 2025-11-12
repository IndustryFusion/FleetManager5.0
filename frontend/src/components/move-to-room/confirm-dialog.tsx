import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../../../public/styles/confirm-dialog.css";

interface ConfirmTransferDialogProps {
    visible: boolean;
    assetName: string;
    transferAsset: any;
    factoryOwner?: {
        companyName?: string;
        companyImage?: string;
        companyCategory?: string;
        country?: string;
        city?: string;
    };
    onHide: () => void;
    onConfirm: () => void;
    contract?: string[];
}

export default function ConfirmTransferDialog({
    visible,
    assetName,
    transferAsset,
    factoryOwner,
    onHide,
    onConfirm,
    contract
}: ConfirmTransferDialogProps) {
    const footer = (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
            <button
                className="global-button is-white"
                style={{ height: "30px" }}
                onClick={onHide}
            >
                <img src="/cancel-circle.svg" alt="Cancel" />
               Discard
            </button>
            <Button
                className="global-button"
                style={{ height: "30px" }}
                onClick={onConfirm}
            >
                <img src="/signature.svg" alt="Confirm" height={18} width={18} />
                Confirm
            </Button>
        </div>
    );

    const renderLogo = (logo?: string, name?: string) => {
        if (logo && logo.trim() !== "") {
            return (
                <img
                    src={logo}
                    alt={`${name || "Company"} logo`}
                    className="group-logo"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                />
            );
        }
        return <div className="no-product-img">{name ? name[0].toUpperCase() : "?"}</div>;
    };

   const hasContract = Array.isArray(contract) && contract.length > 0;

    return (
      <Dialog
        header="Confirm Ownership Transfer"
        visible={visible}
        style={{ width: "42vw", borderRadius: "10px" }}
        modal
        onHide={onHide}
        className="confirm-transfer-dialog"
        footer={footer}
      >
        <div className="confirm-dialog-container">
          <div className="confirm-dialog-content">
            <div className="confirm-heaader-title">
              You are about to add a new owner to the PDT.
            </div>

            <div className="counter-parties-container">
              <div className="contract-parties w-full">
                <h3 className="contract-parties-header">Contract Parties</h3>

                <div className="parties-container">
                  <div className="party-card">
                    <div className="group-info">
                      {renderLogo(
                        transferAsset?.company_image,
                        transferAsset?.company_name
                      )}
                      <div className="group-text">
                        <div className="group-name">
                          {transferAsset?.company_name}
                        </div>
                        <div className="signed-contracts">
                          {transferAsset?.company_city || "City"},{" "}
                          {transferAsset?.company_country || "Country"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="transfer-arrow">
                    <img src="/Arrow 2.svg" />
                  </div>

                  {/* New Owner */}
                  <div className="party-card">
                    <div className="group-info">
                      {renderLogo(
                        factoryOwner?.companyImage,
                        factoryOwner?.companyName
                      )}
                      <div className="group-text">
                        <div className="group-name">
                          {factoryOwner?.companyName}
                        </div>
                        <div className="signed-contracts">
                          {factoryOwner?.city || "City"},{" "}
                          {factoryOwner?.country || "Country"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="confirm-heaader-title">
            {hasContract ? (
              <>
                This action will assign PDT Asset to the new company with the below
                data sharing contract, and the new owner can see this PDT Asset in
                their <strong className="blue">IFX Eco-System</strong> — specifically in{" "}
                <strong className="blue">Factory Manager & Fleet Manager</strong>.
              </>
            ) : (
              <>
                This action will assign PDT Asset to the new company. The new owner
                can see this PDT Asset in their{" "}
                <strong className="blue">IFX Eco-System</strong> — specifically in{" "}
                <strong className="blue">Factory Manager & Fleet Manager</strong>.
              </>
            )}
            </div>
          </div>

            <div className="footer-dialog-confirm">
              <h3 className="contract-header pt-1">
                <img src="/custom-field (1).svg" alt="Contracts Icon" />
                Contracts
              </h3>
              <div className="contract-display">
            {hasContract ? (
              contract.map((c, index) => (
                  <span key={index} className="contract-item">
                    {c}
                  </span>
              ))
            ) : (
              <span className="contract-item">---- -----</span>
            )}
            </div>
        </div>
      </div>
      </Dialog>
    );
}
