import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config';
import { UserResponse } from './types/userResponse';
import { UserType } from './types/userType';
import { LoginUserDto } from './loginUser.dto';
import { compareSync } from 'bcrypt';
import { UpdateUserDto } from './updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const userByEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    const userByUserName = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (userByEmail || userByUserName) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    return await this.userRepository.save(newUser);
  }
  generateJwt(user: UserEntity): string {
    return sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
    );
  }
  buildUserResponse(user: UserEntity): UserResponse {
    const userType: UserType = user;
    return {
      user: { ...userType, token: this.generateJwt(user) },
    };
  }
  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    // Promise<Omit<UserEntity, 'password' | 'hashPassword'>>
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        bio: true,
        image: true,
      },
    });
    if (!user) {
      throw new HttpException('Not valid email', HttpStatus.NOT_FOUND);
    }

    const validPassword = compareSync(loginUserDto.password, user.password);

    if (!validPassword) {
      throw new HttpException('Not valid password', HttpStatus.NOT_FOUND);
    }
    // const omitted: Omit<UserEntity, 'password' | 'hashPassword'> = user;

    return user;
  }
  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  async update(
    userId: number,
    userUpdateInfo: UpdateUserDto,
  ): Promise<UserEntity> {
    await this.userRepository.update({ id: userId }, userUpdateInfo);
    // const saved = await this.userRepository.save( userUpdateInfo);
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
