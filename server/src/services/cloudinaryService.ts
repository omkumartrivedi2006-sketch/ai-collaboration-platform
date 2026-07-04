import { cloudinary, isConfigured } from '../config/cloudinary';
import fs from 'fs';
import path from 'path';

export class CloudinaryService {
  async uploadFile(
    localFilePath: string,
    folderName: string = 'collaboration_platform'
  ): Promise<{ url: string; publicId: string; thumbnailUrl?: string }> {
    if (!isConfigured) {
      // Fallback: file is already in uploads/ directory via Multer
      const fileName = path.basename(localFilePath);
      const relativeUrl = `/uploads/${fileName}`;
      return {
        url: relativeUrl,
        publicId: fileName,
        thumbnailUrl: relativeUrl
      };
    }

    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
        resource_type: 'auto'
      });

      // Try to delete the local temp file after uploading to Cloudinary
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      // Generate a thumbnail url if it's an image
      let thumbnailUrl = result.secure_url;
      if (result.resource_type === 'image') {
        thumbnailUrl = cloudinary.url(result.public_id, {
          width: 200,
          height: 200,
          crop: 'fill'
        });
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!isConfigured) {
      // Local fallback: delete the file from local uploads directory
      const localPath = path.join(__dirname, '../../uploads', publicId);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
    }
  }

  async getSignedUrl(publicId: string): Promise<string> {
    if (!isConfigured) {
      return `/uploads/${publicId}`;
    }

    try {
      // For signed private downloads, we can generate a signed url with 1 hour expiration
      return cloudinary.utils.private_download_url(publicId, 'pdf', {
        expires_at: Math.floor(Date.now() / 1000) + 3600
      });
    } catch (error) {
      // fallback to standard url if private download fails
      return cloudinary.url(publicId);
    }
  }
}
