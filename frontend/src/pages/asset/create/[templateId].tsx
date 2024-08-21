// 
// Copyright (c) 2024 IB Systems GmbH 
// 
// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 
// 
//   http://www.apache.org/licenses/LICENSE-2.0 
// 
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License. 
// 

import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import "../../../../public/styles/create-form.css";
import { useRouter } from "next/router";
import axios from "axios";
import { ListBox } from "primereact/listbox";
import HorizontalNavbar from "../../../components/horizontal-navbar";
import { Card } from "primereact/card";
import { Toast, ToastMessage } from "primereact/toast";
import { Property, Schema, RelationItem, DynamicFormSchema, FileLoadingState } from "@/interfaces/assetTypes";
import { BlockUI } from 'primereact/blockui';
import Cookies from "js-cookie";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import Footer from "@/components/footer";
const API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import RealtimeParameters from "@/components/realtime-parameter";
// Initialize the state with a more specific type

const CreateAssetForm: React.FC = () => {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [focusedFields, setFocusedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [filterOptions, setFilterOptions] = useState<any[]>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [selectedRelationsList, setSelectedRelationsList] = useState<
    RelationItem[]
  >([]);
  const [selectedRelations, setSelectedRelations] = useState([]);
  const [uploadedFileKeys, setUploadedFileKeys] = useState<string[]>([]);
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [fileLoading, setFileLoading] = useState<FileLoadingState>({});
  const toast = useRef<Toast>(null);
  const [assetType, setAssetType] = useState<string>();
  const [assetCategory, setAssetCategory] = useState<string>();
  const [relationsOptions, setRelationsOptions] = useState<RelationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currenTemplateID, setCurrentTemplateID] = useState<string | any>();
  const [validateAsset, setValidateAsset] = useState({
    "iffs:product_name": false,
    "iffs:asset_manufacturer_name": false,
    "iffs:asset_serial_number": false
  });
  const [iffrProperties, setIffrProperties] = useState<string[]>([]);
  const { t } = useTranslation(['button', 'asset']);

  useEffect(() => {
    const updatedList = selectedRelations.map((relation) => {
      const foundOption = relationsOptions.find(
        (option) => option.value === relation
      );
      return {
        label: foundOption ? foundOption.label : relation,
        value: relation,
      };
    });

    setSelectedRelationsList(updatedList);

  }, [selectedRelations]);

  const showToast = (severity: ToastMessage['severity'], summary: string, message: string) => {
    toast.current?.show({ severity: severity, summary: summary, detail: message, life: 8000 });
  };

  const fetchData = async (templateId: string | any) => {
    if (templateId) {
      try {
        const response = await fetch(
          API_URL + `/templates/${templateId}`
        );
        const data = await response.json();
        setAssetType(data[0].title);
        const assetCategoryType = data[0].title;
        const assetCategoryTypeXX = assetCategoryType.replace(" template", "");
        setAssetCategory(assetCategoryTypeXX);
        if (data && Array.isArray(data)) {
          const template = data[0];
          const allKeys = Object.keys(template?.properties);
          const iffrKeys = allKeys.filter(key => key.startsWith("iffr:")).map(key => key.slice(5));

          setIffrProperties(iffrKeys)
          setSchema(template);
          setFormData((currentFormData) => ({
            ...currentFormData,
            type: template.type,
            title: template.title,
            description: template.description,
          }));

          const hasRelations: string[] = Object.values(template.properties)
            .filter(
              (property: Property | unknown) =>
                typeof property === "object" &&
                property !== null &&
                property.hasOwnProperty("relationship") &&
                typeof (property as Property).relationship === "string"
            )
            .map(
              (property: Property | unknown) =>
                (property as Property).relationship
            )
            .flat();

            const filterOptions = hasRelations.map((relation) => ({
              label:relation.split('/').pop(),
              value: relation
            }));

          setFilterOptions(filterOptions);
        } else {
          showToast('error', 'Error', 'Fetched data is not in the expected format');
          console.error("Fetched data is not in the expected format");
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error("Error response:", error.response?.data.message);
          showToast('error', 'Error', 'Error fetching template');
        } else {
          console.error("Error:", error);
          showToast('error', 'Error', error);
        }
      }
    }
  };

  useEffect(() => {
    if (Cookies.get("login_flag") === "false") { router.push("/login"); }
    else {
      if (router.isReady) {
        const { templateId } = router.query;
        fetchData(templateId);
        setCurrentTemplateID(templateId);
        setLoading(false);
      }
    }
  }, [router.isReady]);

  //onChange removing error text
  const validateInput = (key: string) => {
    const assetKeys = Object.keys(validateAsset);
    for (let assetKey of assetKeys) {
      if (assetKey === key) {
        setValidateAsset(validateAsset => ({ ...validateAsset, [key]: false }));
      }
    }
  }

  const handleFocus = (key: string) => {
    setFocusedFields({ ...focusedFields, [key]: true });
  };
  const handleBlur = (key: string) => {
    setFocusedFields({ ...focusedFields, [key]: false });
  };
  const handleChange = (key: string, value: any) => {
    validateInput(key)
    const fieldType = schema?.properties[key]?.type;
    // Update formData with both value and type
    setFormData({ ...formData, [key]: { value, type: fieldType } });
    if (key === "file") {
      const file = value as File;
      setFile(file);
    } else {
      setFormData({ ...formData, [key]: value });
    }

  };
  const handleUpload = async (file: any, key: any) => {
    if (!file) return;
    setFileLoading((prevLoading: any) => ({ ...prevLoading, [key]: true }));
    const formFileData = new FormData();
    formFileData.append("file", file);

    try {
      const response = await fetch(API_URL + "/file", {
        method: "POST",
        body: formFileData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        // Store the URL in the formData state
        setFormData({ ...formData, [key]: result.url });
        // track uploaded file key
        setUploadedFileKeys((prevKeys) => [...prevKeys, key]);
      } else {
        const text = await response.text();
        setFormData({ ...formData, [key]: text });
        // Track uploaded file key
        setUploadedFileKeys((prevKeys) => [...prevKeys, key]);
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      showToast('error', 'Error uploading file', error);
    } finally {
      setFileLoading((prevLoading: any) => ({ ...prevLoading, [key]: false }));
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    // Extract type, title, and description
    const { type, title, description, ...properties } = formData;
    const currentDate = moment().format('DD.MM.YYYY HH:mm:ss');
    properties['iffs:asset_category'] = assetCategory;
    properties['iffs:creation_date'] = currentDate;
    // Structure the data for submission
    const submissionData = {
      type,
      title,
      description,
      properties: { ...properties }
    };

    const assetKeys = Object.keys(validateAsset);
    let checkFlag = false;
    for (let assetKey of assetKeys) {     
      if (submissionData?.properties[assetKey] === undefined || submissionData?.properties[assetKey] === "") {
        setValidateAsset(validateAsset => ({ ...validateAsset, [assetKey]: true }));
        checkFlag = true;
      }
    }
    if (checkFlag) {
      showToast('error', "Error", "Please fill all required fields")
    }
    else {
      try {
        const response = await axios.post(
          API_URL + `/asset/${currenTemplateID}`,
          submissionData,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        setIsFormSubmitted(true); // Set the flag to true on successful submission
        if (response.data.success) {
          showToast('success', 'Added Successfully', 'new asset added successfully')
          router.push("/asset-overview");
        } else {
          showToast('warn', 'Warning', response.data.message);
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error("Error response:", error.response?.data);
          showToast('error', 'Error', error.response?.data.message);
        } else {
          console.error("Error:", error);
          showToast('error', 'Error', error);
        }
      }
    }
  };

  const handleCancel = (event: any) => {
    event.preventDefault();
    router.push("/templates");
  };

  const handleReset = (event: any) => {
    event.preventDefault();
    const newFormData = JSON.parse(JSON.stringify(formData));
    setFileUploadKey((prevKey) => prevKey + 1);
    // Exclude file-related properties from the newFormData
    Object.keys(schema?.properties || {}).forEach((key) => {
      const property = schema?.properties[key];

      if (
        property &&
        typeof property === "object" &&
        property.contentMediaType
      ) {
        if (uploadedFileKeys.includes(key)) {
          newFormData[key] = "";
        } else {
          newFormData[key] = null;
        }
      } else {
        // Reset other non-file properties to an empty string
        if (newFormData.hasOwnProperty(key)) {
          typeof newFormData[key] === "number"
            ? (newFormData[key] = 0)
            : (newFormData[key] = "");
        }
      }
    });
    setFormData(newFormData);
    setSelectedRelationsList([]);
    showToast('success', 'Reset Success', 'Form resetted successfully')
  };



  const renderField = (key: string, property: Property) => {
    const fieldClass = "col-4";
    const value = formData[key];
    if (key.startsWith("iffr:")) {
      return;
    }
    return (
      <div
        key={key}
        className={`p-field  ${fieldClass}  flex flex-column `}
      >
        {property.title === "Asset Status" ? null : (
          <>
            {property.title === "Creation Date" && (
              <div key={key} className="p-field">
                <label className="mb-2" htmlFor={key}>
                  {property.title}
                </label>
                <br />
                <InputText
                  id={key}
                  className="p-inputtext-lg mt-2"
                  style={{ width: "90%", borderRadius: "5px" }}
                  value={moment().format('DD.MM.YYYY HH:mm:ss')}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                  readOnly={property.readOnly}

                />

              </div>)}

            {property.title === "Year of manufacturing" && (
              <div key={key} className="p-field">
                <label className="mb-2" htmlFor={key}>
                  {property.title}
                </label>
                <br />
                <Calendar
                  value={value ? new Date(value) : null}
                  className="p-inputtext-lg mt-2"
                  style={{ width: "90%", borderRadius: "5px" }}
                  view="year"
                  dateFormat="yy"
                  onChange={(e) => {
                    const selectedDate = String(e.value);
                    const date = new Date(selectedDate);
                    const options: Intl.DateTimeFormatOptions = { year: 'numeric' };
                    const formattedDate = date.toLocaleString('en-US', options).replace(/\//g, '.');
                    handleChange(key, formattedDate)
                  }}
                  appendTo="self"

                />
              </div>)}
            {property.title === "Asset Category" && (
              <div key={key} className="p-field">
                <label className="mb-2" htmlFor={key}>
                  {property.title}
                </label>
                <br />
                <InputText
                  id={key}
                  value={assetCategory || ""}
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
            {property.type === "string" && property.title !== "Creation Date" && property.title !== "Asset Category"  && !property.enum && (
              <div key={key} className="p-field">
                <label className="mb-2" htmlFor={key}>
                  {property.title}
                </label>
                <br />
                {
                  property.title === 'IFRIC Template ID' ?
                    (
                      <InputText
                        id={key}
                        value={property.default || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        onFocus={() => handleFocus(key)}
                        onBlur={() => handleBlur(key)}
                        readOnly={true}
                        className="p-inputtext-lg mt-2"
                        style={{ width: "90%" }}
                        placeholder={""}
                      />
                    )
                    : (
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
                    )
                }
                {property.title === "Product Name" && validateAsset["iffs:product_name"] &&
                  <p className="input-invalid-text">Product Name is required</p> }
                {property.title === "Asset Manufacturer Name" && validateAsset["iffs:asset_manufacturer_name"] &&
                  <p className="input-invalid-text">Asset Manufacturer Name is required</p>}
                {property.title === "Serial Number" && validateAsset["iffs:asset_serial_number"] &&
                  <p className="input-invalid-text">Serial Number is required</p>}
              </div>
            )}
            {property.type === "number" && property.title !== "Year of manufacturing" && (
              <div key={key} className="p-field flex flex-column">
                <label htmlFor={key}>{property.title}
                  <span className="ml-1 text-gray-500">({property.unit})</span>
                </label>
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
            {((property.type === "string"  && property.enum ) ||  (property.type =="array" && property.enum) ) && (
              <div key={key} className="p-field">
                <label htmlFor={key}>{property.title}</label>
                <Dropdown
                  id={key}
                  value={value}
                  options={property.enum}
                  onChange={(e) => handleChange(key, e.value)}
                  className="p-inputtext-lg mt-2 asset-dropdown"
                  style={{ width: "90%" }}
                  onFocus={() => handleFocus(key)}
                  appendTo="self"
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
                      chooseLabel={t('asset:uploadFile')}
                    />
                    {fileLoading[key] && <p>Loading...</p>}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };
  if (!schema) return <div>Loading...</div>;

 const renderCard = (title: string, keys: string[]) => {
  return (
    <Card title={title} className="mb-4">
      <div className="flex p-fluid grid shadow-lg">
        {keys.length === 0 ? (
          <p className="ml-2">No Results Found</p>
        ) : (
          keys.map((key) => renderField(key, schema.properties[key]))
        )}
      </div>
    </Card>
  );
};


  const eclassKeys = Object.keys(schema.properties).filter((key) => key.startsWith('eclass'));
  const iffsKeys = Object.keys(schema.properties).filter((key) => key.startsWith('iffs'));

  return (
    <BlockUI blocked={loading}>
      <HorizontalNavbar />
      <Toast ref={toast} />
      <div className="container" style={{ padding: "1rem 1rem 2rem 4rem", zoom: "80%" }}>
        <div>
          <h2 className="hover" style={{ marginTop: "100px" }}>
            {t('asset:createAsset')}
          </h2>
          <h5 style={{ fontWeight: "normal", fontSize: "20px", fontStyle: "italic", color: "#226b11" }}>{assetType} form </h5>
        </div>
        <div className="mb-5">
            <form onSubmit={handleSubmit}>
              <div >
                {renderCard("General Fields", iffsKeys)}
                {renderCard("EClass Fields", eclassKeys)}
              </div>
              <div className="flex">
                <div className="p-field col-8 mt-3 flex flex-column">
                  <label className="relations-label">{t('asset:relations')}</label>
                  {filterOptions.length === 0 ?
                    (<label style={{ fontSize: "15px", marginTop: "10px" }}>{t('asset:noRelation')}</label>) :
                    (<label style={{ fontSize: "15px", marginTop: "10px" }}>{t('asset:addRelation')}</label>)}
                  <ListBox
                    options={filterOptions}
                    optionLabel="label"
                    className="mt-2 p-inputtext-lg list-box-item"
                  />
                </div>
              </div>
              <div className="flex">
                <div className="p-field col-8 mt-3 flex flex-column ">
                  <label htmlFor="" className="mb-2 realtime-label">Realtime Parameter</label>
                  <RealtimeParameters
                    optionsArray={iffrProperties}
                  />
                </div>
              </div>

              <div className="form-btn-container mb-6  flex justify-content-end align-items-center">
                <Button
                  label={t('button:cancel')}
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
                  label={t('button:reset')}
                  className="mr-2 reset-btn"
                  type="button"
                  onClick={handleReset}
                />
                <Button
                  label={t('button:submit')}
                  type="submit"
                  onSubmit={handleSubmit}
                  className="border-none    ml-2 mr-2"
                />
              </div>
            </form>
        </div>
      </div>
      <Footer />
    </BlockUI>
  );
};

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'header',
        'button',
        'placeholder',
        'asset'
      ])),
    },
  }
}

export default CreateAssetForm;