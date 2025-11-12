export class CreateContractDto {
    contract_ifric_id: string;
    contract_name: string;
    contract_type: string;
    company_ifric_id: string;
    is_DataConsumer: boolean;
    data_type: string[];
    asset_properties: string[];
    functional_topic: [];
    clause: string;
    contract_start_type: string;
    start_date_present: boolean;
    start_date: Date;
    set_fixed_end_date: boolean;
    fixed_end_date: Date;
    set_duration: boolean;
    contract_duration: string;
    no_end_date: boolean;
    contract_scope_id: string;
    mm_all_machines: boolean;
    mm_machine_types: Record<string,any>[];
    mm_machine_models: Record<string,any>[];
    machine_scope: string;
    machine_types: Record<string,any>[];
    machine_models: Record<string,any>[];
    machines_id: Record<string,any>[];
    user_email: string;
    interval: string;
}

export class UpdateContractDto {
    contract_ifric_id?: string;
    company_ifric_id?: string;
    is_DataConsumer?: boolean;
    data_type?: string[];
    asset_properties?: string[];
    functional_topic?: [];
    clause?: string;
    user_email: string;
}
