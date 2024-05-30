import { BadRequestException, Injectable, UnsupportedMediaTypeException } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as fs from 'fs';
import * as fileType from 'file-type';
import * as ffmpeg from 'fluent-ffmpeg';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
    constructor() {}

    public async uploadFile(file: Express.Multer.File): Promise<string> {
        //  allowed file extensions and MIME types
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.ogg', '.webm', '.mp4', '.mov', '.avi', '.mkv'];
        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'video/ogg', 'video/webm', 'video/mp4',
            'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
        ];

        // Get the file extension and validate it
        const extension = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            throw new BadRequestException(
                'Only files with the following extensions are allowed: ' +
                allowedExtensions.join(', '),
            );
        }

        // Check the file's MIME type
        const fileInfo = await fileType.fromBuffer(file.buffer);
        if (!fileInfo || !allowedMimeTypes.includes(fileInfo.mime)) {
            throw new UnsupportedMediaTypeException('Unsupported media type');
        }

      

        // Create the public directory if it doesn't exist
        if (!fs.existsSync('public')) {
            fs.mkdirSync('public');
        }

        // Generate a unique filename and save the file
        const filename = uuidv4() + extension;
        const filePath = `public/${filename}`;
        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(file.buffer);
        writeStream.end();

        return filename;
    }




    public async uploadVideoFile(file: Express.Multer.File): Promise<{ url: string, duration: number, type: string }> {
        //  allowed file extensions and MIME types
        const allowedExtensions = [ '.ogg', '.webm', '.mp4', '.mov', '.avi', '.mkv'];
        const allowedMimeTypes = [
            'video/ogg', 'video/webm', 'video/mp4',
            'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
        ];

        // Get the file extension and validate it
        const extension = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            throw new BadRequestException(
                'Only files with the following extensions are allowed: ' +
                allowedExtensions.join(', '),
            );
        }

        // Check the file's MIME type
        const fileInfo = await fileType.fromBuffer(file.buffer);
        if (!fileInfo || !allowedMimeTypes.includes(fileInfo.mime)) {
            throw new UnsupportedMediaTypeException('Unsupported media type');
        }

        // If the file is a video, check its duration
        let duration =0
        if (fileInfo.mime.startsWith('video/')) {
            const maxDuration = 90; // 1 minute and 30 seconds in seconds
            duration = await this.getVideoDuration(file.buffer);
            if (duration > maxDuration) {
                throw new BadRequestException('Video duration exceeds the maximum allowed length of 1 minute and 30 seconds');
            }
        }

        // Create the public directory if it doesn't exist
        if (!fs.existsSync('public')) {
            fs.mkdirSync('public');
        }

        // Generate a unique filename and save the file
        const filename = uuidv4() + extension;
        const filePath = `public/${filename}`;
        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(file.buffer);
        writeStream.end();

        const videoDetails = {url:filename, duration, type:fileInfo.mime};
        return videoDetails
    }


    // Helper method to get video duration using fluent-ffmpeg
    private async getVideoDuration(buffer: Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            const videoStream = streamifier.createReadStream(buffer);
            ffmpeg(videoStream).ffprobe((err, metadata) => {
                if (err) {
                    return reject(err);
                }
                resolve(metadata.format.duration);
            });
        });
    }
}
