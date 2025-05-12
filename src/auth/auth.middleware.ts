import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config';
import { ExpresRequest } from 'src/types/expressRequest.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpresRequest, _res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = undefined;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = verify(token, JWT_SECRET) as JwtPayload;

      const user = await this.userService.findById(decoded.id as number);

      req.user = user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      req.user = undefined;
      next();
      return;
    }

    next();
    return;
  }
}
