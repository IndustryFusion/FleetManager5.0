import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Image from "next/image.js";
import { Toast } from "primereact/toast";
import { getAccessGroup } from "../../utility/indexed-db";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "../../../public/styles/add-contract.css";
import { getCompanyDetailsById } from "../../utility/auth";
import {
  getTemplateByName,
  getCompanyCertificate,
  getContractByType,
  getAssetByType,
  getAssetCertificateById,
  createBinding,
} from "@/utility/contracts";
import { Dropdown } from "primereact/dropdown";
import moment from "moment";
import Navbar from "@/components/navbar";
import { Dialog } from "primereact/dialog";
import { IoEyeOutline } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import DeleteDialogBox from "@/components/contractManager/delete-dialog-box";
import { deleteBinding, getBindingDetails, getContractData, updateBindingDetails } from "@/utility/bindings";
import { useSelector } from "react-redux";
import { getAssetById } from "@/utility/asset";
import Sidebar from "@/components/sidebar";

interface PropertyDefinition {
  type: string;
  title: string;
  description: string;
  readOnly?: boolean;
  app?: string;
  default?: any;
  enums?: string[];
  minimum?: number;
  maximum?: number;
  segment?: string;
}

interface TemplateData {
  type: string;
  title: string;
  description: string;
  properties: {
    [key: string]: PropertyDefinition;
  };
}

