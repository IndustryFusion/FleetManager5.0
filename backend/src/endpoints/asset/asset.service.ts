// 
// Copyright (c) 2024 IB Systems GmbH 
// 
// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 
// 
//   http://www.apache.org/licenses/LICENSE-2.0 
// 
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License. 
// 

import { Injectable, NotFoundException } from '@nestjs/common';
import { TemplateDescriptionDto } from '../templates/dto/templateDescription.dto';
import { TemplatesService } from '../templates/templates.service';
import axios from 'axios';
import * as moment from 'moment';
import { Request } from 'express';
@Injectable()
export class AssetService {
  constructor(private readonly templatesService: TemplatesService) { }
  private readonly scorpioUrl = process.env.SCORPIO_URL;
  private readonly icidUrl = process.env.ICID_SERVICE_BACKEND_URL;
  private readonly assetCode = process.env.ASSETS_DEFAULT_CODE;
  private readonly context = process.env.CONTEXT;
  private readonly registryUrl = process.env.IFRIC_REGISTRY_BACKEND_URL;

  async getAssetData(company_ifric_id: string, req: Request) {
    try {
      const assetData = [];
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };
      const assetIds = await axios.get(`${this.registryUrl}/auth/get-manufacturer-asset/${company_ifric_id}`, { headers: registryHeaders });
      if(assetIds.data.length > 0) {
        for (let i = assetIds.data.length - 1; i >= 0; i--) {
          let assetId = assetIds.data[i].asset_ifric_id;
          try {
            const response = await this.getAssetDataById(assetId);
            if(Object.keys(response).length > 0) {
              assetData.push(response);
            }
          } catch(err) {
            if (err.response && err.response.statusCode === 404) {
              continue;
            } else {
              throw new NotFoundException(`Failed to fetch repository data: ${err.message}`);
            }
          }
        }
      }
      return assetData;
    } catch (err) {
      throw new NotFoundException(`Failed to fetch repository data: ${err.message}`);
    }
  }

  async getAssetDataById(id: string) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      const url = this.scorpioUrl + '/' + id;
      const response = await axios.get(url, { headers });
      if (response.data) {
        return response.data;
      } else {
        throw new NotFoundException('asset not found');
      }
    } catch (err) {
      throw new NotFoundException(`Failed to fetch repository data: ${err.message}`);
    }
  }

  async getkeyValuesById(id: string) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      const url = this.scorpioUrl + '/' + id + '?options=keyValues';
      const response = await axios.get(url, { headers });
      if (response.data) {
        return response.data;
      } else {
        throw new NotFoundException('asset not found');
      }
    } catch (err) {
      throw new NotFoundException(`Failed to fetch repository data: ${err.message}`);
    }
  }

  async getAssetByType(type: string) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      const url = this.scorpioUrl + '?type=' + type;
      const response = await axios.get(url, { headers });
      if (response.data) {
        return response.data;
      } else {
        throw new NotFoundException('asset not found');
      }
    } catch (err) {
      throw new NotFoundException(`Failed to fetch repository data: ${err.message}`);
    }
  }

  async getManufacturerCompanyAsset(id: string, req: Request) {
    try {
      console.log("id ",id)
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };

      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };

      const result = [];
