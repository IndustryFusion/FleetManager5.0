import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import "../../styles/asset-overview.css";
import "../../styles/user-management.css";
import { FilterState } from "@/interfaces/userTypes";
import { ContextMenu } from "primereact/contextmenu";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@/utility/toast";
import { Toast } from "primereact/toast";
import { RiDeleteBinLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";

interface UserTableProps {
  filters: FilterState;
  accessgroupIndexDb:any
  setUsersCount:any
}

interface Product {
  product: string;
  product_roles: string[];
  last_active: string;
  user_role: string;
}

interface User {
  name: string;
  access: string[];
  img: string;
  last_active: string;
  date_added: string;
  status: string;
  id: string;
  email: string;
}

const FLEET_MANAGER_BACKEND_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

const UserTable:React.FC<UserTableProps> = ({filters, accessgroupIndexDb,setUsersCount}) => {
  const cm = useRef(null);
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const companyIfricId = useSelector((state: RootState) => state.auth.companyIfricId);
  const [usersData, setUsersData] = useState<Record<string, any>[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string } | null>(null);

  const menuModel = [
    {
      label: "Settings",
      icon:  <IoSettingsOutline  />
    },
    {
      label: "View Profile",
      icon:<CgProfile />
    },
    {
      label: "Delete",
      disabled: !accessgroupIndexDb || !accessgroupIndexDb.delete,
      icon:  <RiDeleteBinLine />,
      command:()=>{
        if (selectedUser) {
          handleDelete(selectedUser.id);
        } else {
          console.error('No user selected');
        }
      }
    },
  ]

  const handleDelete = async(id:string)=>{
    try{
      const response = await axios.delete(`${FLEET_MANAGER_BACKEND_URL}/auth/delete-company-user/${id}`,{
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(response?.data?.acknowledged && response?.status === 200){
        const updatedUsers = usersData.filter((user:any )=> user?.id !== id);
        setUsersData(updatedUsers)
        setUsersCount(updatedUsers?.length)
        showToast(toast, "success", "Success", "Deleted Company Users");
      }
    }catch(error){
      console.error(error)
      showToast(toast, "error", "Error", "Failed to delete Company Users");
    }
   }

  const handleUserSelect = async(data: any) => {
    router.push({
      pathname: "/user-details",
      query: { 
        userId: data.id 
      }
    });
  }


  const userColumnConfig = [
    {
      selectionMode: "multiple" as "multiple",
      headerStyle: { width: "1rem" },
      columnKey: "userSelectCheckBox",
    },
    {
      field: "name",
      header: <div className="flex gap-1 align-items-center">
              <p className="m-0">Name </p>
              <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
              </div>,
      body: (rowData: any) => {
        return (
          <div className="flex gap-2 align-items-center" onClick={()=> handleUserSelect(rowData)}>
            {rowData && rowData?.img && rowData?.img !== "NULL" ? (
              <img
                src={rowData.img}
                alt="profile-image"
                className="profile-picture"
              />
            ) : (
              <span>No Image</span>
            )}
            <div>
              <p className="m-0 profile-name">{rowData.name}</p>
              <p className="m-0 user-email">{rowData.email}</p>
            </div>
          </div>
        );
      },
      columnKey: "userName",
      sortable:true
    },
    {
      field: "access",
      header: "Access",
      body: (rowData: any) => {
        return rowData.access.map((item: string) => {
          if (item === "admin") {
            return <span  className="admin mr-2  ">{item} </span>;
          } else if (item === "update") {
            return <span className="update mr-2">{item} </span>;
          } else {
            return <span key="item" className=" access-grp mr-2">{item}</span>;
          }
        });
      },
      columnKey: "Access",
    },
    {
      field: "last_active",
      header: <div className="flex gap-1 align-items-center">
      <p className="m-0">Last active </p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
      </div>,
      body: (rowData: any) => <span>{rowData.last_active}</span>,
      columnKey: "LastActive",
      sortable:true
    },
    {
      field: "date_added",
      header: <div className="flex gap-1 align-items-center">
      <p className="m-0">Added</p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
      </div>,
      body: (rowData: any) => <span>{rowData.date_added}</span>,
      columnKey: "DateAdded",
      sortable:true
    },
    {
      header:<div className="flex gap-1 align-items-center">
      <p className="m-0">Status</p>
      <img src="/sort-arrow.svg" alt="sort-arrow-icon" />
      </div>,
      body: (rowData: any) =>{
        return(
          <div className="flex ">
            {rowData.status === "active" ? <div className="active-icon"></div> : <div className="pending-icon"></div>}
             <span className={rowData.status === "active" ? "active-text": "pending-text"}>{rowData.status}</span>
          </div>
        )
      },
      columnKey: "Status",
      sortable:true
    },
    {
        header:"",
        body: (rowData:any)=> <i className="pi pi-ellipsis-v context-menu-icon" style={{fontSize:"12px"}}></i>

    }
  ];

  const fetchUsers = async() => {
    try{
      const response = await axios.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-company-users/${companyIfricId}`,{
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if(response.data.length > 0) {
        const userData: User[] = [];
        for(let i = 0; i < response.data.length; i++) {
          let user: User = {
            name: '',
            access: [],
            img: '',
            last_active: '',
            date_added: '',
            status: '',
            id: response.data[i]['_id'],
            email: response.data[i].user_email
          };
          user.name = response.data[i].user_name;
          const productAccessResponse = await axios.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-user-product-access/${response.data[i]['_id']}`,{
            headers: {
              "Content-Type": "application/json",
            },
          })
          user.access = [];
          if(productAccessResponse.data.length > 0) {
            for(let j = 0; j < productAccessResponse.data.length; j++) {
              let accessGroupData = await axios.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-access-group/${productAccessResponse.data[j].access_group_id}`,{
                headers: {
                  "Content-Type": "application/json",
                },
              });
              if(Object.keys(accessGroupData.data).length > 0) {
                accessGroupData = accessGroupData.data;
                for (const key in accessGroupData) {
                  if(user.access.length == 3 || (user.access.length > 0 && user.access[0] == 'admin')) {
                    break;
                  }
                  if(key == 'group_name' && accessGroupData[key] == 'admin') {
                    user.access.push(accessGroupData[key]);
                    break;
                  } else if(accessGroupData[key] == true && !user.access.includes(key)){
                    user.access.push(key);
                  }
                }
              }
            }
          }
          user.img = "/profile-1.jpg";
          user.last_active = "Mar 4, 2021";
          user.date_added = "July 4, 2020";
          user.status ="active";
          userData.push(user);
        }
        setUsersData(userData);
      }
    } catch(err) {
      showToast(toast, "error", "Error", "Failed to fetch Company Users");
    }
  }
  
  useEffect(() => {
    fetchUsers();
  },[])

  return (
    <>
     <Toast ref={toast} />
     <ContextMenu
      model={menuModel}
      ref={cm}
      />
      <DataTable
        value={usersData}
        className="userdata-table"
        tableStyle={{
          width: "100%",
          overflow: "auto",
          padding: "10px 10px 10px 24px",
        }}
        selectionMode="multiple"
        filters={filters}
        globalFilterFields={['name','email','date_added','last_active','status']}
        onContextMenuSelectionChange={(e) => setSelectedUser(e.value)}
        onContextMenu={(e) => cm.current.show(e.originalEvent)}
      >
        {userColumnConfig.map((col) => (
          <Column key={col.columnKey} {...col} />
        ))}
        
      </DataTable>
    </>
  );
};

export default UserTable;
