import { Request } from 'express';
import { UserEntity } from 'src/user/user.entity';

export interface ExpresRequest extends Request {
  user?: UserEntity;
}
