import { ProfileType } from './profileType';

export type ProfileResponseType = {
  profile: ProfileType & { following: boolean };
};
