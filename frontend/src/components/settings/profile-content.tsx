import { InputText } from "primereact/inputtext";
import AddUserTable from "../userManagement/addUserTable";
import "../../../public/styles/add-user.css";
import "../../../public/styles/settings.css"
import { BreadCrumb } from "primereact/breadcrumb";

const ProfileContent:React.FC<any> =({setVisible})=>{
    const home = {label: "Personal Settings"};
	const items = [{label:"Profile"}]
 
    return(
        <>
        <section>
            <div className="flex justify-content-between align-items-center profile-navbar">
                <BreadCrumb model={items} home={home} />
                <div>
                <img 
                className="close-icon"
                 onClick={()=>setVisible(false)}
                src="/close-icon.png" alt="close-icon" />
                </div> 
            </div> 
            <div className="profile-container">
            <h2 style={{marginBottom:"40px"}}>Lahari</h2>
            <p style={{marginBottom:"25px"}}>Last active on Jul 23, 2024</p>
            <div className="flex gap-4">
              <div className="user-info-container">
                <div className="user-info-content">
                  <div className="user-name-profile">
                    <span className="user-name">L</span>
                  </div>
                  <div>
                  <p className="m-0 user-info-label">Full Name</p>
                  <p className=" user-info-text">Lahari</p>
                </div>
                <div>
                  <p className="m-0 user-info-label">Email address</p>
                  <p className=" user-info-text">lahari.jain@ib.com</p>
                </div>
                <div>
                  <p className="m-0 user-info-label">Public name</p>
                  <p className=" user-info-text">@Lahari</p>
                </div>
                <button className="add-group-btn">Suggest Changes</button>
              </div>
              </div>
              <div className="product-access-container">
                <div>
                <div className="flex justify-content-between product-access-header">
                    <p className=" m-0 add-user-subheading">Product access</p>
                    <div>
                      <button className="add-group-btn">Grant access</button>
                    </div>
                </div>
                  <p className="add-user-para">Manage existing product roles and product access.</p>
                  <AddUserTable 
                  hideColumn={false}
                  tableWidth="100%"
                  />
                </div>
              </div>
            </div>
          </div>               
        </section>
        
        </>
    )
}

export default ProfileContent;