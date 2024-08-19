import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";

interface AddUserTable{
  hideColumn ?: boolean;
  tableWidth ?: string;
  userData: Record<string, any>[];
  saveUserData: (data: any) => void;
}

const AddUserTable:React.FC<AddUserTable> =({hideColumn, tableWidth, userData, saveUserData})=>{

   const productColumnsConfigs = [
    {
    header:"Product",
    columnKey:"product",
    field:"product"
    },
    {
      header:"Last active",
      columnKey:"last_active",
      field:"last_active",
     hide:hideColumn
    },
    {
    header:"Product roles",
    columnKey:"product_roles",
    field:"product_roles",
    body:(rowData:any)=>{
      const options = rowData.product_roles.map(role => ({ name: role, product: rowData.product }));
      const defaultValue = rowData.user_role.length > 0 ? { name: rowData.user_role, product: rowData.product } : options[0];
     return(
     <div className="  product-dropdown">
      <Dropdown 
        value={defaultValue}
        options={options}
        onChange={(e) => handleSelectDropDown(e.value)}
        optionLabel="name" 
      />
      <img 
       className="dropdown-icon-img"
       src="/dropdown-icon.svg" alt="dropdown-icon" />
     </div>
     )
    }
    },
    {
      header:"Actions",
      body: (rowData:any)=> <i className="pi pi-ellipsis-h" style={{fontSize:"16px", cursor:"pointer", marginLeft:"20px"}}></i>
    }
   ] 

   const handleSelectDropDown = async(value) => {
    const productValues = [ ...userData ];
    productValues.forEach(data => {
      if(data.product == value.product) {
        data.user_role = value.name;
      }
    })
    saveUserData(productValues);
   }

    return(
        <>
        <DataTable
        value={userData}
        className="   "
        tableStyle={{
          width: tableWidth,
          overflow: "auto",
          padding: "10px",
          marginBottom: "20px"
        }}
      >
        {productColumnsConfigs.map((col) => (
          !col.hide && <Column key={col.columnKey} {...col} />
        ))}
        
      </DataTable>
        </>
    )

}

export default AddUserTable;