import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'official api of TheGearmates single vendor ecommerce platform!';
  }
}
