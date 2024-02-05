import { Injectable, NotFoundException } from '@nestjs/common';
import { TemplateDescriptionDto } from '../templates/dto/templateDescription.dto';
import { TemplatesService } from '../templates/templates.service';
import axios from 'axios';

@Injectable()
export class AssetService {
  constructor(private readonly templatesService: TemplatesService) { }
  private readonly scorpioUrl = process.env.SCORPIO_URL;

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
      console.log('templates ', templates);
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      for (let i = 0; i < templates.length; i++) {
        let template = templates[i];
        let id = Buffer.from(template.id, 'base64').toString('utf-8')
        const url = this.scorpioUrl + '?type=' + id;
        const response = await axios.get(url, { headers });
        if (response.data.length > 0) {
          response.data.forEach(data => {
            templateData.push(data);
          });
        }
      }
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
      //fetch the last urn from scorpio and create a new urn
      const fetchLastUrnUrl = `${this.scorpioUrl}/urn:ngsi-ld:id-store`;
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      let getLastUrn = await axios.get(fetchLastUrnUrl, {
        headers
      });
      getLastUrn = getLastUrn.data;
      let newUrn = '';
      
      try {
        for (let key in getLastUrn) {
          if (key.includes('last-urn')) {
            newUrn = getLastUrn[key]['value'].split(':')[4];
            newUrn = (parseInt(newUrn, 10) + 1).toString().padStart(newUrn.length, "0");
          }
        }
      }
      catch (e) {
        console.log(e);
      }

      const result = {
        "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
        "id": `urn:ngsi-ld:asset:2:${newUrn}`,
        "type": data.type
      }
      
      for (let key in data.properties) {
        let resultKey = "http://www.industry-fusion.org/schema#" + key;
        if (key.includes("has")) {
          let obj = {
            type: "Relationship",
            object: data.properties[key]
          }
          result[resultKey] = obj;
        } else {
          result[resultKey] = data.properties[key];
        }
      }
      
      const lastURNVar = { 
        "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
        "last-urn": { "type": "Property", "value": `urn:ngsi-ld:asset:2:${newUrn}`}
      };

      const updateLastUrnUrl = `${this.scorpioUrl}/urn:ngsi-ld:id-store/attrs`;
      try{
        await axios.patch(updateLastUrnUrl, lastURNVar, { headers });
      }
      catch(e){
        console.log(e)
      }

      //store the template data to scorpio
      const response = await axios.post(this.scorpioUrl, result, { headers });
      console.log('response ', response.statusText);
      return {
        id: result.id,
        status: response.status,
        statusText: response.statusText,
        data: response.data
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
      data['@context'] = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.3.jsonld";
      const headers = {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      };
      const url = this.scorpioUrl + '/' + id + '/attrs';
      const response = await axios.post(url, data, { headers });
      return {
        status: response.status,
        data: response.data
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
