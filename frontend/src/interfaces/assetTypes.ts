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
    urn_id: string;
    asset_manufacturer_name: string;
    asset_serial_number: string;
    [key: string]: any; // Index signature
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
  
    // Include any other properties that are common across both uses
  }