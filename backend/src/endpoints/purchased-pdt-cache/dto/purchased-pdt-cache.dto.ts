export class CreatePurchasedPdtCacheDto {
    company_ifric_id: string;
    product_name: string;
    product_image: string;
    type: string;
    asset_status: string;
    asset_category: string;
    brand_image: string;
    brand: string;
    creation_date: string;
    asset_cert_valid: boolean;
    asset_serial_number: string
    archived: boolean;
    production_date: string;
    isPurchased: boolean;
    isScorpioUpadted: boolean;
    isCacheUpdated: boolean;
    factory_site: string;
    shop_floor: string;
    product_line: string;
    report: [];
    meta_data: Record<string,any>
}

export class UpdatePurchasedPdtCacheDto {
    
}