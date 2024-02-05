import React, { useState, useEffect, useRef  } from "react";
// import "primereact/resources/primereact.min.css";
// import "primeflex/primeflex.css";
// import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
// import "primeicons/primeicons.css";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { Asset } from "@/interfaces/assetTypes";
import { Dropdown } from "primereact/dropdown";
import { Property, Schema, RelationItem, FileLoadingState } from "@/interfaces/assetTypes";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { ListBox } from "primereact/listbox";
import "../../../../public/styles/edit-asset.css";
import { Card } from "primereact/card";
import { BlockUI } from 'primereact/blockui';
import HorizontalNavbar from "../../../components/horizontal-navbar";
import { useMountEffect } from 'primereact/hooks';
import { Messages } from 'primereact/messages';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const AssetEdit = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [asset, setAsset] = useState<Record<string, any>>({});
  const [updatedData, setUpdatedData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<Schema | null>(null);
  const [focusedFields, setFocusedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [status, setStatus] = useState('Data Successfully Updated!');
  const [showStatus, setShowStatus] = useState(false);
  const [selectedRelationsList, setSelectedRelationsList] = useState<
    RelationItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assetType, setAssetType] = useState<string>();
  const [fileLoading, setFileLoading] = useState<FileLoadingState>({});
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const msgs = useRef<Messages>(null);

  useEffect(() => {
    if (router.isReady) {
      const { assetId } = router.query;
      fetchData(assetId);
      setLoading(false);
    }
  }, [router.isReady]);

  useMountEffect(() => {
    msgs.current?.clear();
    msgs.current?.show({ sticky: true, life: 1000, severity: 'success', summary: 'Success', detail: 'Data Updated Succesfully ', closable: true });
});


  const fetchAsset = async (assetId: string) => {
    try {
      const response = await axios.get(API_URL + `/asset/${assetId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      });
      const assetData: Asset | any = response.data;

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

  const fetchData = async (assetId: any) => {
    try {
      console.log("asset id inside fetch data ", assetId);
      if (assetId) {
        const asset: Asset | any = await fetchAsset(assetId);
        if (asset) {
          setFormData(asset);
          setAsset(asset);
          const templateId = btoa(asset.type);
          const templateName = (asset.type.replace("https://industry-fusion.org/types/v0.1/", "")).toLowerCase();
          setAssetType(templateName);
          console.log("templateId", templateName);
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

  

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (Object.keys(updatedData).length > 0) {
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
          setStatus("Data Updated Succesfully ");
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
      setStatus("You have not edited any field");
    }
  };

  const handleCancel = (event: any) => {
    event.preventDefault();
    router.push("/asset-overview");
  };

  const handleReset = (event: any) => {
    event.preventDefault();
    setFormData(asset);
    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.logo_manufacturer = formData.logo_manufacturer;
    newFormData.product_icon = formData.product_icon;
    newFormData.ce_marking = formData.ce_marking;
    newFormData.documentation = formData.documentation;

    setFileUploadKey((prevKey) => prevKey + 1);
    
  };


  const handleBlur = (key: string) => {
    setFocusedFields({ ...focusedFields, [key]: false });
  };


  const handleUpload = async (file: any, key: any) => {
    if (!file) return;
    setFileLoading((prevLoading: any) => ({ ...prevLoading, [key]: true }));

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
    finally {
      setFileLoading((prevLoading: any) => ({ ...prevLoading, [key]: false }));
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

  const renderField = (id: string, key: string, property: Property) => {
    const fieldClass = "col-4";
    const value = formData[key];

    if (key.includes("has")) {
      return;
    }

    return (
      <>
        {property.title === "Asset Status" ? null : (

          <div
            className={`p-field  ${fieldClass}  flex flex-column `}
            key={key}
          >

            {property.type === "string" && (
              <div key={key} className="p-field">
                <label className="mb-2" htmlFor={key}>
                  {property.title}
                </label>
                <br />
                <InputText
                  id={key}
                  value={value || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                  readOnly={property.readOnly}
                  className="p-inputtext-lg mt-2"
                  style={{ width: "90%" }}
                  placeholder={""}
                />
              </div>
            )}
            {property.type === "number" && (
              <div key={key} className="p-field flex flex-column">
                <label htmlFor={key}>{property.title}</label>
                <InputNumber
                  id={key}
                  value={value || ""}
                  onChange={(e) => handleChange(key, e.value)}
                  className="p-inputtext-lg mt-2"
                  style={{ width: "90%" }}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                  readOnly={property.readOnly}
                  placeholder={"0"}
                />
              </div>
            )}
            {property.type === "array" && (
              <div key={key} className="p-field">
                <label htmlFor={key}>{property.title}</label>
                <Dropdown
                  id={key}
                  value={value}
                  options={property.enum}
                  onChange={(e) => handleChange(key, e.value)}
                  className="p-inputtext-lg mt-2"
                  style={{ width: "90%" }}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                />
              </div>
            )}

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
                  <div>
                    <FileUpload
                      key={fileUploadKey}
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
                      chooseLabel="Upload File"
                    />
                    {fileLoading[key] && <p>Loading...</p>}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </>
    );
  };


  return (
    <BlockUI blocked={loading}>
      <HorizontalNavbar />
      <div style={{ padding: "1rem 1rem 2rem 3rem", zoom:"80%" }}>
        <div className="header">
          <p className="hover" style={{ fontWeight: "bold", fontSize: "1.9em", marginTop: "80px"  }}>
            Edit Asset
          </p>
          <h5 style={{ fontWeight: "normal", fontSize: "20px", fontStyle: "italic", color:"#226b11" }}>{assetType} form --  {asset.id}</h5>
        </div>

        <div>
          <Card className="border-gray-500 border-1 border-round-lg">
            
            <form
              className="p-fluid grid flex shadow-lg"
              onSubmit={handleSubmit}
            >
             <div className=" flex p-fluid grid  shadow-lg">
              {schema && schema.properties &&
                Object.keys(schema.properties).map((key) =>
                  renderField(asset.id, key, schema.properties[key])
                )}
              </div> 
                <div className="flex">
                <div className="p-field col-13 mt-3 flex flex-column">
                  <label className="relations-label">Relations</label>
                  <label style={{ fontSize: "15px", marginTop: "10px" }}> Relations can be added in Factory Manager.</label>
                </div>
              </div>
              <div className="p-3 flex justify-content-end align-items-center" 
                    style={{marginLeft:'calc(100vw - 20%)'}}>
                <Button
                  label="Cancel"
                  severity="danger"
                  outlined
                  className="mr-2"
                  type="button"
                  onClick={handleCancel}
                />
                <Button
                  severity="secondary"
                  text
                  raised
                  label="Reset"
                  className="mr-2"
                  type="button"
                  onClick={handleReset}
                />
                <Button
                  label="Submit"
                  type="submit"
                  onSubmit={handleSubmit}
                  className="border-none    ml-2 mr-2"
                />
                {showStatus && <p className="font-semibold" style={{ paddingTop: '30px', marginLeft: '20px', fontWeight: 'bold', color: '#008000' }}>{status}</p>}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </BlockUI>
  );
}

export default AssetEdit;
