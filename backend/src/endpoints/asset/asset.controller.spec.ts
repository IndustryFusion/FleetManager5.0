import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

describe('AssetController', () => {
  let controller: AssetController;
  let service: AssetService;
  const mockProvider = {
    setTemplateData: jest.fn((dto) => {
      if (!dto.type || !dto.properties) {
        const response = {
          status: 400,
          statusText: 'Bad Request',
          data: {
            "detail": "An entity type is mandatory",
            "type": "https://uri.etsi.org/ngsi-ld/errors/BadRequestData",
            "title": "Bad Request Data."
          }
        }
        const error = new Error('Bad Request');
        error['response'] = response;
        throw error;
      } else {
        return {
          status: '201',
          statusText: "Created",
          data: ''
        }
      }
    }),
    getTemplateData: jest.fn(() => {
      return []
    }),
    getTemplateDataById: jest.fn((id) => {
      return {}
    }),
    deleteAssetById: jest.fn((id) => {
      return {
        status: '204',
        statusText: "No Content",
        data: ''
      }
    }),
    updateAssetById: jest.fn((id, data) => {
      if (Object.keys(data).length == 0) {
        const response = {
          status: 500,
          statusText: "Internal Server Error",
          data: {
            "detail": "Index 0 out of bounds for length 0",
            "type": "https://uri.etsi.org/ngsi-ld/errors/InternalError",
            "title": "Internal error"
          }
        }
        const error = new Error('Internal error');
        error['response'] = response;
        throw error;
      } else if (data.hasOwnProperty("http://www.industry-fusion.org/schema#electricpower")) {
        const response = {
          status: 404,
          statusText: "Not Found",
          data: {
            "detail": "urn:ngsi-ld:asset:2:03 was not found",
            "type": "https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound",
            "title": "Resource not found."
          }
        }
        const error = new Error('Not Found');
        error['response'] = response;
        throw error;
      } else {
        return {
          status: '204',
          statusText: "No Content",
          data: ''
        }
      }
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [AssetService],
    }).overrideProvider(AssetService).useValue(mockProvider).compile();

    controller = module.get<AssetController>(AssetController);
    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockReq = {
    "type": "https://industry-fusion.org/types/v0.1/plasma-cutter",
    "title": "Plasma cutter template",
    "description": "Properties for type plasma cutter",
    "properties": {
      "machine_state": "Testing",
      "electric_power": 154,
      "frequency": 2545,
      "hasFilter": {
        "relationship": "https://industry-fusion.org/types/v0.1/air-filter",
        "$ref": "air_filter_schema.json"
      }
    }
  }
  const mockToken = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJoR3picUdnYnU3cHdxRXZYSHBYM19JTlFFVlpCMTBTVjh0SHNfSTJFSWJnIn0.eyJleHAiOjE3MzU5MDA4MzEsImlhdCI6MTcwNDM2NDgzMSwianRpIjoiMGQwOTkxZDMtMDgzZi00MDE3LThkZTktNzU3YmQ3ZDAwNjE0IiwiaXNzIjoiaHR0cHM6Ly9kZXZlbG9wbWVudC5pbmR1c3RyeS1mdXNpb24uY29tL2F1dGgvcmVhbG1zL2lmZiIsImF1ZCI6WyJvaXNwLWZyb250ZW5kIiwiZnVzaW9uLWJhY2tlbmQiLCJhY2NvdW50Il0sInN1YiI6IjMzMTE0OGNkLTM1MGUtNGIzZi04ZmZkLTRmMjQ1ZDBhY2I3MSIsInR5cCI6IkJlYXJlciIsImF6cCI6InNjb3JwaW8iLCJzZXNzaW9uX3N0YXRlIjoiODQxNzQ1OWMtNTBlOC00MTU3LWEwNGItYjgwZWIzYzdkNDEzIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtaWZmIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImZ1c2lvbi1iYWNrZW5kIjp7InJvbGVzIjpbIkZBQ1RPUllfTUFOQUdFUiIsIkZMRUVUX01BTkFHRVIiLCJFQ09TWVNURU1fTUFOQUdFUiJdfSwib2lzcC1mcm9udGVuZCI6eyJyb2xlcyI6WyJ1c2VyIl19LCJzY29ycGlvIjp7InJvbGVzIjpbIkZhY3RvcnktQWRtaW4iLCJGYWN0b3J5LVdyaXRlciIsIkZhY3RvcnktUmVhZGVyIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9pc3AtZnJvbnRlbmQgYWNjb3VudHMgZW1haWwgcHJvZmlsZSBvZmZsaW5lX2FjY2VzcyB0eXBlIiwic2lkIjoiODQxNzQ1OWMtNTBlOC00MTU3LWEwNGItYjgwZWIzYzdkNDEzIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImZhY3RvcnlfYWRtaW4iLCJhY2NvdW50cyI6W3siaWQiOiJjNDcxMmMxNC1lZWVlLTQ4ODEtODU2ZS1jNWZiNTE1MzJjOTQiLCJyb2xlIjoiYWRtaW4ifV0sImdpdmVuX25hbWUiOiIiLCJ0eXBlIjoidXNlciIsImZhbWlseV9uYW1lIjoiIiwiZW1haWwiOiJmYWN0b3J5X2FkbWluQGluZHVzdHJ5LWZ1c2lvbi5jb20ifQ.tQ7xmGc33JsiiMaxpKxq8G5MSyxPAfOM_ZPDMLpfBEotgNWtmbgcbrrPG9H5u3gm70nHgHqauCA10MfKvW19aGzsCXhRWT0UcW1qpXb8KqNbvSaNwBdVXEN3nIidIJ0sfdXSpjq0S-oZ-gR6_1ZootNV_BSSBnbTZJuBb-q5dZmjHuQgHQY6UTs35yLsgwY_BFicWKwll7FIMV4pcSvAoB92_iT6Asty83reVxQnH60YmIw69fBV_6qgO7tstfMBtdGFdKd-iDYAnIPn2V3ic-u6HQbQboPeKgszPJXb5Y46dp5ulYcgcNfJdLeK7N24-tQEmgFVtOJdoVQDRr3XfA";

  // it('should add asset', async () => {
  //   const result = await controller.setTemplateData(mockReq);
  //   expect(result).toEqual({
  //     "message": "Created",
  //     "status": "201",
  //     "success": true,
  //   })
  // })

  it('post should return Bad Request Data', async () => {
    const mockValue = {
      "title": "Plasma cutter template",
      "description": "Properties for type plasma cutter",
      "properties": {
        "machine_state": "Testing",
        "electric_power": 154,
        "frequency": 2545,
        "hasFilter": {
          "relationship": "https://industry-fusion.org/types/v0.1/air-filter",
          "$ref": "air_filter_schema.json"
        }
      }
    };
  });
  //   const result = await controller.setTemplateData(mockValue);
  //   expect(result).toEqual({
  //     "success": false,
  //     "status": 400,
  //     "message": {
  //       "detail": "An entity type is mandatory",
  //       "type": "https://uri.etsi.org/ngsi-ld/errors/BadRequestData",
  //       "title": "Bad Request Data."
  //     }
  //   })
  // })

  // it('should return all assets', async () => {
  //   const result = await controller.getTemplateData();
  //   expect(result).toEqual([])
  // })

  // it('should return specific asset', async () => {
  //   const id = 'urn:ngsi-ld:asset:2:13';
  //   const result = await controller.getTemplateDataById(id);
  //   expect(result).toEqual({})
  // })

  // it('should delete specific asset', async () => {
  //   const id = 'urn:ngsi-ld:asset:2:09';
  //   const result = await controller.deleteAssetById(id);
  //   expect(result).toEqual({
  //     success: true,
  //     status: "204",
  //     message: 'Deleted Successfully'
  //   })
  // })

  // it('should update specific asset', async () => {
  //   const id = 'urn:ngsi-ld:asset:2:03';
  //   const mockData = {
  //     "http://www.industry-fusion.org/schema#electric_power": {
  //       "type": "Property",
  //       "value": "145"
  //     }
  //   }
  //   const result = await controller.updateAssetById(id, mockData);
  //   expect(result).toEqual({
  //     success: true,
  //     status: "204",
  //     message: 'Updated Successfully'
  //   })
  // })

  // it('patch should return 500 Internal error', async () => {
  //   const id = 'urn:ngsi-ld:asset:2:03';
  //   const mockData = {
  //   }
  //   const result = await controller.updateAssetById(id, mockData);
  //   expect(result).toEqual({
  //     "success": false,
  //     "status": 500,
  //     "message": {
  //       "detail": "Index 0 out of bounds for length 0",
  //       "type": "https://uri.etsi.org/ngsi-ld/errors/InternalError",
  //       "title": "Internal error"
  //     }
  //   })
  // })

  // it('patch should return 404 Resource not found', async () => {
  //   const id = 'urn:ngsi-ld:asset:2:03';
  //   const mockData = {
  //     "http://www.industry-fusion.org/schema#electricpower": {
  //       "type": "Property",
  //       "value": "145"
  //     }
  //   }
  //   const result = await controller.updateAssetById(id, mockData);
  //   expect(result).toEqual({
  //     "success": false,
  //     "status": 404,
  //     "message": {
  //       "detail": "urn:ngsi-ld:asset:2:03 was not found",
  //       "type": "https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound",
  //       "title": "Resource not found."
  //     }
  //   })
  // })
});
