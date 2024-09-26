const ContractCards =()=>{
    return(
        <>
        <div className="mt-6 contract-cards-container">
            <div className="flex contract-card" style={{gap:"5rem"}}>
            <div className="flex gap-2 justify-content-center align-items-center">
                <i className="pi pi-folder"></i>
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
                <div>

                </div>
            </div>
            </div>
            <div className="flex contract-card mt-4" style={{gap:"5rem"}}>
            <div className="flex gap-2 justify-content-center align-items-center">
                <i className="pi pi-folder"></i>
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
            
            </div>
        </div>
        </>

    )
}

export default ContractCards;