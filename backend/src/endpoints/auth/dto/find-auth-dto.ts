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
  product_name: string;
  company_ifric_id: string;
  route: string;
}