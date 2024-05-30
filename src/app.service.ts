import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'official api of babies n stuff ecommerce platform!';
  }
}