const CreateBindingPage: React.FC = () => {
  const router = useRouter();
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({
    asset_type: "laserCutter",
    contract_title: "Contract Title",
  });
  const [selectedAssetProperties, setSelectedAssetProperties] = useState<
    string[]
  >([]);
  const toast = useRef<Toast>(null);
  const [certificateExpiry, setCertificateExpiry] = useState<Date | null>(null);
  const [assetOptions, setAssetOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [companyIfricId, setCompanyIfricId] = useState(null);
  const [assetVerified, setAssetVerified] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [visible, setVisible] = useState<Boolean>(false);
  const [consumerName, setConsumerName] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [bindingData,setBindingData] =useState({})
  const [contractData, setContractData] = useState<Record<string, any>>({});
  const [initialContractData, setInitialContractData] = useState<
    Record<string, any>
  >({});
  const [bindingDelete, setBindingDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [contractNameExists, setContractNameExists] = useState(false);
  const [initialBindingData,setInitialBindingData]=useState({})
  const bindingsData = useSelector((state: any) => state.bindings.bindings);
  const [allBindings, setAllBindings] = useState([]);

  const { contractBindingId } = router.query;

  const fetchContractData =async(contractId:string)=>{
    try{
        const response = await getContractData(contractId);
        const [contract] = response;
        setContractData({
            ...contract,
            contract_valid_till: contract.contract_valid_till ? new Date(contract.contract_valid_till) : null
        });
        setInitialContractData({
            ...contract,
            contract_valid_till: contract.contract_valid_till ? new Date(contract.contract_valid_till) : null
        });
        setSelectedAssetProperties(contract?.asset_properties);
        
    }catch (error) {
      console.error(error);
    }
  }
  const fetchAssetDetails = async(assetId:string)=>{
    try {
        const asset = await getAssetById(assetId);
        if (asset && asset?.product_name) {
          setProductName(asset?.product_name);
        } else {
          setProductName("N/A");
        }
      } catch (error) {
        console.error("Error fetching asset details:", error);
        setProductName("Error");
      }
  }

  const fetchBindingDetails = async (bindingIfricId: string) => {
    try {
      const response = await getBindingDetails(bindingIfricId);
      const [binding] = response;
      if(binding){
        setBindingData(binding);
        setInitialBindingData({ binding});

        fetchContractData(binding?.contract_id)
        fetchAssetDetails(binding?.asset_ifric_id)
      }
      

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAssetCertificate();
  }, [selectedAsset]);

  useEffect(() => {
    if (contractBindingId) {
      fetchBindingDetails(contractBindingId);
    }
  }, [contractBindingId]);

  const fetchData = async () => {
    try {
      const userData = await getAccessGroup();
      if (userData && userData.jwt_token) {
        setCompanyIfricId(userData.company_ifric_id);
        setUserName(userData.user_name);
        // Fetch template data (from backend)
        const templateResponse = await getTemplateByName(
          "predictiveMaintenance_laserCutter"
        );
        const template = templateResponse?.data[0];
        setTemplateData(template);
        initializeFormData(template.properties);
        setFormData((prevState) => ({
          ...prevState,
          data_provider_company_ifric_id: userData.company_ifric_id,
        }));

        // Fetch company certificate
        const companyCertResponse = await getCompanyCertificate(
          userData.company_ifric_id
        );
        if (
          companyCertResponse &&
          companyCertResponse.data &&
          companyCertResponse.data.length > 0
        ) {
          const companyCert = companyCertResponse.data[0];
          setFormData((prevState) => ({
            ...prevState,
            provider_company_certificate_data: companyCert.certificate_data,
            binding_end_date: new Date(companyCert.expiry_on),
          }));

          setCertificateExpiry(new Date(companyCert.expiry_on));
        }

        // Fetch producer company details
        if (userData.company_ifric_id) {
          const response = await fetchCompanyDetails(userData.company_ifric_id);
          if (response?.data) {
            setFormData((prevState) => ({
              ...prevState,
              provider_company_name: response.data[0].company_name,
              provider_company_address: response.data[0].address_1,
              provider_company_city: response.data[0].city
                ? response.data[0].city
                : response.data[0].address_2,
              provider_company_country: response.data[0].country,
              provider_company_zip: response.data[0].zip,
            }));
          }
        }

        if (template) {
          // fetch contract details
          const contractResponse = await getContractByType(btoa(template.type));
          setConsumerName(
            contractResponse?.data[0].meta_data.created_user || ""
          );
          if (contractResponse?.data) {
            // Fetch producer company details
            if (userData.company_ifric_id) {
              const response = await fetchCompanyDetails(
                contractResponse.data[0].data_consumer_company_ifric_id
              );
              if (response?.data) {
                setFormData((prevState) => ({
                  ...prevState,
                  contract_title: contractResponse.data[0].contract_name,
                  consumer_company_name: response.data[0].company_name,
                  consumer_company_address: response.data[0].address_1,
                  consumer_company_city: response.data[0].city
                    ? response.data[0].city
                    : response.data[0].address_2,
                  consumer_company_country: response.data[0].country,
                  consumer_company_zip: response.data[0].zip,
                  contract_start_date: new Date(
                    contractResponse.data[0].meta_data.created_at
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  contract_end_date: new Date(
                    contractResponse.data[0].contract_valid_till
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  interval: contractResponse.data[0].interval
                    ? contractResponse.data[0].interval
                    : "",
                  data_consumer_company_ifric_id:
                    contractResponse.data[0].data_consumer_company_ifric_id,
                  contract_ifric_id:
                    contractResponse.data[0].contract_ifric_id,
                }));
              }
            }
          }

          // set selected asset properties
          const selectedProperties = contractResponse?.data[0].asset_properties
            ? contractResponse.data[0].asset_properties.map((value: string) =>
                value.split("/").pop()
              )
            : [];
          setSelectedAssetProperties(selectedProperties);

          // fetch assets of template type
          const assetResponse = await getAssetByType(
            btoa(template.properties.asset_type.default)
          );
          if (assetResponse?.data) {
            const options = assetResponse.data.map((value: { id: string }) => ({
              label: value.id,
              value: value.id,
            }));
            setAssetOptions(options);
          }
        }
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "User data or JWT not found",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load necessary data",
      });
    }
  };

  const fetchAssetCertificate = async () => {
    try {
      if (selectedAsset && companyIfricId) {
        const assetCertificateResponse = await getAssetCertificateById(
          selectedAsset,
          companyIfricId
        );
        if (assetCertificateResponse?.data.length) {
          const assetExpiry = moment(
            assetCertificateResponse.data[0].expiry_on
          );
          const currentTime = moment();

          // check whether the last certificate is expired or not.
          if (assetExpiry.isAfter(currentTime)) {
            setFormData((prevState) => ({
              ...prevState,
              asset_certificate_data:
                assetCertificateResponse.data[0].certificate_data,
            }));
            setAssetVerified(true);
          } else {
            setAssetVerified(false);
          }

          // check whether asset certificate expiry is before company certificate expiry
          if (certificateExpiry) {
            const companyExpiry = moment(certificateExpiry);
            console.log("companyExpiry ", companyExpiry);
            console.log("assetExpiry ", assetExpiry);
            if (companyExpiry.isAfter(assetExpiry)) {
              setCertificateExpiry(
                new Date(assetCertificateResponse.data[0].expiry_on)
              );
            }
          }
        }
        else {
          setAssetVerified(null);
          toast.current?.show({ severity: 'warn', summary: 'Warn', detail: assetCertificateResponse?.data.message });
         }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
       setAssetVerified(null);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load necessary data",
      });
    }
  };

  const initializeFormData = (properties: {
    [key: string]: PropertyDefinition;
  }) => {
    const initialData: { [key: string]: any } = {
      asset_type: "laserCutter",
      binding_start_date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    };
    Object.entries(properties).forEach(([key, property]) => {
      if (property.app === "creator") {
        if (property.default !== undefined) {
          initialData[key] = property.default;
        } else if (property.type === "array") {
          initialData[key] = [];
        } else if (property.type === "string") {
          initialData[key] = "";
        } else if (property.type === "number") {
          initialData[key] = 0;
        } else if (property.type === "date") {
          initialData[key] = null;
        }
      }
    });
    setFormData(initialData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { value: any },
    field: string
  ) => {
    const value = "target" in e ? e.target.value : e.value;

    if (
      field === "interval" &&
      templateData &&
      templateData.properties[field] &&
      templateData.properties[field].minimum &&
      templateData.properties[field].maximum
    ) {
      if (value === "" || !isNaN(parseInt(value, 10))) {
        if (
          value >= templateData.properties[field].minimum &&
          value <= templateData.properties[field].maximum
        ) {
          setBindingData({ ...bindingData, [field]: value });
        } else {
          toast.current?.show({
            severity: "warn",
            summary: "Warning",
            detail: `Value must be between ${templateData?.properties[field]?.minimum} and ${templateData?.properties[field]?.maximum}.`,
          });
        }
      }
      return;
    }

    setBindingData({ ...bindingData, [field]: value });
  };

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      return await getCompanyDetailsById(companyId);
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch company details",
      });
    }
  };

  const renderContractClauses = () => {
    const clauses = templateData?.properties.contract_clauses.enums || [];
    return (
      <div className="contract_clauses_wrapper">
        <div className="contract_form_subheader">Contract Clauses</div>
        <ul>
          {clauses.map((clause: string, index: number) => {
            // Split the clause based on [consumer] and [provider] placeholders
            const parts = clause.split(/(\[consumer\]|\[provider\])/g);

            return (
              <li key={`clause-${index}`}>
                {parts.map((part, partIndex) => {
                  if (part === "[consumer]") {
                    return (
                      <strong key={`consumer-${index}-${partIndex}`}>
                        {contractData.consumer_company_name ||
                          "Company Name Not Available"}
                      </strong>
                    );
                  } else if (part === "[provider]") {
                    return (
                      <strong key={`provider-${index}-${partIndex}`}>
                        {formData.provider_company_name ||
                          "Provider Name Not Available"}
                      </strong>
                    );
                  }
                  return <span key={`part-${index}-${partIndex}`}>{part}</span>;
                })}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderSelectedAssetProperties = () => (
    <Card title="Selected Asset Properties">
      <ul>
        {selectedAssetProperties.map((property, index) => (
          <li key={`property-${index}`}>{property}</li>
        ))}
      </ul>
    </Card>
  );

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("submitting..");
    try {
    //   if (!selectedAsset) {
    //     toast.current?.show({
    //       severity: "warn",
    //       summary: "Warning",
    //       detail: "Please select an asset",
    //     });
    //     return;
    //   }

      if (!bindingData?.contract_binding_valid_till) {
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Please choose binding end date",
        });
        return;
      }

    //   if (assetVerified === null) {
    //     toast.current?.show({
    //       severity: "warn",
    //       summary: "Warning",
    //       detail: "Please create certificate for selected asset",
    //     });
    //     return;
    //   }

    //   if (assetVerified === false) {
    //     toast.current?.show({
    //       severity: "warn",
    //       summary: "Warning",
    //       detail: "asset certificate is expired so please create new one",
    //     });
    //     return;
    //   }

      if (!formData.provider_company_certificate_data) {
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Please create company certificate",
        });
        return;
      }

      const dataToSend = {
        contract_binding_valid_till: moment(bindingData?.contract_binding_valid_till).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
      };

        const response = await updateBindingDetails(bindingData?.contract_binding_ifric_id, dataToSend)
        if(response){
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Binding updated successfully' });
        }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add contract",
      });
    }
  };

  const renderAssetTypeList = () => {
    const assetTypes = ["Laser Cutter"];
    return (
      <div className="asset-type-list">
        <h2>Asset Types</h2>
        <ul>
          {assetTypes.map((assetType, index) => (
            <li key={`assetType-${index}`}>
              <Button
                label={assetType}
                onClick={() => handleAssetTypeClick(assetType)}
                className={
                  formData.asset_type === assetType
                    ? "p-button-primary"
                    : "p-button-outlined"
                }
              />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const handleAssetTypeClick = (assetType: string) => {
    setFormData((prevState) => ({
      ...prevState,
      asset_type: assetType,
    }));
  };
  const renderDataTypeList = () => {
    const dataTypes = contractData?.data_type ?? [];
    return (
      <div className="datatype_chips_wrapper">
        {dataTypes.map((dataType: string) => (
          <div className="datatype_chip">{dataType}</div>
        ))}
      </div>
    );
  };
  const renderDialogHeader = () => {
    return (
      <div className="flex align-items-center justify-content-between">
        <h3 className="contract_dialog_heading m-0">Signing Contract</h3>
      </div>
    );
  };
  const renderDialogFooter = () => {
    return (
      <div>
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={() => setVisible(false)}
          className="custom-cancel-btn"
        />
        <Button
          label="Agree and Sign"
          icon="pi pi-check"
          className="custom-add-btn sign_button"
          onClick={handleSubmit}
          autoFocus
        />
      </div>
    );
  };

  const handleReset = () => {
   setBindingData({ ...bindingData, contract_binding_valid_till: initialBindingData?.contract_binding_valid_till });
  };

  const handleDelete = async (bindingIfricId: string) => {
    try {
      const response = await deleteBinding(bindingIfricId);
      if (response?.acknowledged) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Contract deleted successfully",
        });
        router.back();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!templateData) return <div>Loading...</div>;

  return (
    <div className="flex">
        <Sidebar />
      <div className="main_content_wrapper">
        <div className="navbar_wrapper">
          <Navbar navHeader={"Binding"} />
        </div>
        <div className="create-contract-form-container">
          <Toast ref={toast} />
          <div className="create-contract-form-grid">
            <div className="create-contract-form-wrapper">
              <h2 className="template-form-heading ml-3">
                {contractData.contract_name ?? ""}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="contract_form_field_column">
                    <div className="field">
                      <label htmlFor="contract_type">Contract Type</label>
                      <div className="text_large_bold">
                        {contractData.contract_type
                          ? contractData.contract_type.split("/").pop()
                          : ""}
                      </div>
                    </div>
                    <div className="field half-width-field">
                      <label htmlFor="asset_type">Asset Type</label>
                      <div className="text_large_bold">
                        {contractData.asset_type
                          ? contractData.asset_type.split("/").pop()
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="contract_form_subheader">Contract Time</div>
                  <div className="contract_form_field_column">
                    <div className="field">
                      <label htmlFor="contract_start_date">
                        Contract Start Date
                      </label>
                      <div className="text_large_bold">
                        {new Date(
                          contractData?.meta_data?.created_at
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="contract_end_date">
                        Contract End Date
                      </label>
                      <div className="text_large_bold">
                        {new Date(
                          contractData.contract_valid_till
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="contract_form_subheader">Binding Time</div>
                  <div className="contract_form_field_column">
                    <div className="field">
                      <label htmlFor="contract_start_date">
                        Binding Start Date
                      </label>
                      <div className="text_large_bold">
                        {new Date(
                          bindingData?.meta_data?.created_at
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="field">
                      <label
                        htmlFor="binding_end_date"
                        className="required-field"
                      >
                        Binding End Date
                      </label>
                      <Calendar
                        id="binding_end_date"
                        value={bindingData?.contract_binding_valid_till ?? null}
                        onChange={(e) =>
                          handleInputChange(e, "contract_binding_valid_till")
                        }
                        showIcon
                        required
                        maxDate={
                          certificateExpiry
                            ? new Date(certificateExpiry.getTime())
                            : undefined
                        }
                        className="contract_form_field"
                        dateFormat="MM dd, yy"
                        disabled={isEdit ? false : true}
                        placeholder={
                            bindingData?.contract_binding_valid_till &&
                           moment(bindingData?.contract_binding_valid_till).utc().format("MMMM D, YYYY")
                          }
                      />
                      {certificateExpiry  && isEdit && (
                        <small className="ml-3 mt-2">
                          Contract end date must be before{" "}
                          {new Date(certificateExpiry).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="contract_form_subheader">Parties</div>
                  <div className="contract_form_field_column">
                    <div className="field">
                      <div className="consumer_details_wrapper">
                        <Image
                          src="/add-contract/company_icon.svg"
                          width={24}
                          height={24}
                          alt="company icon"
                        ></Image>
                        <div>
                          <label htmlFor="provider_company_name">
                            Data Consumer
                          </label>
                          <div
                            style={{ color: "#2b2b2bd6", lineHeight: "18px" }}
                          >
                            <div className="company_verified_group">
                              <div className="text_large_bold">
                                {contractData.consumer_company_name ?? ""}
                              </div>
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {formData.consumer_company_address ?? ""}
                            </div>
                            {/* <div style={{ marginTop: "4px" }}>{formData.data_consumer_company_ifric_id}</div> */}
                            <div style={{ marginTop: "4px" }}>
                              {formData.consumer_company_city ?? ""}
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {formData.consumer_company_country ?? ""}
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {formData.consumer_company_zip ?? ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="field">
                      <div className="consumer_details_wrapper">
                        <Image
                          src="/add-contract/company_icon.svg"
                          width={24}
                          height={24}
                          alt="company icon"
                        ></Image>
                        <div>
                          <label htmlFor="provider_company_name">
                            Data Provider
                          </label>
                          <div
                            style={{ color: "#2b2b2bd6", lineHeight: "18px" }}
                          >
                            <div className="company_verified_group">
                              <div className="text_large_bold">
                                {formData.provider_company_name ?? ""}
                              </div>
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {formData.provider_company_address ?? ""}
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {formData.provider_company_city ?? ""}
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {formData.provider_company_country ?? ""}
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {formData.provider_company_zip ?? ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="contract_form_subheader">Asset Data</div>
                  <div className="contract_form_field_column">
                    <div className="field">
                      <label htmlFor="contract_start_date">Assets</label>
                      {/* <Dropdown
                        id="assets"
                        value={selectedAsset}
                        options={assetOptions}
                        onChange={(e) => setSelectedAsset(e.value)}
                        optionLabel="label"
                        placeholder="Select a asset"
                        required
                        className="contract_form_field"
                        disabled={isEdit ? false : true}
                      /> */}
                      <p className="text_large_bold">{productName}</p>
                    </div>
                    {assetVerified == true && (
                      <div className="asset_verified_group">
                        <Image
                          src="/verified_icon.svg"
                          alt="company verified"
                          width={16}
                          height={16}
                        ></Image>
                        <div>IFRIC Verified</div>
                      </div>
                    )}
                    {assetVerified == false && (
                      <div className="asset_verified_group">
                        <Image
                          src="/warning.svg"
                          alt="company verified"
                          width={16}
                          height={16}
                        ></Image>
                        <div>Not IFRIC Verified</div>
                      </div>
                    )}
                  </div>
                  <div className="contract_form_subheader">Shared Data</div>
                  <div className="contract_form_field_column">
                    <div className="field half-width-field">
                      <label htmlFor="interval">Interval</label>
                      <div className="text_large_bold">
                        {contractData.interval ?? ""}
                      </div>
                      {templateData?.properties.data_type && (
                        <div className="data_types_field_wrapper">
                          <label htmlFor="">Data type</label>
                          {renderDataTypeList()}
                        </div>
                      )}
                    </div>
                    <div className="field half-width-field">
                      <label htmlFor="asset_properties">Asset Properties</label>
                      <div
                        className="datatype_chips_wrapper"
                        style={{ marginTop: "0px" }}
                      >
                        {selectedAssetProperties.map((property, index) => (
                          <div
                            className="datatype_chip"
                            key={`property-${index}`}
                          >
                            {property}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {renderContractClauses()}
                {isEdit && (
                  <div className="form-btn-container">
                    <Button
                      type="button"
                      label="Cancel"
                      className="p-button-danger p-button-outlined custom-cancel-btn"
                      onClick={() => setIsEdit(false)}
                      icon="pi pi-times"
                    />
                    <Button
                      type="reset"
                      label="Reset"
                      className="p-button-secondary p-button-outlined custom-reset-btn"
                      icon="pi pi-refresh"
                      onClick={() => handleReset()}
                    />
                    <Button
                      type="submit"
                      label="Update"
                      className="p-button-primary custom-add-btn"
                      icon="pi pi-check"
                    />
                  </div>
                )}
              </form>
            </div>
            <div className="asset-type-list-cover">
              <p className="review-btn">Review</p>
              <ul className="review_lists">
                <li>
                  <i className="pi pi-download mr-2"></i>Download
                </li>
                <li onClick={() => setIsEdit(false)}>
                  <IoEyeOutline className="mr-2" />
                  Preview
                </li>
                <li onClick={() => setIsEdit(true)}>
                  <FiEdit3 className="mr-2" />
                  Edit
                </li>
                <li onClick={() => setBindingDelete(true)}>
                  <RiDeleteBinLine className="mr-2" />
                  Delete
                </li>
              </ul>
            </div>
            <Dialog
              header={renderDialogHeader}
              visible={visible}
              style={{ width: "100%", maxWidth: "550px" }}
              draggable={false}
              footer={renderDialogFooter}
              onHide={() => {
                if (!visible) return;
                setVisible(false);
              }}
              className="contract_dialog_cover"
            >
              <div className="contract_dialog_content">
                <div className="contract_dialog_company_details">
                  <div className="consumer_details_wrapper">
                    <Image
                      src="/add-contract/company_icon.svg"
                      width={24}
                      height={24}
                      alt="company icon"
                    ></Image>
                    <div>
                      <label htmlFor="provider_company_name">
                        Data Consumer
                      </label>
                      <div style={{ color: "#2b2b2bd6", lineHeight: "18px" }}>
                        <div className="company_verified_group">
                          <div className="text_large_bold">
                            {contractData.consumer_company_name ?? ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="consumer_details_wrapper">
                    <Image
                      src="/add-contract/company_icon.svg"
                      width={24}
                      height={24}
                      alt="company icon"
                    ></Image>
                    <div>
                      <label htmlFor="provider_company_name">
                        Data Provider
                      </label>
                      <div style={{ color: "#2b2b2bd6", lineHeight: "18px" }}>
                        <div className="company_verified_group">
                          <div className="text_large_bold">
                            {formData.provider_company_name ?? ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="contract_form_field_column"
                  style={{ marginTop: "15px", padding: "0px" }}
                >
                  <div className="field representative_highlight">
                    <label htmlFor="contract_start_date">
                      Representative name
                    </label>
                    <div className="text_large_bold">{consumerName}</div>
                  </div>
                  <div className="field representative_highlight">
                    <label htmlFor="contract_start_date">
                      Representative name
                    </label>
                    <div className="text_large_bold">{userName}</div>
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
      {bindingDelete && (
        <DeleteDialogBox
          deleteDialog={bindingDelete}
          setDeleteDialog={setBindingDelete}
          handleDelete={handleDelete}
          id={bindingData?.contract_binding_ifric_id}
          deleteItemName={
            <label className="delete-text">
              Do you want to delete{" "}
              <strong>{contractData?.contract_name}</strong>
            </label>
          }
        />
      )}
    </div>
  );
};

export default CreateBindingPage;
