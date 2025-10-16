import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Timeline } from 'primereact/timeline';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import Image from 'next/image';
import { Checkbox } from 'primereact/checkbox';
import '../../../public/styles/move-to-room.css';
import axios from 'axios';
import { MultiSelect } from 'primereact/multiselect';
import OwnerDetailsCard from './owner-details';
import { postFile, createPurchasedPdt } from '@/utility/asset';
import { updateCompanyTwin, getCategorySpecificCompany, verifyCompanyCertificate, generateAssetCertificate, getCompanyDetailsById, verifyCompanyAssetCertificate, getAllCompanies } from '@/utility/auth';
import moment from 'moment';
import { getAssignedContracts, getContracts } from "@/utility/contracts";
import { createBinding } from "@/utility/contracts";
import { toDate } from '@/utility/dateformat';
import { getAccessGroup } from '@/utility/indexed-db';
interface Company {
  id: string;
  name: string;
  companyIfricId: string
}

interface Certificate {
  label: string;
  value: string;
}

interface AssetData {
  id: string;
  type?: string;
  asset_category?: string;
  name?: string;
}

interface MoveToRoomDialogProps {
  asset?: AssetData;
  assetName: string;
  company_ifric_id: string;
  assetIfricId: string;
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}

interface OwnerDetails {
  name?: string;
  companyIfricId: string;
  certifiedCompany?: string;
  role?: string;
  country?: string;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const IFRIC_REGISTRY_BACKEND_URL = process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL;

const MoveToRoomDialog: React.FC<MoveToRoomDialogProps> = ({asset, assetName ,assetIfricId, company_ifric_id, visible, onHide, onSave }) => {
  const [factoryOwner, setFactoryOwner] = useState<Company | null>(null);
  const [factoryOwners, setFactoryOwners] = useState<OwnerDetails[]>([]);
  const [certificate, setCertificate] = useState<Certificate[] | null>([]);
  const [contract, setContract] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);
  const [preCertifyAsset, setPreCertifyAsset] = useState(false);
  const [salesAgreement, setSalesAgreement] = useState(false);
  const [salesAgreementFile, setSalesAgreementFile] = useState<string>('');
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const salesAgreementFileUploadRef = useRef<FileUpload>(null);
  const [ownerDetails, setOwnerDetails] = useState<OwnerDetails | null>(null);
  const [checkIndex, setCheckIndex] = useState(0);
  const [certificationDate, setCertificationDate] = useState<Date | null | undefined>(null);
  const [assetVerified, setAssetVerified] = useState<boolean | null>(null);
  const [ownerVerified, setOwnerVerified] = useState<boolean | null>(null);
  const [companyVerified, setCompanyVerified] = useState<boolean | null>(null);
  const [companyIfricId, setCompanyIfricId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showUploadMessage, setShowUploadMessage] = useState(false);
  const [contractData, setContractData] = useState<Record<string,any>[]>([]);
  const [contractLoading, setContractLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [completeContract, setCompleteContract]= useState<Record<string,any>[]>([]);
  const [saveMessage, setSaveMessage] = useState<{
    severity: "success" | "error" | "warn";
    text: string;
  } | null>(null);
  const [assignMessage, setAssignMessage] = useState<{
    severity: "success" | "error" | "warn";
    text: string;
  } | null>(null);
  const [assignedContractsList, setAssignedContractsList] = useState<string[]>(
    []
  );
  const [factoryOwnerSearch, setFactoryOwnerSearch] = useState("");

  // const certificateOptions: Certificate[] = [
  //   { label: 'contract_Predictive_MIcrostep', value: 'contract_Predictive_MIcrostep' },
  //   { label: 'contract_Insurance_IFRIC', value: 'contract_Insurance_IFRIC' },
  // ];

  useEffect(() => {
    fetchFactoryOwners();
    verfiyCompanyAndAssetCertificate();
    getCompanyDetails();
    getCompanyContracts(company_ifric_id);
  }, []);

  useEffect(() => {
    const fetchAlreadyAssignedContracts = async () => {
      if (!factoryOwner || !assetIfricId) return;

      try {
        const accessGroup = await getAccessGroup();
        const res = await getAssignedContracts(
          factoryOwner.companyIfricId,
          accessGroup.company_ifric_id,
          assetIfricId
        );
        console.log(res, "getcontractassign");

        if (res && Array.isArray(res.data)) {
          const assignedNames = res.data.map((c: any) =>
            c.contract_name.trim().toLowerCase()
          );
          setAssignedContractsList(assignedNames);
        }
      } catch (error) {
        console.error("Error fetching assigned contracts for asset:", error);
      }
    };

    fetchAlreadyAssignedContracts();
  }, [factoryOwner, assetIfricId]);

  useEffect(() => {
    const newCompletedSteps = [
      !!factoryOwner,
      (!!contract || (salesAgreement && !!salesAgreementFile)),
      !!certificate,
      !!factoryOwner && (!!contract || (salesAgreement && !!salesAgreementFile)) && !!certificate
    ];
    setCompletedSteps(newCompletedSteps);
  }, [factoryOwner, contract, salesAgreement, salesAgreementFile, certificate]);

  const getCompanyDetails = async () => {
    try {
      const response = await getCompanyDetailsById(company_ifric_id);
      setUserEmail(response?.data[0].email);
      setCompanyName(response?.data[0].company_name)
    }
    catch (error: any) {
      console.error("Failed to fetch company details");
    }
  }

  const getCompanyCertification = async (company_ifric_id: string) => {
    try {
      const response = await verifyCompanyCertificate(company_ifric_id);
      if (response?.data.success === true && response.data.status === 201) {
        setOwnerVerified(true);
      }
      else {
        setOwnerVerified(false);
      }
    }
    catch (error: any) {
      console.error("error fetching company certification", error);
    }
  }

  const getCompanyContracts = async (company_ifric_id: string) => {
    try {
      const response = await getContracts(company_ifric_id);
      // console.log(response,"RS getContracts")
      if(response.length) {      
        const contractNames = response.map((contract: { contract_name: any }) => {
          return { label: contract.contract_name, value: contract.contract_name }
        });

        setCompleteContract(response)
        setContractData(contractNames);
      }
    } catch(error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to fetch company contract' });
    } finally {
      setContractLoading(false);
    }
  }

  const verfiyCompanyAndAssetCertificate = async () => {
    try {
      const response = await verifyCompanyAssetCertificate(company_ifric_id, assetIfricId);
      if (response?.data.company_cert === true) {
        setCompanyVerified(true);
      } else {
        setCompanyVerified(false);
      }
      if(response?.data.asset_cert === true) {
        setAssetVerified(true);
        setPreCertifyAsset(true);
      } else {
        setAssetVerified(false);
      }
    } catch(error: any) {
      console.error("Error verifying company and product certificate:", error);
    }
  }

  const createAssetCertification = async (e: any) => {
    e.preventDefault();
    if (certificationDate) {
      const formattedDate = handleDateChange(certificationDate);
      const dataToSend = {
        company_ifric_id: company_ifric_id,
        asset_ifric_id: assetIfricId,
        user_email: userEmail,
        expiry: formattedDate
      }
      try {
        const response = await generateAssetCertificate(dataToSend);
        if (response?.data.status === 201 && response.data.success === true) {
          setAssetVerified(true);
          setPreCertifyAsset(false);
        }
        else {
          setAssetVerified(false);
        }
      }
      catch (error: any) {
        console.error("Error generating certificate", error);
      }
    }
    else {
      console.error("Please select an expiration date.")
    }
  }
  const handleSave = async () => {
    try {
      if (!factoryOwner?.companyIfricId) {
        throw new Error('New Product Owner ID is missing');
      }

      const dataToSend = {
        owner_company_ifric_id: factoryOwner.companyIfricId,
        // owner_company_ifric_id: "urn:ifric:ifx-eur-nld-ast-b28fa8b9-5027-58e2-b06f-1eef75e62d0d",
        manufacturer_ifric_id: company_ifric_id,
        asset_ifric_id: assetIfricId
      };

      console.log("Data being sent to API:", dataToSend);

      const response = await updateCompanyTwin(dataToSend);

      console.log("API response:", response);

      if (response && response.data.status === 204) {
        // if factory owner company_ifric_id is not same as current company_ifric_id then create purchased pdt cache
        if(factoryOwner.companyIfricId !== company_ifric_id) {
          await createPurchasedPdt(factoryOwner.companyIfricId, assetIfricId, assetVerified ?? false);
        }
        setSaveMessage({
          severity: "success",
          text: "Asset assignment updated successfully",
        });
      }
    } catch (error: any) {
      console.error("Error updating asset assignment:", error);
      setSaveMessage({
        severity: "error",
        text: error.message || "Failed to update asset assignment",
      });
    }
  };
  const handleFactoryOwnerChange = (e: DropdownChangeEvent) => {
    const selectedOwner = e.value;
    // console.log(selectedOwner,"selectedOnwer")
    setFactoryOwner(selectedOwner);
    setOwnerVerified(null);
    setCompanyIfricId(e.value.companyIfricId);
    getCompanyCertification(e.value.companyIfricId);
  };

  const calcValidTill = (contract: any): Date | null => {
    // console.log(contract,"calcValidTill Contract")
  const {
    start_date_present,
    start_date,
    set_duration,
    contract_duration,
    no_end_date,
    set_fixed_end_date,
    fixed_end_date,
    meta_data,
  } = contract;

  const createdDate = meta_data?.created_at ? new Date(meta_data.created_at) : new Date();

  if (start_date_present && set_duration && contract_duration) {
    return addDuration(new Date(start_date), contract_duration);
  }

  if (set_duration && contract_duration) {
    return addDuration(createdDate, contract_duration);
  }

  if (no_end_date) {
    const date = new Date(createdDate);
    date.setFullYear(date.getFullYear() + 40);
    return date;
  }

  if (start_date_present && set_fixed_end_date && fixed_end_date) {
    return new Date(fixed_end_date);
  }

  if (set_fixed_end_date && fixed_end_date) {
    return new Date(fixed_end_date);
  }

  return null;
};

const addDuration = (date: Date, duration: string): Date | null => {
  if (!duration) return null;
  const [value, unitRaw] = duration.split("_");
  const num = parseInt(value, 10);
  const unit = unitRaw.toLowerCase();
  const newDate = new Date(date);
  // console.log(newDate,"NewDate")

  if (unit.startsWith("day")) newDate.setDate(newDate.getDate() + num);
  else if (unit.startsWith("month")) newDate.setMonth(newDate.getMonth() + num);
  else if (unit.startsWith("year")) newDate.setFullYear(newDate.getFullYear() + num);
  // console.log(newDate,"NewDate After")
  return newDate;
};

  
 const handleAssignContract = async (companyIFRICID: string | undefined , arrayOfContractDetails: Array<string>) => {
  setLoading(true);
  try {
    if(!arrayOfContractDetails){
      return;
    }

    const responseData=filterSelectedContractData(arrayOfContractDetails)
    if(!responseData) return;

    const { user_email} = await getAccessGroup();
    const accessGroup =await getAccessGroup();
    
    
    const promises = responseData.map(async (contract:any) => {
      const validTill = calcValidTill(contract);    

      const dataToSend = {
        contract_ifric_id: contract.contract_ifric_id,
        company_ifric_id: companyIFRICID,
        is_DataProvider: true,
        asset_id: [
          {
            asset_ifric: assetIfricId,
            asset_name: assetName,
            asset_type: asset?.type,
            asset_cateorgy: asset?.asset_category,
            Asset_manufactueres_company_ifirc: accessGroup.company_ifric_id,
          },
        ],
        action_status: "shared",
        contract_status: "inactive",
        signed_date: toDate(new Date()),
        valid_till_date: validTill ? toDate(validTill) : null,
        user_email,
      };

      console.log("Binding payload", dataToSend);
      return createBinding(dataToSend);
    });

      const results = await Promise.allSettled(promises);

      const successes = results.filter((r) => r.status === "fulfilled");
      const failures = results.filter((r) => r.status === "rejected");
      const failedContracts = failures.map(
        (f, idx) => arrayOfContractDetails[idx]
      );

      if (successes.length > 0) {
        setAssignMessage({
          severity: "success",
          text: `${successes.length} assigned successfully.`,
        });
      }

      if (failures.length > 0) {
        setAssignMessage({
          severity: "error",
          text: `${failures.length} failed to assign: ${failedContracts.join(
            ", "
          )}`,
        });
      }
    } catch (error) {
      console.error("❌ handleAssignContract error:", error);
      setAssignMessage({
        severity: "error",
        text: "Unexpected error while assigning contracts",
    });
  } finally {
    setLoading(false);
  }
};

const filterSelectedContractData=(contractNames:Array<string>):any=>{
  if (!Array.isArray(completeContract)) return [];
  if (!Array.isArray(contractNames) || contractNames.length === 0) return []; 
  const contractNameList= (s?: string) => (s ?? "").trim().toLowerCase();
  const wanted = new Set(contractNames.map(contractNameList));
  const filteredContract:Record<string,any>[]= completeContract.filter(x => wanted.has(contractNameList(x.contract_name)));
  return filteredContract;

}

  const fetchFactoryOwners = async () => {
    try {
      const response = await getAllCompanies();
      console.log(response, "New Product Owners Response");
      if (response && response.data && Array.isArray(response.data)) {
        const formattedOwners = response.data.map((owner: any) => ({
          id: owner.company_ifric_id,
          name: owner.company_name,
          companyIfricId: owner.company_ifric_id,
          company_category: owner.company_category,
          country: owner.company_country ,
          logoUrl: owner.company_image 
        }));
        setFactoryOwners(formattedOwners);
      } else {
        throw new Error('Invalid data format received from the server');
      }
    } catch (error) {
      console.error('Error fetching new product owners:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch new product owners' });
    }
  };

