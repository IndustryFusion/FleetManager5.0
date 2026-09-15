export interface FindOneAuthDto {
  email: string;
  password: string;
  product_name: string;
}

export interface FindIndexedDbAuthDto {
  token: string;
  product_name: string;
}

export interface EncryptRouteDto {
  token: string;
  // The masked refresh token (ifricdr). Optional: without it the target app
  // gets a session that cannot refresh, as before.
  refresh_token?: string;
  product_name: string;
  company_ifric_id: string;
  route: string;
}

export interface CompanyTwinDto {
    owner_company_ifric_id?: string; 
    manufacturer_ifric_id?: string;
    asset_ifric_id?: string;
}