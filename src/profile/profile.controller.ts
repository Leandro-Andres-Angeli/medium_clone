import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResponseType } from './profileResponseType';
import { User } from 'src/user/decorators/user/user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get(':username')
  async getProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ) {
    return await this.profileService.getProfile(currentUserId, profileUsername);
  }
  @UseGuards(AuthGuard)
  @Post(':username/follow')
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUserName: string,
  ) {
    const profile = await this.profileService.followProfile(
      currentUserId,
      profileUserName,
    );
    return profile;
  }
  @UseGuards(AuthGuard)
  @Delete(':username/follow')
  async unfollowProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUserName: string,
  ) {
    const unfollow = await this.profileService.unfollowProfile(
      currentUserId,
      profileUserName,
    );
    return unfollow;
  }
}
