import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CertificateService {
  
  private readonly ifricRegistryUrl = process.env.IFRIC_REGISTRY_BACKEND_URL;
  private readonly ifxPlatformUrl = process.env.IFX_PLATFORM_BACKEND_URL;
  private readonly icidServiceUrl = process.env.ICID_SERVICE_BACKEND_URL;

  async generateCompanyCertificate(company_ifric_id: string, expiry: Date, user_email: string, req: Request) {
    try {

      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };
      // check whether the last created certificate is valid or expired or not
      const checkLastCertificate = await axios.get(`${this.ifricRegistryUrl}/certificate/get-company-certificate/${company_ifric_id}`, {headers: registryHeaders});
      
      if(checkLastCertificate.data.length > 0) {
        const verifyLastCertificate = await axios.post(`${this.ifricRegistryUrl}/certificate/verify-company-certificate`,{
          certificate_data: checkLastCertificate.data[0].certificate_data,
          company_ifric_id,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if(verifyLastCertificate.data.valid) {
          return {
            success: false,
            status: 400,
            message: 'Cannot create more than one active certificate'
          };
        }
      }

      const response = await axios.post(`${this.ifricRegistryUrl}/certificate/create-company-certificate`,{
        company_ifric_id,
        expiry,
        user_email
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch(err) {
      throw err;
    }
  }

  async generateAssetCertificate(company_ifric_id: string, asset_ifric_id: string, user_email: string, expiry: Date, req: Request) {
    try {
      console.log("start")
      // check whether the last created certificate is valid or expired or not
      //in get asset certificate we are verifiying the company cert
      const checkLastCertificate = await axios.get(`${this.ifxPlatformUrl}/certificate/get-asset-certificate?asset_ifric_id=${asset_ifric_id}&company_ifric_id=${company_ifric_id}`);
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
        }
      })
  
      if(getUserDetails.data.length > 0) {
        const getProductDetails = await axios.get(`${this.ifricRegistryUrl}/auth/get-user-specific-product-access`,{
          params: {
            product_name: 'DPP Creator',
            user_id: getUserDetails.data[0]._id
          }
        });
  
        if(getProductDetails.data.length) {
          const userProductAccessGroup = await axios.get(`${this.ifricRegistryUrl}/auth/get-access-group/${getProductDetails.data[0].access_group_id}`);
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
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch(err) {
      throw err;
    }
  }
}
