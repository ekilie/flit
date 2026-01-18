import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CloudinaryService } from 'src/lib/cloudinary/cloudinary.service';

@ApiTags('Media')
@ApiBearerAuth('JWT')
@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a file to Cloudinary (images, documents, etc.)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name in Cloudinary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req: any, file: any, cb: any) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'audio/mpeg',
          'audio/wav',
          'video/mp4',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.cloudinaryService.uploadFile(
        file,
        folder || 'flit',
      );

      return {
        status: 'success',
        message: 'File uploaded successfully to Cloudinary',
        url: result.secure_url,
        publicId: result.public_id,
        metadata: {
          original_name: file.originalname,
          file_type: result.resource_type,
          format: result.format,
          file_size: result.bytes,
          width: result.width,
          height: result.height,
          upload_time: result.created_at,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload file to Cloudinary');
    }
  }

  @Post('upload-base64')
  @ApiOperation({ summary: 'Upload a base64 encoded file to Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'Base64 encoded file data',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name in Cloudinary',
        },
      },
    },
  })
  async uploadBase64(
    @Body('data') data: string,
    @Body('folder') folder?: string,
  ) {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    try {
      const result = await this.cloudinaryService.uploadBase64(
        data,
        folder || 'flit',
      );

      return {
        status: 'success',
        message: 'File uploaded successfully to Cloudinary',
        url: result.secure_url,
        publicId: result.public_id,
        metadata: {
          file_type: result.resource_type,
          format: result.format,
          file_size: result.bytes,
          width: result.width,
          height: result.height,
          upload_time: result.created_at,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload file to Cloudinary');
    }
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a file from Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        publicId: {
          type: 'string',
          description: 'Cloudinary public ID of the file to delete',
        },
      },
    },
  })
  async deleteFile(@Body('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    try {
      const result = await this.cloudinaryService.deleteFile(publicId);
      return {
        status: 'success',
        message: 'File deleted successfully from Cloudinary',
        result,
      };
    } catch (error) {
      throw new BadRequestException('Failed to delete file from Cloudinary');
    }
  }
}
