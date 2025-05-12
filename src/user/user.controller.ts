/* eslint-disable @typescript-eslint/await-thenable */
import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './createUser.dto';
// import { UserEntity } from './user.entity';
import { UserResponse } from './types/userResponse';
import { LoginUserDto } from './loginUser.dto';
import { UserType } from './types/userType';
import { UserEntity } from './user.entity';
import { ExpresRequest } from 'src/types/expressRequest.interface';
import { User } from './decorators/user/user.decorator';
import { AuthGuard } from '../guards/auth/auth.guard';
import { UpdateUserDto } from './updateUser.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponse> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponse> {
    const user = await this.userService.login(loginUserDto);
    return {
      user: {
        ...(user as UserType),
        token: this.userService.generateJwt(user),
      },
    };
  }
  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(
    @Req() request: ExpresRequest,
    @User() user: UserEntity,
  ): Promise<UserResponse> {
    // console.log(request);
    console.log('user', user);
    return await this.userService.buildUserResponse(user);
  }
  @Put('')
  @UseGuards(AuthGuard)
  async update(
    @User('id', ParseIntPipe) id: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);

    // console.log('id', id);
    // console.log('id', updateUserDto);
    // console.log('in controller');
  }
}
