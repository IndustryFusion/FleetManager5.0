import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { Badge } from "primereact/badge";
import { useRouter } from "next/router";
import axios from "axios";
import HorizontalNavbar from "../components/horizontal-navbar";
import { BlockUI } from "primereact/blockui";
import "../../public/styles/templates.css";
import Cookies from "js-cookie";
// Template data type
type Template = {
  id: string;
  title: string;
  description: string;
};
const cardTitleStyle = { fontSize: "17px", color: "#54a60a", padding:"1rem, 2rem, 1rem, 2rem" };
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// GetListTemplate component
const GetListTemplate: React.FC = () => {
  // State for storing templates and sidebar visibility
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectTemplateId, setselectTemplateId] = useState(null);
  // Function to handle button click and navigate to the template detail page
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Inside GetListTemplate component
  const navigateToTemplate = (id: string, title: string) => {
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    if (Cookies.get("login_flag") === "false") { router.push("/login"); } 
        else { fetchTemplates(); }
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
    const columnClass = "col-12 md:col-6 lg:col-3 ";

    return (
      <div className="grid">
        {filteredTemplates.map((template) => (
          <div key={template.id} className={`${columnClass}`}>
            <Card
              title={<span  style={cardTitleStyle}>{template.title}</span>}
              subTitle={<span  style={{color:"#7d7d79", marginTop:"10px"}}>{ template.description}</span>}
              className="ml-3 pl-3 border-1 border-round-lg"
            >
              <Button
                label="Select"
                className="p-button-text  bg-blue-100 hover:bg-blue-200 .buttonStyle " 
                style={{color:"#4f4f4d", fontWeight:"medium", marginLeft:"2px"}}
                onClick={() => navigateToTemplate(template.id, template.title)} // Add onClick event
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
    <BlockUI blocked={loading}>
      <HorizontalNavbar />
      <div style={{padding: "1rem 1rem 2rem 3rem", zoom:"85%"}}>
        <div>
          <p className="hover" style={{fontWeight:"bold", fontSize: "1.5rem", marginTop: "80px" }}>
            Asset Templates
          </p>
        </div>
        <div className="mt-4" style={{ width: "100%" }}>
          <div className="flex flex-column align-items-left">

            <Card className="border-gray-800 border-1 border-round-lg">
              <TabView className="-ml-3 -mt-5 ">
                <TabPanel header={allTabHeader}>{renderGrid("All")}</TabPanel>
                <TabPanel header="Air filter">
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
    </BlockUI>
  );
};

export default GetListTemplate;
