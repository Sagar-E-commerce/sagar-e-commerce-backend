import { Injectable, NestMiddleware, ForbiddenException} from '@nestjs/common';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { CurrencyConverterService } from '../services/currency.converter.service';


@Injectable()
export class LocationAndCurrencyMiddleware implements NestMiddleware {
  constructor(private readonly currencyConverterService: CurrencyConverterService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const response = await axios.get(`http://ipinfo.io/${ip}/json?token=your_ipinfo_token`);
      const location = response.data;

      if (location.country !== 'NG') {  // 'NG' is the country code for Nigeria
        throw new ForbiddenException('Access is restricted to Nigerian users only');
      }

      // Attach user's country and currency info to the request
      req['userLocation'] = location.country;
      req['userCurrency'] = 'NGN'; // Default to NGN for Nigerian users
      next();
    } catch (error) {
      throw new ForbiddenException('Access is restricted to Nigerian users only');
    }
  }
}
