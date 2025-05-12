import { UserEntity } from 'src/user/user.entity';

export type ProfileType = Pick<
  UserEntity,
  'email' | 'username' | 'password' | 'image' | 'bio'
>;
