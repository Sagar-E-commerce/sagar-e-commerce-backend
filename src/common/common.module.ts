import { Module } from '@nestjs/common';
import { GeneatorService } from './services/generator.service';
import { GeoCodingService } from './services/goecoding.service';
import { DistanceService } from './services/distance.service';
//import { PublicService } from './services/public.service';
import { UploadService } from './services/upload.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryConfig } from './config/claudinary.config';
import { CloudinaryService } from './services/claudinary.service';

@Module({
  imports: [],
  providers: [
    GeneatorService,
    GeoCodingService,
    DistanceService,
    UploadService,
    JwtService,
    CloudinaryConfig,
    CloudinaryService,
  ],
  exports: [CloudinaryService,CloudinaryConfig],
})
export class CommonModule {}
