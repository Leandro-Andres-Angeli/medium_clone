import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ExpresRequest } from 'src/types/expressRequest.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: ExpresRequest = context.switchToHttp().getRequest();
    if (request.user) {
      return true;
    }
    throw new HttpException('Not Auth', HttpStatus.UNAUTHORIZED);
  }
}
