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

import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { S3 } from 'aws-sdk';

describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [FileService],
    }).compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  it('should upload a file', async () => {
    // Mock file data
    const mockFile = {
      fieldname: 'file',
      buffer: Buffer.from('mock-file-content'),
      originalname: 'mock-file.png',
    };

    // Mock the file service method
    const mockUploadResponse = 'mock-upload-location';
    jest.spyOn(fileService, 'fileUpload').mockResolvedValue(mockUploadResponse);

    // Call the controller method
    const result = await controller.fileUpload(mockFile);

    // Assertions
    expect(result).toEqual(mockUploadResponse);
    expect(fileService.fileUpload).toHaveBeenCalledWith(mockFile, 'image');
  });

  it('should throw Only Image error', async () => {
    // Mock file data
    const mockFile = {
      fieldname: 'file',
      buffer: Buffer.from('mock-file-content'),
      originalname: 'mock-file.xls',
    };

    // Mock the file service method
    const mockUploadResponse = 'Only images (.png, .jpg, .jpeg) and .pdf files are allowed!';
    jest.spyOn(fileService, 'fileUpload').mockResolvedValue(mockUploadResponse);

    // Call the controller method
    const result = await controller.fileUpload(mockFile);

    // Assertions
    expect(result).toEqual(mockUploadResponse);
    expect(fileService.fileUpload).toHaveBeenCalledWith(mockFile, 'image');
  });
});
