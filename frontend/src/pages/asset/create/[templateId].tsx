import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import "../../../../public/styles/create-form.css";
import { useRouter } from "next/router";
import axios from "axios";
import { MultiSelect } from "primereact/multiselect";
import { ListBox } from "primereact/listbox";

export interface RelationItem {
  label: string;
  value: string;
  isSubmitted?: boolean;
}

export interface Property {
  type: string;
  title: string;
  description: string;
  readOnly?: boolean;
  enum?: string[];
  contentMediaType?: string;
  unit?: string;
  relationship: any;
}

export interface Schema {
  type: string;
  title: string;
  description: string;
  properties: Record<string, Property>;
}
// Define the interface for the schema
interface DynamicFormSchema {
  properties: Record<string, Property>;
  type: string;
  title: string;
  description: string;
}
type FileLoadingState = {
  [key: string]: boolean;
};
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
// Initialize the state with a more specific type

const createAssetForm: React.FC = () => {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [focusedFields, setFocusedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [filterOptions, setFilterOptions] = useState<any[]>([]);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [dialogFormData, setDialogFormData] = useState<Record<string, any>>({});
  // Initialize the state with a more specific type
  const [dynamicFormSchema, setDynamicFormSchema] =
    useState<DynamicFormSchema | null>(null);

  const [selectedRelationsList, setSelectedRelationsList] = useState<
    RelationItem[]
  >([]);
  const [selectedRelations, setSelectedRelations] = useState([]);
  const [relationId, setRelationId] = useState(null);
  const [uploadedFileKeys, setUploadedFileKeys] = useState<string[]>([]);
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [fileLoading, setFileLoading] = useState<FileLoadingState>({});
  const fileInputRef = useRef(null);
  const { templateId } = router.query;
  const [relationsOptions, setRelationsOptions] = useState<RelationItem[]>([]);
  const [relationSubmitted, setRelationSubmitted] = useState({
    relationType: null,
    submitted: false,
  });

  const handleFocus = (key: string) => {
    setFocusedFields({ ...focusedFields, [key]: true });
  };

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
  const handleBlur = (key: string) => {
    setFocusedFields({ ...focusedFields, [key]: false });
  };

  const selectedTemplateId =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedTemplateId")
      : null;
  const [templateData, setTemplateData] = useState(null);
  // const location = useLocation();

  const handleChange = (key: string, value: any) => {
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

  useEffect(() => {
    const fetchData = async () => {
      if (templateId) {
        try {
          const response = await fetch(
            API_URL + `/templates/${selectedTemplateId}`
          );
          const data = await response.json();

          if (data && Array.isArray(data)) {
            const template = data[0];
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
              label: relation,
              value: relation,
            }));

            setFilterOptions(filterOptions);

            console.log("FilterOptions: ", filterOptions);
          } else {
            console.error("Fetched data is not in the expected format");
          }
        } catch (error) {
          console.error("Error fetching template:", error);
        }
      }
    };

    fetchData();
  }, [selectedTemplateId]);

  const assetType = "airfilter";

  // Function to render dynamic form fields
  const renderDynamicField = (key: any, property: any) => {
    switch (property.type) {
      case "string":
        return (
          <div key={key} className="p-field">
            <label htmlFor={key}>{property.title}</label>
            <InputText
              id={key}
              value={dialogFormData[key] || ""}
              onChange={(e) => handleDialogFormChange(key, e.target.value)}
              readOnly={property.readOnly}
              className="p-inputtext-lg "
            />
          </div>
        );
      case "number":
        return (
          <div key={key} className="p-field">
            <label htmlFor={key}>{property.title}</label>
            <InputNumber
              id={key}
              value={dialogFormData[key] || ""}
              onValueChange={(e) => handleDialogFormChange(key, e.target.value)}
              className="p-inputtext-lg "
            />
          </div>
        );
      case "object":
        // Assuming object type is for file uploads
        return (
          <div key={key} className="p-field flex">
            <label htmlFor={key}>{property.title}</label>
            <FileUpload
              ref={fileInputRef}
              name={key}
              mode="basic"
              accept={property.contentMediaType}
              maxFileSize={1000000}
              customUpload={true}
              uploadHandler={(e) => handleUpload(e.files[0], key)}
              className="p-fileupload-choose custom-file-upload"
            />
          </div>
        );
      case "array":
        return (
          <div key={key} className="p-field">
            <label htmlFor={key}>{property.title}</label>
            <Dropdown
              id={key}
              value={dialogFormData[key]}
              options={property.enum.map((e: any) => ({ label: e, value: e }))}
              onChange={(e) => handleDialogFormChange(key, e.value)}
              placeholder="Select"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleUpload = async (file: any, key: any) => {
    if (!file) return;

    setFileLoading((prevLoading) => ({ ...prevLoading, [key]: true }));

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
        console.log("File uploaded, URL:", result.url);

        // Store the URL in the formData state
        setFormData({ ...formData, [key]: result.url });
        // track uploaded file key
        setUploadedFileKeys((prevKeys) => [...prevKeys, key]);
      } else {
        const text = await response.text();
        console.log("Response received:", text);
        setFormData({ ...formData, [key]: text });
        // Track uploaded file key
        setUploadedFileKeys((prevKeys) => [...prevKeys, key]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setFileLoading((prevLoading) => ({ ...prevLoading, [key]: false }));
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    // Extract type, title, and description
    const { type, title, description, ...properties } = formData;
    // Structure the data for submission
    const submissionData = {
      type,
      title,
      description,
      properties: { ...properties, hasFilter: relationId },
      relations: selectedRelationsList,
    };

    try {
      const response = await axios.post(
        API_URL + `/asset/${selectedTemplateId}`,
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
      console.log("Submitted data:", submissionData);
      console.log("Response from server:", response.data);
      router.push("/asset/asset-overview");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
      } else {
        console.error("Error:", error);
      }
    }
  };

  const handleCancel = (event: any) => {
    event.preventDefault();
    router.push("/get-template-list");
  };

  const handleReset = (event: any) => {
    event.preventDefault();

    const newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.logo_manufacturer = formData.logo_manufacturer;
    newFormData.product_icon = formData.product_icon;
    newFormData.ce_marking = formData.ce_marking;
    newFormData.documentation = formData.documentation;

    setFileUploadKey((prevKey) => prevKey + 1);

    // Exclude file-related properties from the newFormData
    Object.keys(schema?.properties || {}).forEach((key) => {
      const property = schema?.properties[key];

      if (
        property &&
        typeof property === "object" &&
        property.contentMediaType
      ) {
        // Check if the file was uploaded during form filling
        if (uploadedFileKeys.includes(key)) {
          // Exclude the file by resetting the URL
          newFormData[key] = "";
          // Reset the FileUpload component input element
        } else {
          // Handle file-related properties separately
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

    console.log(newFormData, "what's in this");

    setFormData(newFormData);
    setSelectedRelations([]);
    setSelectedRelationsList([]);
  };

  const renderField = (key: string, property: Property) => {
    const fieldClass = "col-4";
    const value = formData[key];

    return (
      <>
        {property.title === "Asset Status" ? null : property.title ===
          "URN-ID" ? null : (
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

  if (!schema) return <div>Loading...</div>;
  const handleDialogFormChange = (key: string, value: any) => {
    setDialogFormData({ ...dialogFormData, [key]: value });
  };

  const findTemplateId = async (relationType: any) => {
    if (!relationType) {
      console.error("relationType is undefined");
      return null;
    }

    console.log("relationType:", relationType);

    const fetchTemplates = async () => {
      try {
        const response = await axios.get(API_URL + `/templates`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Fetched data:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching templates:", error);
        return [];
      }
    };

    const templates = await fetchTemplates();
    console.log("Templates data:", templates);

    const formattedRelationType = relationType
      .replace("https://industry-fusion.org/types/v0.1/", "")
      .toLowerCase();

    console.log("Formatted Relation Type:", formattedRelationType);

    const matchingTemplate = templates.find((template: any) => {
      const formattedTitle = template.title
        .split(" ")
        .slice(0, 2)
        .join("")
        .toLowerCase();

      console.log("Formatted Title:", formattedTitle);

      return formattedTitle === formattedRelationType;
    });

    console.log("Matching Template:", matchingTemplate);

    return matchingTemplate ? matchingTemplate.id : null;
  };

  const handleAddButtonClick = async (relationType: string, action: string) => {
    const isEditing = !!relationType;
    console.log("Relation Type before findTemplateId:", relationType);
    const relationId = await findTemplateId(relationType);

    console.log("Relation ID:", relationId);

    if (relationId === null) {
      return;
    }

    console.log("Navigating to:", `/ics/${templateId}/${relationId}`);
    router.push({
      pathname: `/ics/${templateId}/${relationId}`,
      query: { relationType, action: "add" },
    });
  };
  const relationItemTemplate = (option: RelationItem) => {
    return (
      <div className="p-d-flex p-ai-center p-jc-between">
        <span>{option.label}</span>
        <Button
          label={option.isSubmitted ? "Edit" : "Add"}
          className="p-button-outlined p-ml-2"
          onClick={(e) => {
            e.stopPropagation();

            const action = option.isSubmitted ? "edit" : "add";
            handleAddButtonClick(option.value, action);
          }}
        />
      </div>
    );
  };

  return (
    <div className="" style={{ padding: "1rem 1rem 2rem 4rem" }}>
      {/* <Card> */}
      <div className="header">
        <p className="hover" style={{ fontWeight: "bold", fontSize: "1.9em" }}>
          Add Asset
        </p>
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          <div className=" flex p-fluid grid  shadow-lg">
            {schema.properties &&
              Object.keys(schema.properties).map((key) =>
                renderField(key, schema.properties[key])
              )}
          </div>

          <div className="flex">
            <div className="p-field col-4 mt-3 flex flex-column">
              <label className="relations-label">Relations</label>
              <MultiSelect
                value={selectedRelations}
                options={filterOptions}
                onChange={(e) => setSelectedRelations(e.value)}
                placeholder="Select Relations"
                display="chip"
                className="mt-2 relations-dropdown p-inputtext-lg"
              />
            </div>
            <div className="p-field col-4 mt-3">
              <label className="selected-relations">Selected Relations</label>
              <ListBox
                value={selectedRelations}
                options={selectedRelationsList}
                optionLabel="label"
                itemTemplate={relationItemTemplate}
                className="mt-2 p-inputtext-lg"
              />
            </div>
          </div>
          <div className="p-2 flex justify-content-end align-items-center">
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default createAssetForm;