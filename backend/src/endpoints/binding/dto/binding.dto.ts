export class CreateBindingDto {
    contract_ifric_id: string;
    company_ifric_id: string;
    is_DataProvider: boolean;
    asset_id: Record<string, any>[];
    action_status: string;
    contract_status: string;
    signed_date: Date;
    valid_till_date: Date;    
    user_email: string;
}


export class UpdateBindingDto {
    contract_ifric_id?: string;
    binding_ifric_id?: string;
    company_ifric_id?: string;
    is_DataProvider?: boolean;
    asset_id?: Record<string, any>[];
    action_status?: string;
    contract_status?: string;
    signed_date?: Date;
    valid_till_date?: Date;    
    user_email: string;
}

