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
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { Asset } from "@/interfaces/assetTypes";
import { Dropdown } from "primereact/dropdown";
import { Property, Schema, RelationItem, FileLoadingState } from "@/interfaces/assetTypes";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import "../../../../public/styles/edit-asset.css";
import { Card } from "primereact/card";
import { BlockUI } from 'primereact/blockui';
import HorizontalNavbar from "../../../components/horizontal-navbar";
import { useMountEffect } from 'primereact/hooks';
import { Messages } from 'primereact/messages';
import Cookies from "js-cookie";
import { Toast, ToastMessage } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import Footer from "@/components/footer";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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
  const [dynamicUrl, setDynamicUrl] = useState<string>('');
  const [fileLoading, setFileLoading] = useState<FileLoadingState>({});
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [validateAsset, setValidateAsset] = useState({
    product_name: false,
    asset_manufacturer_name: false,
    asset_serial_number: false
  })
  const msgs = useRef<Messages>(null);
  const toast = useRef<Toast>(null);
  const { t } = useTranslation(['button','asset']);

  useEffect(() => {
    if (Cookies.get("login_flag") === "false") { router.push("/login"); }
    else {
      if (router.isReady) {
        const { assetId } = router.query;
        fetchData(assetId);
        setLoading(false);
      }
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
        if (key.includes("/")) {
          const newKey = key.split('/').pop() || '';
          setDynamicUrl(key.split(newKey)[0]);
          if (newKey.includes("has")) {
            acc[newKey] = assetData[key].object;
          } else {
            acc[newKey] = assetData[key].value;
          }
        } else {
          acc[key] = assetData[key];
        }
        return acc;

      }, {} as Asset);
      return flattenedData;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data.message);
        showToast('error', 'Error', 'Error fetching asset data');
      } else {
        console.error("Error:", error);
        showToast('error', 'Error', error);
      }
    }
  };

  const fetchData = async (assetId: any) => {
    try {
      if (assetId) {
        const asset: Asset | any = await fetchAsset(assetId);
        if (asset) {
          setFormData(asset);
          setAsset(asset);
          const templateId = btoa(asset.type);
          const templateName = (asset.type.split("/").pop()).toLowerCase();
          setAssetType(templateName);
          const response = await fetch(API_URL + `/templates/${templateId}`);
          const data = await response.json();
          if (data && Array.isArray(data)) {
            const template = data[0];
            setSchema(template);
          } else {
            console.error("Fetched data is not in the expected format");
            showToast('error', 'Error', "Fetched data is not in the expected format")
          }
        }
      } else {
        console.error("Cannot able to get asset Id");
        showToast('error', 'Error', 'Cannot able to get asset Id');
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
  };

  const showToast = (severity: ToastMessage['severity'], summary: string, message: string) => {
    toast.current?.show({ severity: severity, summary: summary, detail: message, life: 8000 });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const assetKeys = Object.keys(validateAsset);
    let checkFlag = false;
    for (let assetKey of assetKeys) {
      if (formData[assetKey] === "") {
        setValidateAsset(validateAsset => ({ ...validateAsset, [assetKey]: true }));
        checkFlag = true;
      }
    }
    if (checkFlag) {
      showToast('error', "Error", "Please fill all required fields")
    } else {
      if (Object.keys(updatedData).length > 0) {
        try {
          const response = await axios.patch(
            API_URL + `/asset/${formData.id}`,
            updatedData,
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              withCredentials: true,
            }
          );
          if (response.data.success) {
            showToast('success', 'Edited Successfully', 'data updated succesfully');
            router.back();
          } else {
            showToast('warn', 'Warning', response.data.message);
          }
        } catch (error: any) {
          console.error("Error updating asset:", error);
          showToast('error', 'Error', error);
        }
      } else {
        showToast('info', 'Info', "you have not edited any field");
      }
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

    const assetKeys = Object.keys(validateAsset);
    for (let assetKey of assetKeys) {
      if (newFormData[assetKey] === "") {
        setValidateAsset(validateAsset => ({ ...validateAsset, [assetKey]: false }));
      }
    }
    setFileUploadKey((prevKey) => prevKey + 1);
    showToast('success', 'Reset Success', 'Form resetted successfully')
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
        setUpdatedData({ ...updatedData, [`${dynamicUrl}${key.split(':').pop()}`]: result.url });
      } else {
        const text = await response.text();
        setUpdatedData({ ...updatedData, [`${dynamicUrl}${key.split(':').pop()}`]: text });
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      showToast('error', 'Error', error);
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
      setFormData({ ...formData, [`${key.split(':').pop()}`]: value });
      setUpdatedData({ ...updatedData, [`${dynamicUrl}${key.split(':').pop()}`]: value });
    }
  };

  const handleFileLabel = (value: any) => {
    if (value !== null && value !== 'NULL') {
      if (value && (typeof value == 'string') && (value.includes('png') || value.includes('jpg') || value.includes('jpeg') || value.includes('.pdf'))) {
        return value.split('/').pop();
      }
    } else {
      return t('asset:uploadFile');
    }
  };

  const renderField = (id: string, key: string, property: Property) => {
    const fieldClass = "col-4";
    const checkKey = key.includes(':') ? key.split(':').pop() : key;
    const value = checkKey ? formData[checkKey] : '';

    if (key.includes("has")) {
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

            {property.type === "string" && property.title !== "Creation Date" && (
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
                {property.title === "Product Name" && validateAsset.product_name &&
                  <p className="input-invalid-text">Product Name is required</p>}
                {property.title === "Asset Manufacturer Name" && validateAsset.asset_manufacturer_name
                  && <p className="input-invalid-text">Asset Manufacturer Name is required</p>}
                {property.title === "Serial Number" && validateAsset.asset_serial_number &&
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
                  value={(value && value != 222) ? value : ""}
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
                  className="p-inputtext-lg mt-2 asset-dropdown"
                  style={{ width: "90%" }}
                  appendTo="self"
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
                        height: "20px",
                      }}
                      chooseLabel={handleFileLabel(value)}
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
  
  
const renderCard = (title: string, keys: string[]) => {
  return (
    <Card title={title} className="mb-4">
      <div className="flex p-fluid grid shadow-lg">
        {keys.length === 0 ? (
          <p className="ml-3">No Results Found</p>
        ) : (
          keys.map((key) => renderField(asset.id, key, schema!.properties[key]))
        )}
      </div>
    </Card>
  );
};


  const eclassKeys = Object.keys(schema?.properties || {}).filter((key) => key.startsWith('eclass'));
  const iffsKeys = Object.keys(schema?.properties || {}).filter((key) => key.startsWith('iffs'));
  return (
    <BlockUI blocked={loading}>
      <HorizontalNavbar />
      <Toast ref={toast} />
      <div style={{ padding: "1rem 1rem 2rem 3rem", zoom: "80%" }} className="container">
        <div>
          <h2 className="hover " style={{  marginTop: "100px" }}>
            {t('asset:editAsset')}
          </h2>
          <h5 style={{ fontWeight: "normal", fontSize: "20px", fontStyle: "italic", color: "#226b11" }}>{assetType} form --  {asset.id}</h5>
        </div>

        <div className="mb-7">
            <form  onSubmit={handleSubmit} >
              <div>
                {renderCard("General Fields", iffsKeys)}
                {renderCard("EClass Fields", eclassKeys)}
              </div>
              <div className="flex">
                <div className="p-field col-13 mt-3 flex flex-column">
                  <label className="relations-label">{t('button:relations')}</label>
                  <label style={{ fontSize: "15px", marginTop: "10px" }}>{t('button:addRelation')}</label>
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
                {showStatus && <p className="font-semibold"
                 style={{ paddingTop: '30px', marginLeft: '20px', fontWeight: 'bold', color: '#008000' }}>{status}</p>}
              </div>
            </form>
        </div>
        <Footer />
      </div>
    </BlockUI>
  );
}

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

export default AssetEdit;
