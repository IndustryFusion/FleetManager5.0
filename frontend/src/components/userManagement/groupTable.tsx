import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@/utility/toast";
import { Toast } from "primereact/toast";
import { RiDeleteBinLine } from "react-icons/ri";
import "../../../public/styles/asset-overview.css";

const FLEET_MANAGER_BACKEND_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

const GroupTable: React.FC<any> = ({ groups, setGroups, filters,setGroupsCount,accessgroupIndexDb }) => {
  const toast = useRef<Toast>(null);
  const companyIfricId = useSelector((state: RootState) => state.auth.companyIfricId);

  const textEditor = (options:any) => {
    const { rowData, field, value, editorCallback } = options;
    let disableValue = false;
    if(rowData.group_name == 'admin' || rowData.group_name == 'read_only'){
      disableValue = true;
    }
    const handleTriStateChange = () => {
      const newValue = value === true ? false : true;
      editorCallback(newValue);
    };  
    return (
      <>
        {field === "group_name" ? (
          <InputText
            type="text"
            value={value}
            disabled={disableValue}
            onChange={(e) => editorCallback(e.target.value)}
          />
        ) : (
          <TriStateCheckbox
          className="group-checkbox"
            value={value}
            onChange={handleTriStateChange}
          />
        )}
      </>
    );
  };

  const handleUpdate = async(value) => {
    try {
      if('_id' in value) {
        const response = await axios.patch(`${FLEET_MANAGER_BACKEND_URL}/auth/update-access-group/${value['_id']}`,
          value,
          {
            headers: {
              "Content-Type": "application/json",
            },
        })
        if(response.data) {
          return true;
        }
      } else {
        const response = await axios.post(`${FLEET_MANAGER_BACKEND_URL}/auth/create-access-group/${companyIfricId}`,
          value,
          {
            headers: {
              "Content-Type": "application/json",
            },
        })
        if(response.data) {
          return true;
        }
      }
    } catch(err) {
      showToast(toast, "error", "Error", "Failed to update Access group");
      return false;
    }
  }

  const onRowEditComplete = async(e) => {
    let group = [...groups];
    let { newData, index } = e;
    group[index] = newData;
    const response = await handleUpdate(newData);
   if(response){
    setGroups(group);
   }
    if(response && (newData?.group_name === groups[groups.length-1]?.group_name)) { 
      fetchCompanyAccess()   
    }
  };

  const groupsColumnConfig = [
    {
      field: "group_name",
      header: "Name",
      body: (rowData: any) => <span className="group-name-text">{rowData.group_name}</span>,
      columnKey: "groupName",
      editor: (options:any) => textEditor(options),
    },
    {
      field: "create",
      header: "Create",
      body: (rowData: any) => (
        <span>
          {rowData.create ? (
            <img src="/group-checkbox.svg" alt="true-icon" />
          ) : (
            <img 
            className="false-icon-img"
            src="/close-icon-sm.png" alt="false-icon" />
          )}
        </span>
      ),
      columnKey: "create",
      editor: (options:any) => textEditor(options),
    },
    {
      field: "read",
      header: "Read",
      body: (rowData: any) => (
        <span >
          {rowData.read ? (
            <img src="/group-checkbox.svg" alt="true-icon" />
          ) : (
            <img
            className="false-icon-img"
            src="/close-icon-sm.png" alt="false-icon" />
          )}
        </span>
      ),
      columnKey: "read",
      editor: (options:any) => textEditor(options),
    },
    {
      field: "update",
      header: "Update",
      body: (rowData: any) => (
        <span>
          {rowData.update ? (
            <img src="/group-checkbox.svg" alt="true-icon" />
          ) : (
            <img 
            className="false-icon-img"
            src="/close-icon-sm.png" alt="false-icon" />
          )}
        </span>
      ),
      columnKey: "update",
      editor: (options:any) => textEditor(options),
    },
    {
      field: "delete",
      header: "Delete",
      body: (rowData: any) => (
        <span>
          {rowData.delete ? (
            <img src="/group-checkbox.svg" alt="true-icon" />
          ) : (
            <img
            className="false-icon-img"
            src="/close-icon-sm.png" alt="false-icon" />
          )}
        </span>
      ),
      columnKey: "delete",
      editor: (options:any) => textEditor(options),
    },
    {
      rowEditor: true,
      width:"100px"

    },
    {
      field:"",
      header:"",
      body:(rowData:any) => {
        return rowData?.group_name === "admin" || rowData?.group_name === "read_only" ? null : 
        (
        <button
          className="btn"
          onClick={() => handleDelete(rowData?._id, rowData?.group_name)}
        >
          <RiDeleteBinLine />
        </button>)
        },
      columnKey: "delete group",
    }
  ];

  const fetchCompanyAccess = async() => {
    try {
      const response = await axios.get(`${FLEET_MANAGER_BACKEND_URL}/auth/get-company-access-group/${companyIfricId}`,{
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(response.data.length > 0) {
        setGroups(response.data);
      }
    } catch(err) {
      showToast(toast, "error", "Error", "Failed to fetch Company Access group");
    }
  }

  const handleDelete = async(id:string, name:string)=>{;
  if(id === undefined){
    const updatedGroups = groups.filter((group:({string:string}) )=>group?.group_name !== name); 
    setGroups(updatedGroups);
    setGroupsCount(updatedGroups?.length)
    showToast(toast, "success", "Success", "Deleted Company Access group");
  }else{
    try{
      const response = await axios.delete(`${FLEET_MANAGER_BACKEND_URL}/auth/delete-access-group/${id}`,{
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(response?.data?.acknowledged && response?.status === 200){
        const updatedGroups = groups.filter((group:({string:string}) )=>group?._id !== id);
        setGroups(updatedGroups);
        setGroupsCount(updatedGroups?.length)
        showToast(toast, "success", "Success", "Deleted Company Access group");
      }
    }catch(error){
      console.error(error)
      showToast(toast, "error", "Error", "Failed to delete Company Access group");
    }
  }
 }

  useEffect(() => {
    fetchCompanyAccess();
  },[])

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={groups}
        className="groups-table"
        tableStyle={{
          width: "100%",
          overflow: "auto",
          padding: "10px 10px 10px 24px",
        }}
        editMode="row"
        onRowEditComplete={onRowEditComplete}
        filters={filters}
        globalFilterFields={['group_name']}
      >
        {groupsColumnConfig.map((col) => (
          <Column key={col.columnKey} {...col} />
        ))}
      </DataTable>
    </>
  );
};

export default GroupTable;
