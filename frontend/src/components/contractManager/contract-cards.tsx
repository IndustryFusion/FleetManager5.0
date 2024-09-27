import { GiAlarmClock } from "react-icons/gi";
import { MdLockOpen, MdLockOutline } from "react-icons/md";

const ContractCards =()=>{
    return(
        <>
        <div className="mt-6 contract-cards-container">
            <div className="flex contract-card" style={{gap:"3rem"}}>
            <div className="flex gap-2 folder-heading align-items-center">
                <i className="pi pi-folder"
                
                ></i>
                <h3 className="m-0 contract-card-heading">Predective Maintenance contracts</h3>
            </div>
            <div>
                <div>
                    <p className="card-label-grey">Created at:</p>
                    <p className="mt-1 card-label-black">28 Nov 2018</p>
                </div>
                <div className="mt-3">
                   <p className="card-label-grey">Owner:</p>
                   <p className="mt-1 card-label-black">You</p>
                </div>
            </div>
            <div>
                <p className="card-label-grey">Shared with:</p>
                <div className="flex mt-3">
                  <div className=" share-content user-one">OW</div>
                  <div className=" share-content user-two">NA</div>
                  <div className=" share-content user-three">MP</div>
                </div>
            </div>
            </div>
            <div className="flex contract-card mt-4" style={{gap:"3rem"}}>
            <div className="flex gap-2 folder-heading align-items-center">
                <i className="pi pi-folder"></i>
                <h3 className="m-0 contract-card-heading">Insurance contracts</h3>
            </div>
            <div>
                <div>
                    <p className="card-label-grey">Created at:</p>
                    <p className="mt-1 card-label-black">28 Nov 2018</p>
                </div>
                <div className="mt-3">
                   <p className="card-label-grey">Owner:</p>
                   <p className="mt-1 card-label-black">Lana Sparks</p>
                </div>
            </div>
            
            </div>
            <div className="flex contract-card mt-4" style={{gap:"3rem"}}>
            <div className="flex gap-2 folder-heading align-items-center">
                <i className="pi pi-file-import" style={{fontSize:"22px"}}></i>
                <h3 className="m-0 contract-card-heading">Shareholders Agreement</h3>
            </div>
            <div>
                <div>
                    <p className="card-label-grey">Created at:</p>
                    <p className="mt-1 card-label-black">28 Nov 2018</p>
                </div>
                <div className="mt-3">
                   <p className="card-label-grey">Owner:</p>
                   <p className="mt-1 card-label-black">Lana Sparks</p>
                </div>
            </div>
            <div>
                <p className="card-label-grey">Shared with:</p>
                <div className="flex mt-3">
                  <div className=" share-content user-one">OW</div>
                  <div className=" share-content user-two">NA</div>
                </div>
            </div>
            <div>
                <div className="flex gap-3">
                  <i className=" pi pi-arrow-right"
                  style={{color: "#1be21b"
                   }}
                  ></i>
                  <MdLockOutline style={{ fontSize: "20px", color: "#1be21b"}}/>
                  <div>
                    <p className="card-label-black">Other Company Lt.d</p>
                    <p className="mt-1 card-label-grey">Jacob Hamesworth</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <i className="pi pi-eye" style={{color:"#95989a"}}></i>
                  <MdLockOpen style={{ fontSize: "20px", color: "#95989a"}}/>
                  <div>
                    <p className="card-label-black">Different company Gmbh</p>
                    <p className="mt-1 card-label-grey" >Jarek Owczarek</p>
                  </div>
                </div>
                <div>

                </div>
            </div>
            <div className="flex justify-content-center align-items-center">
                <button
                className="reminder-btn"
                >
                    <GiAlarmClock className="mr-2" />
                    Add Reminder</button>
            </div>
            
            </div>
        </div>
        </>

    )
}

export default ContractCards;