/*       const companyData = await axios.get(`${this.registryUrl}/auth/get-company-details/${id}`, { headers: registryHeaders });
      if (companyData.data.length === 0) {
        throw new Error("No company found with the provided ID");
      } */

      const companyTwinData = await axios.get(`${this.registryUrl}/auth/get-manufacturer-asset/${id}`, { headers: registryHeaders });  
      for(let i = 0; i < companyTwinData.data.length; i++) {
        try {
          const url = this.scorpioUrl + '/' + companyTwinData.data[i].asset_ifric_id;
          const response = await axios.get(url, { headers });
  
          if(response.data) {
            const ownerCompanyData = await axios.get(`${this.registryUrl}/auth/get-company-details-id/${companyTwinData.data[i].owner_company_id}`, { headers: registryHeaders });
            if(ownerCompanyData.data) {
              result.push({
                owner_company_name: ownerCompanyData.data[0].company_name,
                owner_company_image: ownerCompanyData.data[0].company_image,
                assetData: response.data
              });
            }
          }
        } catch(err) {
          console.log("Failed for few assets::", err?.message);
          continue;
        }
      }
      return result;
    } catch (err) {
      throw new NotFoundException(`Failed to fetch repository data: ${err.message}`);
    }
  }

  async setAssetData(id: string, data: TemplateDescriptionDto) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      let productKey = Object.keys(data).find(key => key.includes('product_name'));
      let checkUrl = `${this.scorpioUrl}?type=${data.type}&q=${productKey}==%22${data.properties['product_name']}%22`;
      let assetData = await axios.get(checkUrl, { headers });
      if(!assetData.data.length) {
        // fetch the urn id from iffric
        let assetCodeArr = this.assetCode.split('-');
        let ifricResponse = await axios.post(`${this.icidUrl}/asset`,{
          dataspace_code: assetCodeArr[0],
          region_code: assetCodeArr[1],
          object_type_code: assetCodeArr[2],
          object_sub_type_code: assetCodeArr[3],
          machine_serial_number: data.properties["iffs:asset_serial_number"]
        },{
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if(ifricResponse.data.status == '201'){
          const result = {
            "@context": this.context,
            "id": ifricResponse.data.urn_id,
            "type": data.type
          }
          let templateData = await this.templatesService.getTemplateById(id);
       
          let statusCount = -1, totalCount = -2, statusKey = '';
          const templateProperties = templateData[0].properties;
          for(let key in templateProperties) {
            if(data.properties[key]) {
              if (key.includes("has")) {
                let obj = {
                  type: "Relationship",
                  object: data.properties[key]
                }
                result[key] = obj;
                continue;
              } else {
                if(key.includes('template')){
                  result[key] = {
                    type: "Property",
                    value: templateProperties[key]['default']
                  };
                } else {
                  result[key] = {
                    type: "Property",
                    value: data.properties[key]
                  };
                }
                statusCount++;
                totalCount++;
              }
            } else {
              if (key.includes("has")) {
                let obj = {
                  type: "Relationship",
                  object: ""
                }
                result[key] = obj;
                continue;
              } else {
                let emptyValue;
                if(templateProperties[key].type == 'number'){
                  emptyValue = 0;
                } else if (templateProperties[key].type == 'object'){
                  emptyValue = 'NULL';
                } else if (templateProperties[key].type == 'array'){
                  emptyValue = ['NULL'];
                } else {
                  emptyValue = 'NULL';
                }
                if(key.includes('template')){
                  result[key] = {
                    type: "Property",
                    value: templateProperties[key]['default']
                  };
                } else if (key.includes('iffr')) {
                  result[key] = {
                    type: "Property",
                    value: 222
                  };
                } else if(key.includes('asset_status')) {
                  statusKey = key;
                } else {
                  result[key] = {
                    type: "Property",
                    value: emptyValue
                  };
                }
                totalCount++;
              }
            }
          }
        
          let statusValue: string;
          if(statusCount === totalCount) {
            statusValue = "complete"
          } else {
            statusValue = "incomplete"
          }
          result[statusKey]= {
            type: "Property",
            value: statusValue
          }
  
     
          //store the template data to scorpio
          const response = await axios.post(this.scorpioUrl, result, { headers });
      
          return {
            id: result.id,
            status: response.status,
            statusText: response.statusText,
            data: response.data
          }
        }else{
          return {
            "success": false,
            "status": ifricResponse.data.status,
            "message": ifricResponse.data.message
          }
        }
      } else{
        return {
          "success": false,
          "status": 409,
          "message": "Product Name Already Exists"
        }
      }
      
    } catch (err) {
      throw err;
    }
  }

  async updateAssetById(id: string, data) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
      };
      let flag = true;
      const productKey = Object.keys(data).find(key => key.includes("product_name"));
      if(productKey) {
        let productName = data[productKey];
        let checkUrl = `${this.scorpioUrl}?type=${data.type}&q=${productKey}==%22${productName}%22`;
        let assetData = await axios.get(checkUrl, { headers });

        if(assetData.data.length) {
          flag = false;
        }
      }
      if(flag) {
        let updatedData = {};
        let assetData = await this.getAssetDataById(id);
        Object.keys(data).forEach(key => {
          const actualKey = Object.keys(assetData).find(assetDataKey => assetDataKey.includes(key));
          if(actualKey !== undefined) {
            updatedData[actualKey] = { ...assetData[actualKey], value: data[key] };
          }
        });
        updatedData['@context'] = this.context;
        const url = this.scorpioUrl + '/' + id + '/attrs';
        const response = await axios.post(url, updatedData, { headers });
        return {
          status: response.status,
          data: response.data
        }
      } else {
        return {
          "success": false,
          "status": 409,
          "message": "Product Name Already Exists"
        }
      }
    } catch (err) {
      throw err;
    }
  }
  
  async deleteAssetById(id: string) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      const url = this.scorpioUrl + '/' + id;
      const response = await axios.delete(url, { headers });
      return {
        status: response.status,
        data: response.data
      }
    } catch (err) {
      throw err;
    }

  }
}
