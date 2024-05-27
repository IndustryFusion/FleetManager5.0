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

@Injectable()
export class AssetService {
  constructor(private readonly templatesService: TemplatesService) { }
  private readonly scorpioUrl = process.env.SCORPIO_URL;
  private readonly icidUrl = process.env.ICID_ORIGIN;
  private readonly assetCode = process.env.ASSETS_DEFAULT_CODE;

  /**
  * Retrieves all assets from scorpio.
  * @returns Returns an array of all asset objects.
  * @throws {Error} Throws an error if there is a failure in fetching assets from scorpio.
  * Expected behavior:
  * - Positive Test Case: Successful retrieval of asset with HTTP status code 200.
  * - Negative Test Case: NotFoundException thrown when assets not found with HTTP status code 404.
  * - Error Handling: Throws a NotFoundException in case of failure.
  */
  async getTemplateData() {
    try {
      const templateData = [];
      const templates = await this.templatesService.getTemplates();
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      for (let i = 0; i < templates.length; i++) {
        let template = templates[i];
        let id = Buffer.from(template.id, 'base64').toString('utf-8');
        const url = this.scorpioUrl + '?type=' + id;
        const response = await axios.get(url, { headers });
        if (response.data.length > 0) {
          response.data.forEach(data => {
            templateData.push(data);
          });
        }
      }

      templateData.sort((a, b) => {
        const idA = a['http://www.industry-fusion.org/schema#creation_date']?.value;
        const idB = b['http://www.industry-fusion.org/schema#creation_date']?.value;
      
        if (idA > idB) {
          return -1; 
        } else if (idA < idB) {
          return 1; 
        } else {
          return 0; 
        }
      });
      
      return templateData;
    } catch (err) {
      throw new NotFoundException(`Failed to fetch repository data: ${err.message}`);
    }
  }

  /**
   * Retrieves specific asset from scorpio.
   * @returns Returns an array of specific asset objects.
   * @throws {Error} Throws an error if there is a failure in fetching asset from scorpio.
   * Expected behavior:
   * - Positive Test Case: Successful retrieval of asset with HTTP status code 200.
   * - Negative Test Case: NotFoundException thrown when asset not found, incorrect id with HTTP status code 404.
   * - Error Handling: Throws a NotFoundException in case of failure.
   */
  async getTemplateDataById(id: string) {
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

  /**
  * stores template data(asset) to scorpio.
  * @returns Returns object with status and message data.
  * @throws {Error} Throws an error if there is a failure in storing template data to scorpio.
  * Expected behavior:
  * - Positive Test Case: Successful store of template data in scorpio with HTTP status code 201.
  * - Negative Test Case: scorpio error thrown when format error or id already present with HTTP status code 404.
  * - Error Handling: Throws a scorpio error in case of failure.
  */
  async setTemplateData(id: string, data: TemplateDescriptionDto) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };

      let checkUrl = `${this.scorpioUrl}?type=${data.type}&q=http://www.industry-fusion.org/schema%23product_name==%22${data.properties['product_name']}%22`;
      let assetData = await axios.get(checkUrl, { headers });
      if(!assetData.data.length) {
        // fetch the urn id from iffric
        let assetCodeArr = this.assetCode.split('-');
        let ifricResponse = await axios.post(`${this.icidUrl}/asset`,{
          dataspace_code: assetCodeArr[0],
          region_code: assetCodeArr[1],
          object_type_code: assetCodeArr[2],
          object_sub_type_code: assetCodeArr[3],
          machine_serial_number: data.properties["asset_serial_number"]
        },{
          headers: {
            'Content-Type': 'application/json'
          }
        })
    
        if(ifricResponse.data.status == '201'){
          const result = {
            "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
            "id": ifricResponse.data.urn_id,
            "type": data.type
          }
          let templateData = await this.templatesService.getTemplateById(id);
       
          let statusCount = -1, totalCount = -2;
          const templateProperties = templateData[0].properties;
          for(let key in templateProperties) {
            if(data.properties[key]) {
              let resultKey = "http://www.industry-fusion.org/schema#" + key;
              if (key.includes("has")) {
                let obj = {
                  type: "Relationship",
                  object: data.properties[key]
                }
                result[resultKey] = obj;
                continue;
              } else {
                if(key.includes('template')){
                  result[resultKey] = {
                    type: "Property",
                    value: templateProperties[key]['default']
                  };
                } else {
                  result[resultKey] = {
                    type: "Property",
                    value: data.properties[key]
                  };
                }
                statusCount++;
                totalCount++;
              }
            } else {
              let resultKey = "http://www.industry-fusion.org/schema#" + key;
              if (key.includes("has")) {
                let obj = {
                  type: "Relationship",
                  object: ""
                }
                result[resultKey] = obj;
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
                  result[resultKey] = {
                    type: "Property",
                    value: templateProperties[key]['default']
                  };
                } else {
                  result[resultKey] = {
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
          result["http://www.industry-fusion.org/schema#asset_status"]= {
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

  /**
  * update specific asset and their attributes in scorpio.
  * @returns Returns object with status and message data.
  * @throws {Error} Throws an error if there is a failure in updating asset in scorpio.
  * Expected behavior:
  * - Positive Test Case: Successful updation of asset in scorpio with HTTP status code 204.
  * - Negative Test Case: scorpio error thrown when id not present or attribute not present with HTTP status code 404.
  * - Error Handling: Throws a scorpio error in case of failure.
  */
  async updateAssetById(id: string, data) {
    try {
      const headers = {
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
      };
      let flag = true;
      if(data["http://www.industry-fusion.org/schema#product_name"]) {
        let productName = data["http://www.industry-fusion.org/schema#product_name"];
        let checkUrl = `${this.scorpioUrl}?type=${data.type}&q=http://www.industry-fusion.org/schema%23product_name==%22${productName}%22`;
        let assetData = await axios.get(checkUrl, { headers });

        if(assetData.data.length) {
          flag = false;
        }
      }
      if(flag) {
        data['@context'] = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.3.jsonld";
        const url = this.scorpioUrl + '/' + id + '/attrs';
        const response = await axios.post(url, data, { headers });
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
  /**
  * delete specific asset in scorpio.
  * @returns Returns object with status and message data.
  * @throws {Error} Throws an error if there is a failure in deleting asset in scorpio.
  * Expected behavior:
  * - Positive Test Case: Successful deletion of asset in scorpio with HTTP status code 204.
  * - Negative Test Case: scorpio error thrown when id not present with HTTP status code 404.
  * - Error Handling: Throws a scorpio error in case of failure.
  */
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
