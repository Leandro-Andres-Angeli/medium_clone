import { UserEntity } from 'src/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileType } from './profileType';
import FollowEntity from './follower';
import { ProfileResponseType } from './profileResponseType';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserId: number,
    username: string,
  ): Promise<ProfileResponseType> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('Not found ', HttpStatus.NOT_FOUND);
    }
    const profile: ProfileType = user;
    // const followedUser = await this.userRepository.findOne({
    //   where: { username },
    // });

    const isFollowing = await this.followRepository.findOne({
      where: {
        followingId: user?.id,
        followerId: currentUserId,
      },
    });

    return { profile: { ...profile, following: Boolean(isFollowing) } };
  }
  async followProfile(currentUserId: number, profileUserName: string) {
    const user = await this.userRepository.findOne({
      where: { username: profileUserName },
    });
    if (!user) {
      throw new HttpException('Not found ', HttpStatus.NOT_FOUND);
    }
    if (currentUserId === user.id) {
      throw new HttpException(
        'Follower and Following can`t be equal',
        HttpStatus.BAD_REQUEST,
      );
    }
    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });
    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return { ...user, following: true };
  }
  async unfollowProfile(currentUserId: number, profileUserName: string) {
    const user = await this.userRepository.findOne({
      where: { username: profileUserName },
    });
    if (!user) {
      throw new HttpException('Not found ', HttpStatus.NOT_FOUND);
    }
    if (currentUserId === user.id) {
      throw new HttpException(
        'Follower and Following can`t be equal',
        HttpStatus.BAD_REQUEST,
      );
    }
    const unfollow = await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    // if (unfollow.affected !== 1) {
    //   console.log('in');
    //   throw new HttpException('Error ocurred', HttpStatus.BAD_REQUEST);
    // }

    // if (!follow) {
    //   const followToCreate = new FollowEntity();
    //   followToCreate.followerId = currentUserId;
    //   followToCreate.followingId = user.id;
    //   await this.followRepository.save(followToCreate);
    // }
    return {
      profile: { ...(user as ProfileType), following: false },
    } as ProfileResponseType;
  }
}
