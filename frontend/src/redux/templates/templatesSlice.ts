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

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Template {
  title: any;
  type(type: any): unknown;
  properties: {};
  id: any;
  parsedData: any;
  _id: string;
  template_title: string;
  template_data: string;
}

interface TemplatesState {
  templates: Template[];
  templateDetails: Record<string, Template>;
  status: string;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  templateDetails: {},
  status: "idle",
  error: null,
};

interface TemplateWithParsedData {
  id: string;
  title: string;
  parsedData: ParsedTemplateData;
}

interface ParsedTemplateData {
  $schema: string;
  $id: string;
  title: string;
  description: string;
  type: string;
  required: string[];
  properties: Record<string, any>;
}
export const fetchTemplates = createAsyncThunk(
  "templates/fetchTemplates",
  async () => {
    try {
      // Fetch the list of templates
      const listResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL}/mongodb-templates`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const templateList = listResponse.data;

      // Fetch detailed data for each template
        const detailedTemplates = await Promise.all(
        templateList.map(async (template: any) => {
          try {
            const detailResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL}/mongodb-templates/${encodeURIComponent(template.title)}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const detailedTemplate = Array.isArray(detailResponse.data) ? detailResponse.data[0] : detailResponse.data;
            if (!detailedTemplate || typeof detailedTemplate.template_data !== 'string') {
              console.warn(`Invalid detailed template data for ${template.title}`);
              throw new Error("Invalid detailed template data");
            }
            const parsedData: ParsedTemplateData = JSON.parse(detailedTemplate.template_data);
            return {
              id: detailedTemplate._id,
              title: template.title,
              description: template.description,
              templateId: template.templateId,
              parsedData: parsedData,
            };
          } catch (error) {
            console.error(`Error fetching or parsing template data for ${template.title}:`, error);
            // Return a partial object with the data we have from the list
            return {
              id: template.id,
              title: template.title,
              description: template.description,
              templateId: template.templateId,
              parsedData: null,
            };
          }
        })
      );

      const detailedTemplatesById = detailedTemplates.reduce((acc, template) => {
        acc[template.id] = template;
        return acc;
      }, {} as Record<string, TemplateWithParsedData>);

      return detailedTemplatesById;
    } catch (error) {
      console.error("Error in fetchTemplates:", error);
      throw error;
    }
  }
);
const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchTemplates.fulfilled,
        (state, action: PayloadAction<Record<string, Template>>) => {
          state.status = "succeeded";
          state.templateDetails = action.payload;
          state.templates = Object.values(action.payload);
        }
      )
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default templatesSlice.reducer;
