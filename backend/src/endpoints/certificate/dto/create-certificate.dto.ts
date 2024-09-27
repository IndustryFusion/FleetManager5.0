export class CreateCompanyCertificateDto {
    company_ifric_id: string;
    expiry: Date;
    user_email: string;
}

export class CreateAssetCertificateDto {
    company_ifric_id: string;
    asset_ifric_id: string;
    expiry: Date;
    user_email: string;
}