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
export interface Asset {
    id: string;
    type: string;
    manufacturer: string;
    manufacturing_year: string;
    serial_number: string;
    creation_date: string;
    asset_communication_protocol: string;
    product_icon: string;
    product_name: string;
    voltage_type: string;
    asset_manufacturer_name: string;
    asset_serial_number: string;
    asset_status?: string;
    asset_category: string;
    height: number;
    width: number;
    length: number;
    weight: number;
    ambient_operating_temperature_min: number;
    ambient_operating_temperature_max: number;
    relative_humidity_min: number;
    relative_humidity_max: number;
    atmospheric_pressure_min: number;
    atmospheric_pressure_max: number;
    dustiness_max: number;
    supply_voltage: number;
    frequency: number;
    electric_power: number;
    logo_manufacturer: string;
    documentation: string;
    ce_marking: string;
    hasObject: string;
    templateId: string;
    // Include any other properties that are common across both uses
  }

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
    default?: string;
  }
  
  export interface Schema {
    type: string;
    title: string;
    description: string;
    properties: Record<string, Property>;
  }
  // Define the interface for the schema
  export interface DynamicFormSchema {
    properties: Record<string, Property>;
    type: string;
    title: string;
    description: string;
  }
  export type FileLoadingState = {
    [key: string]: boolean;
  };