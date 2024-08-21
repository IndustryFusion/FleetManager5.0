import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";

interface Group {
  group_name: string;
  access: string;
}

const GroupManagementTable = ({ userData }) => {
  const [groupData, setGroupData] = useState<Record<string, any>[]>([]);
  const productColumnsConfigs = [
    {
      header: "Group",
      columnKey: "group_name",
      field: "group_name",
    },
    {
      header: "Access to",
      columnKey: "access",
      field: "access",
    },
    {
      header:"Actions",
      body: (rowData:any)=> <i className="pi pi-ellipsis-h" style={{fontSize:"16px", cursor:"pointer", marginLeft:"20px"}}></i>
    }
  ];

  const handleUserData = async() => {
    let finalData: Group[]= [];
    if(userData.length > 0 && userData[0].product_roles.length > 0) {
      userData[0].product_roles.forEach(data => {
        let count = 0;
        userData.forEach(value => {
          if(data == value.user_role){
            count++;
          }
        });
        finalData.push({
          group_name:data,
          access:`${count} product`
        })
      });
      setGroupData(finalData);
    }
  }

  useEffect(() => {
    handleUserData()
  },[userData])
  return (
    <>
      <DataTable
        value={groupData}
        className="  "
        tableStyle={{
          width: "60%",
          overflow: "auto",
          padding: "10px",
          marginBottom: "20px"
        }}
      >
        {productColumnsConfigs.map((col) => (
          <Column key={col.columnKey} {...col} />
        ))}
      </DataTable>
    </>
  );
};

export default GroupManagementTable;
