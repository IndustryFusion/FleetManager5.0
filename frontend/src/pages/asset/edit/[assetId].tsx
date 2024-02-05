import React, { useState, useEffect } from "react";
// import "primereact/resources/primereact.min.css";
// import "primeflex/primeflex.css";
// import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
// import "primeicons/primeicons.css";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { Asset } from "@/interfaces/assetTypes";
import { Dropdown } from "primereact/dropdown";
import { Property, Schema, RelationItem } from "@/interfaces/assetTypes";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { ListBox } from "primereact/listbox";
import "../../../../public/styles/edit-asset.css";
import { MultiSelect } from "primereact/multiselect";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const AssetEdit = () => {
    const router = useRouter();
    const { assetId } = router.query;
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [asset, setAsset] = useState<Record<string, any>>({});
    const [updatedData, setUpdatedData] = useState<Record<string, any>>({});
    const [schema, setSchema] = useState<Schema | null>(null);
    const [focusedFields, setFocusedFields] = useState<{
        [key: string]: boolean;
    }>({});
    const [status, setStatus] = useState('Updated!');
    const [showStatus, setShowStatus] = useState(false);
    const [selectedRelationsList, setSelectedRelationsList] = useState<
    RelationItem[]
  >([]);

  const fetchAsset = async (assetId: string) => {
    try {
      const response = await axios.get(API_URL + `/asset/${assetId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      });
      const assetData: Asset|any = response.data;

      // Flatten and format the data structure for the form
      const flattenedData = Object.keys(assetData).reduce((acc: any, key) => {
        if (key.includes("http://www.industry-fusion.org/schema#")) {
          const newKey = key.replace(
            "http://www.industry-fusion.org/schema#",
            ""
          );
          if (newKey.includes("has")) {
            acc[newKey] = assetData[key].object;
          } else {
            acc[newKey] = assetData[key].value;
            
          }
        } else {
          acc[key] = assetData[key];
        }
        console.log("fetchedData", acc);
        return acc;
        
      }, {} as Asset);
      return flattenedData;
    } catch (error) {
      console.error("Error fetching asset data:", error);
    }
  };

  const fetchData = async () => {
    try {
      console.log("asset id inside fetch data ", assetId);
      if (assetId) {
        const asset : Asset|any = await fetchAsset(assetId);
        if (asset) {
          setFormData(asset);
          setAsset(asset);
          const templateId= asset["https://industry-fusion.org/base/v0.1/templateId"]["value"];
          
          /* Buffer.from(
              asset.type,
              'base64',
            ).toString('utf-8');
            
            console.log("templateId", Buffer.from(templateId).toString('base64')); */
          const response = await fetch(API_URL + `/templates/${templateId}`);
          console.log("response ", response);
          const data = await response.json();
          if (data && Array.isArray(data)) {
            const template = data[0];
            setSchema(template);
          } else {
            console.error("Fetched data is not in the expected format");
          }
        }
      } else {
        console.error("Cannot able to get asset Id");
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

    
    
    const handleSubmit = async (event: any) => {
      event.preventDefault();
      if(Object.keys(updatedData).length > 0) {
        const payload = Object.keys(updatedData).reduce((acc: any, key: any) => {
          acc[`http://www.industry-fusion.org/schema#${key}`] = {
          type: "Property",
          value: updatedData[key],
        };
        return acc;
      }, {});
      console.log("payload ", payload);
      try {
        const response = await axios.patch(
          API_URL + `/asset/${formData.id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        console.log("response ", response);
        if (response.data.success) {
          setStatus("Updated");
          setShowStatus(true);
          setUpdatedData({});
        } else {
          setStatus(response.data.message);
        }
      } catch (error) {
        console.error("Error updating asset:", error);
      }
    } else {
      setShowStatus(true);
      setStatus("update data before submission");
    }
  };

  const handleBlur = (key: string) => {
    setFocusedFields({ ...focusedFields, [key]: false });
  };

  const handleUpload = async (file: any, key: any) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(API_URL + "/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        setUpdatedData({ ...updatedData, [key]: result.url });
      } else {
        const text = await response.text();
        setUpdatedData({ ...updatedData, [key]: text });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleFocus = (key: string) => {
    setFocusedFields({ ...focusedFields, [key]: true });
  };

  const handleChange = (key: string, value: any) => {
    if (key === "file") {
      const file = value as File;
      setFile(file);
    } else {
      setFormData({ ...formData, [key]: value });
      setUpdatedData({ ...updatedData, [key]: value });
    }
    console.log("updatedData ", updatedData);
  };

  const renderField = (key: string, property: Property) => {
    const fieldClass = "col-4";
    const value = formData[key];

    if (key.includes("has")) {
      return;
    }

    return (
      <>
        {property.title === "Asset Status" ? null : (
          <div className={`p-field  ${fieldClass} mt-3`} key={key} style={{}}>
            {property.type === "string" && (
              <div key={key} className="p-field">
                <label htmlFor={key}>{property.title}</label>
                <br />
                <InputText
                  id={key}
                  value={value || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                  readOnly={property.readOnly}
                  className="p-inputtext-lg mt-2 input-border"
                  style={{ width: "90%" }}
                />
              </div>
            )}
            {property.type === "number" && (
              <div key={key} className="p-field">
                <label htmlFor={key}>{property.title}</label>
                <br />
                <InputNumber
                  id={key}
                  value={value || ""}
                  onChange={(e) => handleChange(key, e.value)}
                  className="p-inputtext-lg mt-2 input-border"
                  style={{ width: "90%" }}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                  readOnly={property.readOnly}
                />
              </div>
            )}
            {property.type === "array" && (
              <div key={key} className="p-field">
                <label htmlFor={key}>{property.title}</label>
                <br />
                <Dropdown
                  id={key}
                  value={value}
                  options={property.enum}
                  onChange={(e) => handleChange(key, e.value)}
                  className="p-inputtext-lg mt-2 input-border"
                  style={{ width: "90%" }}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                />
              </div>
            )}

            {/* {property.type !== "object" && (
                <label htmlFor={key} style={{ fontWeight: "5px" }}>
                  {property.title}
                </label>
              )} */}

            {property.type === "object" && (
              <>
                <label
                  htmlFor={key}
                  style={{
                    fontSize: "0.9em",
                  }}
                  className=""
                >
                  {property.title}
                </label>
                {property.contentMediaType && (
                  <FileUpload
                    name={key}
                    mode="basic"
                    accept={property.contentMediaType}
                    maxFileSize={1000000}
                    onSelect={(e) => handleUpload(e.files[0], key)} // Pass key as well
                    className="p-inputtext-lg "
                    style={{
                      background: "",
                      width: "90% !important",
                      marginTop: "1%",
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </>
    );
  };

    
    return (
        <div className="ml-5 p-3">
            <div className="header">
              {" "}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Button
                    icon="pi pi-arrow-circle-left"
                    className="p-button-rounded p-button-secondary p-button-sm"
                    onClick={() => router.push('/asset-overview')}
                />
              </div>
              <p className="hover" style={{ fontWeight: "bold", fontSize: "1.9em" }}>
                  Edit Asset
              </p>
            </div>
    
            <div>
              <form
                className="p-fluid grid flex shadow-lg"
                onSubmit={handleSubmit}
                >
                {schema && schema.properties &&
                  Object.keys(schema.properties).map((key) =>
                  renderField(key, schema.properties[key])
                )}
                
                
              
                <Button
                  label="Submit"
                  type="submit"
                  onSubmit={handleSubmit}
                  className="border-none mt-5 p-2 w-1  ml-6"
                />
                {showStatus && <p className="font-semibold" style={{ paddingTop: '30px', marginLeft: '20px', fontWeight: 'bold', color: '#008000' }}>{status}</p>}
              </form>
            </div>
        </div>
    );
}

export default AssetEdit;
