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