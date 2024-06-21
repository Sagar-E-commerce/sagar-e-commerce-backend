import { Module } from '@nestjs/common';
import { GeneatorService } from './services/generator.service';
import { GeoCodingService } from './services/goecoding.service';
import { DistanceService } from './services/distance.service';
//import { PublicService } from './services/public.service';
import { UploadService } from './services/upload.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryConfig } from './config/claudinary.config';
import { CloudinaryService } from './services/claudinary.service';
import { ShiprocketService } from './services/shiprocket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/Entity/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  providers: [
    GeneatorService,
    GeoCodingService,
    DistanceService,
    UploadService,
    JwtService,
    CloudinaryConfig,
    CloudinaryService,
    ShiprocketService
  ],
  exports: [CloudinaryService,CloudinaryConfig],
})
export class CommonModule {}
