import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class LocationRestrictionMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const response = await axios.get(`http://ipinfo.io/${ip}/json?token=your_ipinfo_token`);
      const location = response.data;

      if (location.country !== 'NG') {  // 'NG' is the country code for Nigeria
        throw new ForbiddenException('Access is restricted to Nigerian users only');
      }

      next();
    } catch (error) {
      throw new ForbiddenException('Access is restricted to Nigerian users only');
    }
  }
}
