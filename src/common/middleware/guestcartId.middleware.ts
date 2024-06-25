import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {Request, Response, NextFunction} from  'express'

@Injectable()
export class GuestCartMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies.guestCartId) {
      const guestCartId = uuidv4();
      res.cookie('guestCartId', guestCartId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
      req.cookies.guestCartId = guestCartId;
    }
    next();
  }
}