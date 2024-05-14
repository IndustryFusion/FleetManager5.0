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

import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { extname } from 'path';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

    @Post()
    @UseInterceptors(
      FileInterceptor('file', {
        fileFilter: (req, file, cb) => {
          const ext = extname(file.originalname);
          if (
            ext !== '.png' &&
            ext !== '.jpg' &&
            ext !== '.jpeg' &&
            ext !== '.pdf'
          ) {
            return cb(
              new Error(
                'Only images (.png, .jpg, .jpeg) and .pdf files are allowed!',
              ),
              false,
            );
          }
          cb(null, true);
        },
        limits: { fileSize: 1024 * 1024 * 10 },
      }),
    )

    async fileUpload(@UploadedFile() file) {
      try {
        console.log('file ',file);
        return await this.fileService.fileUpload({
          ...file
        }, 'image');
      } catch(err) {
        console.log('err ',err);
      }
    }

}
