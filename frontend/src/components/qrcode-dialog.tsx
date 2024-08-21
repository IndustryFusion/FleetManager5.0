import { useTranslation } from "next-i18next";
import { Dialog } from "primereact/dialog";
import { useRef } from "react";
import "../../public/styles/asset-overview.css"

const QRCodeDialog:React.FC<any> =({qrCodeLink, dialogProp, setDialogProp, qrCodeDialogRef})=>{
    const { t } = useTranslation(['overview', 'placeholder']);

    return(
        <>
         <Dialog
                header={t('overview:qrCode')}
                visible={dialogProp}
                style={{ width: "50vw" }}
                onHide={() => setDialogProp(false)}
            >
                <div>
                    {qrCodeLink && (
                        <div  className="qr-container" >
                            <div ref={qrCodeDialogRef} />
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    )
}

export default QRCodeDialog;