import { UserType } from './userType';

export interface UserResponse {
  user: UserType & { token: string };
}
