import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { Badge } from "primereact/badge";
import { useRouter } from "next/router";
import axios from "axios";

// Template data type
type Template = {
  id: string;
  title: string;
  description: string;
};

// Styles
const buttonStyle = {
  backgroundColor: "transparent",
  color: "#4da5ff",
  border: "none",
};

const cardTitleStyle = { fontSize: "16px" };

const cardStyle: any = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  position: "relative",
  padding: "1rem",
};

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// GetListTemplate component
const GetListTemplate: React.FC = () => {
  // State for storing templates and sidebar visibility
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectTemplateId, setselectTemplateId] = useState(null);
  // Function to handle button click and navigate to the template detail page

  const router = useRouter();

  // Inside GetListTemplate component
  const navigateToTemplate = (id: string) => {
    // Store the selected template ID in localStorage
    localStorage.setItem("selectedTemplateId", id);

    // Navigate to the /ics page
    router.push(`/asset/create/${id}`);
  };

  // Fetching templates from the backend
  //${process.env.APP_URL}
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/templates`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Fetched data:", response.data);
        setTemplates(response.data);

        // Storing data in localStorage
        localStorage.setItem("templates", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // Function to render templates grid based on filter
  const renderGrid = (filter: string) => {
    if (!Array.isArray(templates)) {
      return <div>Loading...</div>; // or any other loading/error state
    }

    const filteredTemplates = templates.filter(
      (template) =>
        filter === "All" ||
        template.title.toLowerCase().includes(filter.toLowerCase())
    );

    // Set 'col-12 md:col-6 lg:col-4' for three templates per row on large screens
    const columnClass = "col-12 md:col-6 lg:col-4 ";

    return (
      <div className="grid">
        {filteredTemplates.map((template) => (
          <div key={template.id} className={`${columnClass}`}>
            <Card
              title={<span style={cardTitleStyle}>{template.title}</span>}
              subTitle={template.description}
              style={cardStyle}
              className="ml-1 pl-2  border-1 border-round-lg"
            >
              <Button
                label="Select"
                style={{
                  ...buttonStyle,
                  position: "absolute",
                  bottom: "10px",
                  right: "40%",
                }}
                className="p-button-text hover:bg-blue-100 "
                onClick={() => navigateToTemplate(template.id)} // Add onClick event
              />
            </Card>
          </div>
        ))}
      </div>
    );
  };
  // Header for the 'All' tab with badge for number of templates
  const allTabHeader = (
    <span className="">
      All
      {/* Icon for how many templates loaded */}
      <i
        className="pi pi-bell p-overlay-badge ml-3"
        style={{ fontSize: "0.3rem" }}
      >
        <Badge value={templates.length}></Badge>
      </i>
    </span>
  );

  // Component render
  return (
    <div className="mt-8 ml-6">
      <div className="-mt-3">
        <h5 className="text-lg" style={{}}>
          Select Templates
        </h5>
      </div>
      <div className=" mt-4" style={{ width: "100%" }}>
        <div className="flex flex-column align-items-left">
          <h4 className="-mt-1"> Templates</h4>

          <Card className="border-gray-800 border-1 border-round-lg">
            <TabView className="-ml-3 -mt-5 ">
              <TabPanel header={allTabHeader}>{renderGrid("All")}</TabPanel>
              <TabPanel header="Air filter" className="">
                {renderGrid("Air filter")}
              </TabPanel>
              <TabPanel header="Laser cutter">
                {renderGrid("Laser cutter")}
              </TabPanel>
              <TabPanel header="Plasma cutter">
                {renderGrid("Plasma cutter")}
              </TabPanel>
            </TabView>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GetListTemplate;