  const handleDateChange = (date: Date) => {
    const selectedDate = date as Date;
    const formattedDate = moment(selectedDate)
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    return formattedDate;
  };

  const handleFileUpload = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await postFile(formData);
      if (response && response.status === 201) {
        if (salesAgreement) {
          setSalesAgreementFile(response.data);
        } else {
          setContract(response.data);
        }
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully' });
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to upload file' });
    }

    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
    if (salesAgreementFileUploadRef.current) {
      salesAgreementFileUploadRef.current.clear();
    }
  };

  const timelineEvents = [
    { status: 'Selected Owner', subtext: 'Selected New Product Owner' },
    { status: 'Uploaded Contract', subtext: 'Contract or Sales Agreement uploaded' },
    { status: 'Selected Certificate', subtext: 'Certified by IFX - IFRIC' },
    { status: 'Assigned Owner', subtext: 'Asset Data Twin Transferred' },
  ];

  const customizedMarker = (item: any, index: number) => {
    return (
      <span className={`custom-marker ${completedSteps[index] ? 'completed' : ''}`}>
        {index + 1}
      </span>
    );
  };

  const customizedContent = (item: any, index: number) => {
    return (
      <div className={`custom-content ${completedSteps[index] ? 'completed' : ''}`}>
        <h3>{item.status}</h3>
        <p>{item.subtext}</p>
      </div>
    );
  };
  const CustomCheck = ({ stroke = "#CECECE", fill = "white", check = "#CECECE" }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M8 12.75C8 12.75 9.6 13.6625 10.4 15C10.4 15 12.8 9.75 16 8" stroke={check} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const mappedContractOptions = contractData.map((c: any) => {
    const isAssigned = assignedContractsList.includes(
      c.value?.trim().toLowerCase()
    );
    return {
      ...c,
      isAssigned,
      disabled: isAssigned, 
    };
  });

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          onHide();
        }}
        className="p-button-text"
        style={{ backgroundColor: "#E6E6E6", color: "black" }} // Set text color to black
      />
      <Button
        label="Transfer Ownership"
        icon="pi pi-check"
        onClick={async () => {
          await handleSave();
           await handleAssignContract(
             factoryOwner?.companyIfricId,
             contract 
           );
       
        }}
        disabled={!factoryOwner}
        style={{ backgroundColor: "#E6E6E6", color: "black" }} // Set text color to black
        autoFocus
      />
      <div className="mt-2">
        {saveMessage && (
          <Message severity={saveMessage.severity} text={saveMessage.text} />
        )}
        {assignMessage && (
          <Message
            severity={assignMessage.severity}
            text={assignMessage.text}
          />
        )}
      </div>
    </div>
  );

  const dialogHeader = (
    <div className="company-dialog-header">
      <div><h2 className='header_asset_title'>{assetName}</h2>
        <p className="header_ifric_id">{assetIfricId}</p></div>
      <div className='company_verified_wrapper'>
        <div>{companyName}</div>
        {(companyVerified !== null && companyVerified === true) && (
          <Image src="/verified_icon.svg" alt='company verified' width={20} height={20}></Image>
        )}
        {(companyVerified !== null && companyVerified === false) && (
          <Image src="/warning.svg" alt='company verified' width={20} height={20}></Image>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      style={{ width: '80vw', maxWidth: "1300px", height: '80vh' }}
      footer={dialogFooter}
      onHide={() => { onHide()}}
      className="move-to-room-dialog"
      draggable={false}
    >
      <Toast ref={toast} />
      <div className='owner_dialog_wrapper'>
        <div className="owner_form_steps">
          <div className="custom_steps_wrapper">
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 1 ? "#3874C9" : "#6b7280" }}></div>
              {factoryOwner ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: factoryOwner ? "#2b2b2b" : "#6b7280" }}>New Product Owner</div>
                <div className="custom_check_helper">Select Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 2 ? "#3874C9" : "#6b7280" }}></div>
              {assetVerified ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: assetVerified ? "#2b2b2b" : "#6b7280" }}>Asset Certified</div>
                <div className="custom_check_helper">Select Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 2 ? "#3874C9" : "#6b7280" }}></div>
              {salesAgreement ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: salesAgreement ? "#2b2b2b" : "#6b7280" }}>Sale Contract</div>
                <div className="custom_check_helper">Selected New Product Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              <div className="step_connector" style={{ backgroundColor: checkIndex >= 3 ? "#3874C9" : "#6b7280" }}></div>
              {certificate && certificate.length !== 0 ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: certificate && certificate.length !== 0 ? "#2b2b2b" : "#6b7280" }}>DataSpace Contract</div>
                <div className="custom_check_helper">Selected New Product Owner</div>
              </div>
            </div>
            <div className="custom_step_cell">
              {checkIndex >= 4 ? (
                <CustomCheck stroke="#3874C9" fill="#3874C9" check="white" />
              ) : (
                <CustomCheck stroke="#6b7280" fill="white" check="white" />
              )}
              <div className='check_content_wrapper'>
                <div className="custom_check_title" style={{ color: checkIndex >= 4 ? "#2b2b2b" : "#6b7280" }}>Assigned Owner</div>
                <div className="custom_check_helper">Selected New Product Owner</div>
              </div>
            </div>
          </div>
        </div>
        <div className="owner_form_wrapper">
          <form className="owner_form">
            <div className="form_field_group">
              <h3 className="form_group_title">
                New Product Owner<span style={{ color: "#ff0000" }}>*</span>
              </h3>
              <div className="form_field">
                <div className="p-field p-float-label">
                  <Dropdown
                    id="factoryOwner"
                    value={factoryOwner}
                    options={factoryOwners}
                    onChange={handleFactoryOwnerChange}
                    optionLabel="name"
                    filter
                    placeholder="Select a new product owner"
                    className="company_dropdown"
                    filterBy="name,country"
                    itemTemplate={(option) => (
                      <div className="owner-option">
                        <div className="owner-avatar">
                          {option.logoUrl ? (
                            <img
                              src={option.logoUrl}
                              alt={option.name}
                              className="owner-logo"
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="no-product-image">
                              {option.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="owner-info">
                          <div className="owner-name">{option.name}</div>
                          <div className="owner-country">{option.country}</div>
                        </div>
                        {option.alreadySelected && (
                          <div className="owner-selected">
                            <img
                              src="/checkmark-circle-03.svg"
                              alt="Selected"
                              width={14}
                              height={14}
                            />
                            <span>Already Selected</span>
                          </div>
                        )}
                      </div>
                    )}
                    valueTemplate={(option) =>
                      option ? (
                        <div className="owner-selected-template">
                          <span>{option.name}</span>
                        </div>
                      ) : (
                        <span>Select a new product owner</span>
                      )
                    }
                  />

                  <img
                    className="dropdown-icon-img "
                    src="/dropdown-icon.svg"
                    alt="dropdown-icon"
                  />
                  <label htmlFor="factoryOwner">New Product Owner</label>
                </div>
              </div>
              {(ownerVerified === true && factoryOwner) && (
                <div className='asset_verified_group'>
                  <Image src="/verified_icon.svg" alt='company verified' width={16} height={16}></Image>
                  <div>IFRIC Verified</div>
                </div>
              )}
              {ownerVerified === false && factoryOwner && (
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
            <div className="form_field_group">
              <h3 className='form_group_title'>Asset Verification</h3>
                <div>
                  {(assetVerified === false && assetVerified !== null) && (
                    <div>
                      <Checkbox inputId="preCertifyAsset" checked={preCertifyAsset}  className='company_checkbox' />
                      <label htmlFor="preCertifyAsset">Pre Certify Asset</label>
                    </div>
                  )}
                  {(assetVerified === true && assetVerified !== null) && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div>
                          <Checkbox inputId="preCertifyAsset" checked={true} className='company_checkbox' />
                          <label htmlFor="preCertifyAsset">Pre Certify Asset</label>
                        </div>
                        <div className='asset_verified_group no-margin'>
                          <Image src="/verified_icon.svg" alt='company verified' width={16} height={16}></Image>
                          <div>Asset Verified</div>
                        </div>
                        </div>
                        <div className="form_field margin_top">
                          <div className="p-field p-float-label">
                            <InputText value={assetName} disabled className="company_input" id='asset-name'
                            ></InputText>
                            <label htmlFor="asset-name">Product Name</label>
                          </div>
                        </div>
                    </>
                  )}
                  {assetVerified === false && preCertifyAsset === false && (
                    <div className='mt-3'>
                      <div>certify asset is must to revice access for dataspace room</div>
                      <Button
                        label="Certify Asset"
                        style={{ backgroundColor: "#E6E6E6", color: "black", marginTop: "1rem"}} // Set text color to black
                      />
                    </div>
                  )}
                </div>
              {preCertifyAsset && (
                <>
                  <div className="form_field margin_top">
                    <div className="p-field p-float-label">
                      <InputText value={assetName} disabled className="company_input" id='asset-name'
                      ></InputText>
                      <label htmlFor="asset-name">Product Name</label>
                    </div>
                  </div>
                  {(assetVerified !== null && assetVerified === false) && (
                    <div className='generate_cert_button_group'>
                      {certificationDate && (
                        <div style={{ marginRight: "auto" }}>Expiration Date: {certificationDate.toLocaleString()}</div>
                      )}
                      <Calendar className='certification_date_button' value={certificationDate} onChange={(e) => setCertificationDate(e.value)} showIcon showTime icon={<img src="calendar_icon.svg" alt="Custom Icon" />} tooltip={"Expiration date"} tooltipOptions={{ position: "left", event: "both" }} />
                      <button className='generate_certification_button' disabled={!certificationDate} onClick={createAssetCertification}>Certify</button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="form_field_group">
              <h3 className='form_group_title'>Sale Contract</h3>
              <div>
                <Checkbox inputId="salesAgreement" checked={salesAgreement} onChange={e => setSalesAgreement(e.checked as boolean)} className='company_checkbox' />
                <label htmlFor="salesAgreement">Sales Agreement</label>
              </div>
              {salesAgreement && (
                <div className="form_field margin_top">
                  <div className="p-field p-float-label">
                    <InputText
                      id="contract"
                      value={salesAgreement ? salesAgreementFile : contract}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => salesAgreement ? setSalesAgreementFile(e.target.value) : setContract(e.target.value)}
                      placeholder="S3 link or file path"
                      className='company_input'
                    />
                    <label htmlFor="contract">{salesAgreement ? 'Sales Agreement' : 'Contract'}</label>
                  </div>
                  <div className="mt-3">
                    <div className="form_field">
                      <label>Attach {salesAgreement ? 'Sales Agreement' : 'Contract'}</label>

                      <FileUpload
                        ref={salesAgreement ? salesAgreementFileUploadRef : fileUploadRef}
                        name={salesAgreement ? "salesAgreement" : "contract"}
                        url={BACKEND_API_URL + '/file'}
                        accept="application/pdf"
                        maxFileSize={4000000}
                        customUpload
                        uploadHandler={handleFileUpload}
                        onUpload={(e) => {
                          toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully' });
                        }}
                        onSelect={(e) => {
                          setShowUploadMessage(true); // Show message when file is selected
                        }}
                        onClear={() => {
                          setShowUploadMessage(false); // Hide message when file is removed
                        }}
                        onError={(e) => {
                          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'File upload failed' });
                        }}
                        emptyTemplate={
                          <div className="flex align-items-center flex-column">
                            <i className="pi pi-image mt-3" style={{ fontSize: '3rem', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                            <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">Drag and Drop Here</span>
                          </div>
                        }
                        headerTemplate={(options) => {
                          const { className, chooseButton, uploadButton, cancelButton } = options;
                          return (
                            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center', marginTop: "12px" }}>
                              {chooseButton}
                              {uploadButton}
                              {cancelButton}
                              <div style={{ marginLeft: 'auto' }}>0 B / 3 MB</div>
                            </div>
                          );
                        }}
                        itemTemplate={(file: any, props) => {
                          return (
                            <div className="flex align-items-center flex-wrap">
                              <div className="flex align-items-center" style={{ width: '40%' }}>
                                <i className="pi pi-file-edit mr-2" style={{ fontSize: '1.2rem' }}></i>
                                <span className="flex flex-column text-left ml-3">
                                  {file.name}
                                  <small>{new Date().toLocaleDateString()}</small>
                                </span>
                              </div>
                              <Button
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={(e) => {
                                  props.onRemove(e);
                                  setShowUploadMessage(false); // Hide Warning message when file is removed
                                }}
                              />
                            </div>
                          );
                        }}
                      />
                      {showUploadMessage && (
                        <div className="mt-2">
                          <Message 
                            severity="warn" 
                            text="Please click Upload button to upload the file" 
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              borderRadius: '6px'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="form_field_group">
              <h3 className='form_group_title'>DataSpace Contract</h3>
              <div className="form_field">
                <div className="p-field p-float-label">
                  
                  <MultiSelect id="certificate"
                    value={contract} // Ensure certificate.value is used
                    options={mappedContractOptions}
                    showSelectAll={false}
                    panelClassName='dataspace_contract_panel'
                    onChange={(e: DropdownChangeEvent) => {
                      // setCertificate(e.value || null);
                      //   // Set the entire certificate object
                      //  console.log("SelectedContractNames dropdown",e.value)
                      setContract(e.value);
                    }}
                    itemTemplate={(option) => (
                      <div className="option-wrapper">
                       <div>{option.label}</div>
                        {option.isAssigned && (
                          <span className="already-selected">
                            <img
                              src="/checkmark-circle-03.svg"
                              alt="Already added"
                              width={12}
                              height={12}
                            />
                        {" "}    Already Selected
                          </span>
                        )}
                      </div>
                    )}
                    optionLabel="label"       
                    placeholder={contractLoading ? "Loading..." : "Select a certificate"}
                    className="company_dropdown" display="chip"
                    filter
                    filterBy="label"
                    // panelHeaderTemplate={() => (
                    //  <div style={{ padding: "0.5rem" }}>
                    //     <InputText
                    
                    //       placeholder="Search..."
                    //       className="custom-search-input"
                    //       style={{ width: "100%", padding: "0.5rem", borderRadius: "10px" }}
                    //     />
                    //   </div>
                    // )}
                    />
                  <img
                    className="dropdown-icon-img "
                    src="/dropdown-icon.svg"
                    alt="dropdown-icon"
                  />
                  <label htmlFor="certificate">DataSpace Contract</label>
                </div>
              </div>
            </div>
            <div className="warning_text_group">
              <div className='warning_group_header'>
                <Image src="warning.svg" width={18} height={18} alt='warning icon'></Image>
                <div className='warning_group_title'>Before you proceed.</div>
              </div>
              <div>
                <ul>
                  <li>Assigning an owner means selling the physical asset.</li>
                  <li>This action is irreversible, please submit only after a purchase agreement is executed between seller and buyer explicitly.</li>
                  <li>Please contact Industryfusion-X team in case of wrong submission.</li>
                </ul>
              </div>
            </div>
          </form>

          {factoryOwner && (
            <div className='owner_details_card'>
              <OwnerDetailsCard owner={factoryOwner} />
            </div>
          )}

        </div>
      </div>
    </Dialog>
  );
};

export default MoveToRoomDialog;