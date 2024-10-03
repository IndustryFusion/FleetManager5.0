import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import axios, { Axios } from 'axios';

@Injectable()
export class CertificateService {

  private readonly ifricRegistryUrl = process.env.IFRIC_REGISTRY_BACKEND_URL;
  private readonly ifxPlatformUrl = process.env.IFX_PLATFORM_BACKEND_URL;
  private readonly icidServiceUrl = process.env.ICID_SERVICE_BACKEND_URL;

  async generateCompanyCertificate(company_ifric_id: string, expiry: Date, user_email: string, req: Request) {
    try {

      const companyVerified = true;

      if (!companyVerified) {
        return {
          "success": false,
          "status": 422,
          "message": "Company Verified Fail, update company with valid registration number"
        }
      }

      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };

      // check whether the last created certificate is valid or expired or not
      const checkLastCertificate = await axios.get(`${this.ifricRegistryUrl}/certificate/get-company-certificate/${company_ifric_id}`, { headers: registryHeaders });

      if (checkLastCertificate.data.length > 0) {
        const verifyLastCertificate = await axios.post(`${this.ifricRegistryUrl}/certificate/verify-company-certificate`, {
          certificate_data: checkLastCertificate.data[0].certificate_data,
          company_ifric_id,
        }, {
          headers: registryHeaders
        });

        if (verifyLastCertificate.data.valid) {
          return {
            success: false,
            status: 400,
            message: 'Cannot create more than one active certificate'
          };
        }
      }

      const response = await axios.post(`${this.ifricRegistryUrl}/certificate/create-company-certificate`, {
        company_ifric_id,
        expiry,
        user_email
      }, {
        headers: registryHeaders
      });

      return response.data;
    } catch (err) {
      if (err.response.status == 401) {
        throw new UnauthorizedException();
      }
      throw new InternalServerErrorException(`Failed to create company certificate: ${err.message}`);
    }
  }


  async getCompanyCertificates(company_ifric_id: string, req: Request) {
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };
      const companyCertificates = await axios.get(`${this.ifricRegistryUrl}/certificate/get-company-certificate/${company_ifric_id}`, { headers: registryHeaders });
      return companyCertificates.data;
    } catch (err) {
      throw err;
    }
  }


  async verifyCompanyCertificate(company_ifric_id: string, req: Request) {
    try {
            const registryHeaders = {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': req.headers['authorization']
            };
            // check whether the last created certificate is valid or expired or not
            const checkLastCertificate = await axios.get(`${this.ifricRegistryUrl}/certificate/get-company-certificate/${company_ifric_id}`, { headers: registryHeaders });
            
            if(checkLastCertificate.data.length > 0) {
              const verifyLastCertificate = await axios.post(`${this.icidServiceUrl}/certificate/verify-company-certificate`,{
                certificate_data: checkLastCertificate.data[0].certificate_data,
                company_ifric_id,
              }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              if(verifyLastCertificate.data.valid) {
                return {
                  success: true,
                  status: 201,
                  message: 'Company Verified'
                };
              }
            } else {
                return {
                  success: false,
                  status: 400,
                  message: 'no certificates found for the company'
                };
            }

    } catch (err) {
      throw err;
    }
  }

  async generateAssetCertificate(company_ifric_id: string, asset_ifric_id: string, user_email: string, expiry: Date, req: Request) {
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };
      // check whether the last created certificate is valid or expired or not
      //in get asset certificate we are verifiying the company cert
      const checkLastCertificate = await axios.get(`${this.ifxPlatformUrl}/certificate/get-asset-certificate?asset_ifric_id=${asset_ifric_id}&company_ifric_id=${company_ifric_id}`,{headers: registryHeaders});
      console.log("checkLastCertificate", checkLastCertificate.data)
      if(checkLastCertificate.data.length > 0) {
        const verifyLastCertificate = await axios.post(`${this.icidServiceUrl}/certificate/verify-asset-certificate`,{
          certificate_data: checkLastCertificate.data[0].certificate_data,
          asset_ifric_id,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("verifyLastCertificate", verifyLastCertificate.data)
        if(verifyLastCertificate.data.valid) {
          return {
            success: false,
            status: 400,
            message: 'Cannot create more than one active certificate'
          };
        }
      }
      // check whether the user is admin for DPP
      const getUserDetails = await axios.get(`${this.ifricRegistryUrl}/auth/get-user-details`,{
        params: {
          user_email,
          company_ifric_id
        }, 
        headers: registryHeaders
      })
  
      if(getUserDetails.data.length > 0) {
        const getProductDetails = await axios.get(`${this.ifricRegistryUrl}/auth/get-user-specific-product-access`,{
          params: {
            product_name: 'DPP Creator',
            user_id: getUserDetails.data[0]._id
          },
          headers: registryHeaders
        });
  
        if(getProductDetails.data.length) {
          const userProductAccessGroup = await axios.get(`${this.ifricRegistryUrl}/auth/get-access-group/${getProductDetails.data[0].access_group_id}`, {headers: registryHeaders});
          if(userProductAccessGroup.data && userProductAccessGroup.data.group_name !== 'admin') {
            return {
              "success": false,
              "status": 422,
              "message": "User is not admin for DPP to have access to create certificate"
            }
          }
        } else {
          return {
            "success": false,
            "status": 422,
            "message": "User is not admin for DPP to have access to create certificate"
          }
        }
      } else {
        throw new Error("No user found with the provided mailId");
      }

      const response = await axios.post(`${this.ifxPlatformUrl}/certificate/create-asset-certificate`,{
        asset_ifric_id,
        expiry,
      }, {
        headers: registryHeaders
      });

      return response.data;
    } catch(err) {
      throw err;
    }
  }

  async getAssetCertificates(asset_ifric_id: string, company_ifric_id: string, req: Request) {
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };
      const response = await axios.get(`${this.ifxPlatformUrl}/certificate/get-asset-certificate`,
        {
          params: {
            asset_ifric_id: asset_ifric_id,
            company_ifric_id: company_ifric_id
          },  
          headers: registryHeaders
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response && error?.response?.status === 401) {
        return {
          "success": false,
          "status": 401,
          "message": "Login Expired"
        }
      } else {
        return {
          "success": false,
          "status": 500,
          "message": error.response?.data?.message || "Error fetching certificates"
        }
      }
    }
  }

  async verifyAssetCertificate(asset_ifric_id: string, company_ifric_id:string, req :Request) {
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };
      const checkLastCertificate = await axios.get(`${this.ifxPlatformUrl}/certificate/get-asset-certificate`,
        {
          params: {
            asset_ifric_id: asset_ifric_id,
            company_ifric_id: company_ifric_id
          },  
          headers: registryHeaders
        }
      );
      console.log("checkLastCertificate", checkLastCertificate.data)
      if(checkLastCertificate.data.length > 0) {
        const verifyLastCertificate = await axios.post(`${this.icidServiceUrl}/certificate/verify-asset-certificate`,{
          certificate_data: checkLastCertificate.data[0].certificate_data,
          asset_ifric_id,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("verifyLastCertificate", verifyLastCertificate.data)
        if(verifyLastCertificate.data.valid) {
          return verifyLastCertificate.data;
        }
      } else {
        return {
          success: false,
          status: 404,
          message: 'Asset Certificates not found'
        };
      }
      
    } catch (err) {
      throw err;
    }
  }
}
