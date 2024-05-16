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
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { Badge } from "primereact/badge";
import { useRouter } from "next/router";
import axios from "axios";
import HorizontalNavbar from "../components/horizontal-navbar";
import { BlockUI } from "primereact/blockui";
import "../../public/styles/templates.css";
import Cookies from "js-cookie";
import { Toast, ToastMessage } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import Footer from "@/components/footer";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Template data type
type Template = {
  id: string;
  title: string;
  description: string;
  templateId: string;
};
const initialTemplates: Template[] = [];

const cardTitleStyle = { fontSize: "17px", color: "rgb(0, 51, 0)", padding: "1rem, 2rem, 1rem, 2rem" };
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const GetListTemplate: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTemplate, setSearchTemplate] = useState("");
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const { t } = useTranslation(['button', 'placeholder']);
  
  // Inside GetListTemplate component
  const navigateToTemplate = (id: string, title: string) => {
    localStorage.setItem("selectedTemplateId", id);
    router.push(`/asset/create/${id}`);
  };

  const showToast = (severity: ToastMessage['severity'], summary: string, message: string) => {
    toast.current?.show({ severity: severity, summary: summary, detail: message, life: 8000 });
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
    if (Cookies.get("login_flag") === "false") { router.push("/login"); }
    else { fetchTemplates(); }
  }, []);

  // Function to render templates grid based on filter
  const renderGrid = (filter: string) => {
    if (!Array.isArray(templates)) {
      return <div>Loading...</div>; // or any other loading/error state
    }

    const filteredTemplate = filteredTemplates || templates.filter(
      (template) =>
        filter === "All" ||
        template.title.toLowerCase().includes(filter.toLowerCase())
    );

    // Set 'col-12 md:col-6 lg:col-4' for three templates per row on large screens
    const columnClass = "col-12 md:col-6 lg:col-3 ";

    return (
      <div className="grid">
        {filteredTemplate.map((template) => (
          <div key={template.id} className={`${columnClass}`}>
            <Card
              title={<span style={cardTitleStyle}>{template.title}</span>}
              subTitle={
                <div>
                  <div style={{ color: "#7d7d79", marginTop: "10px" }}>{template.templateId}</div>
                  <div style={{ color: "#7d7d79", marginTop: "10px" }}>{template.description}</div>
                </div>
              }
              className="ml-3 pl-3 border-1 border-round-lg"
            >
              <Button
                label={t('button:select')}
                className="p-button-text  bg-blue-100 hover:bg-blue-200 .buttonStyle "
                style={{ color: "#4f4f4d", fontWeight: "medium", marginLeft: "2px" }}
                onClick={() => navigateToTemplate(template.id, template.title)} // Add onClick event
              />
            </Card>
          </div>
        ))}
      </div>
    );
  };

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

  //search functionality
  const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTemplate(value);

    if (value.length === 0) {
      setFilteredTemplates(null)
    } else {
      const filtered = value.length > 0 ?
        templates?.filter((template) => {
          return (
            template?.title.toLowerCase().includes(value.toLowerCase()) || template?.templateId.toLowerCase().includes(value.toLowerCase())
          )
        }) : templates;
      setFilteredTemplates(filtered)
    }

  }

  return (
    <BlockUI blocked={loading}>
      <HorizontalNavbar />
      <Toast ref={toast} />
      <div style={{ padding: "1rem 1rem 2rem 3rem", zoom: "85%",margin:"2rem 0" }}>
        <div className="flex gap-5 mb-5">
          <p className="hover" style={{ fontWeight: "bold", fontSize: "1.5rem", marginTop: "80px", marginLeft:"4px" }}>
            Asset Templates
          </p>
          <div style={{ marginTop: "5rem", marginLeft: "30rem"}}>
          <span className="p-input-icon-left" style={{width:"30rem", height:"3.5rem" }}>
                    <i className="pi pi-search" />
                    <InputText
                        value={searchTemplate}
                        onChange={onFilter}
                        placeholder={t('placeholder:searchByTemplate')}
                        style={{ borderRadius: "10px", width:"30rem", height:"3.5rem"}} 
                        type="search"
                      />    
            </span>
          </div>
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
        <Footer />
      </div>
    </BlockUI>
  );

};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'header',
        'button',
        'placeholder'
      ])),
    },
  }
}

export default GetListTemplate;
