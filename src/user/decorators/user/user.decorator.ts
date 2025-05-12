import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpresRequest } from 'src/types/expressRequest.interface';
import { UserEntity } from 'src/user/user.entity';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: ExpresRequest = ctx.switchToHttp().getRequest();
    if (!request.user) {
      return null;
    }

    if (data) {
      return request.user[data] as keyof UserEntity;
    }

    return request.user;
  },
);
