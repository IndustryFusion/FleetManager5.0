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
