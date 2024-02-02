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
