import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'flit',
  ): Promise<UploadApiResponse> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload error:', error);
              return reject(error);
            }
            resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  async uploadBase64(
    base64Data: string,
    folder: string = 'flit',
  ): Promise<UploadApiResponse> {
    try {
      return await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: 'auto',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
    } catch (error) {
      this.logger.error('Error uploading base64 to Cloudinary:', error);
      throw error;
    }
  }

  async deleteFile(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  }

  async getFileUrl(publicId: string, transformations?: any): Promise<string> {
    return cloudinary.url(publicId, transformations);
  }
}
