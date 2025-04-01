import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateUserDto,
  UpdateAddUserToBlockedListDto,
} from './dto/update-user.dto';
import { User, UserStatus } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import JwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AchievementsService } from '../achievements/achievements.service';
import { AchievementType } from '../achievements/achievement.entity';
import { Blocked } from '../blockeds/blocked.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly achievementsService: AchievementsService,
    private readonly blockedsRepository: Repository<Blocked>,
    private jwt: JwtService,
    @Inject(JwtConfig.KEY)
    private jwtConfig: ConfigType<typeof JwtConfig>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userData = await this.usersRepository.create(createUserDto);
    return this.usersRepository.save(userData);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const userData = await this.usersRepository.findOneBy({ id });
    return userData;
  }

  async update(
    id: number,
    UpdateUserDto: UpdateUserDto,
  ): Promise<User | false> {
    const existingUser = await this.findOne(id);
    const userData = this.usersRepository.merge(existingUser, UpdateUserDto);

    this.achievementsService.addAchievementToUser(
      id,
      AchievementType.FIRST_PROFILE_UPDATE,
    );

    // check if nickname is already taken
    const userWithSameNickname = await this.usersRepository.findOne({
      where: { nickname: UpdateUserDto.nickname },
    });
    if (userWithSameNickname && userWithSameNickname.id !== id) return false;

    return await this.usersRepository.save(userData);
  }

  async blockUser(
    id: number,
    AddBlockedUser: UpdateAddUserToBlockedListDto,
  ): Promise<User | false> {
    const existingUser = await this.findOne(id);
    const userData = this.usersRepository.merge(existingUser, AddBlockedUser);
    if (!existingUser) return false;

    if (
      AddBlockedUser.blockedUsers.find(
        (blockedUser) =>
          blockedUser.blockedUser.id === AddBlockedUser.targetUser.id,
      )
    )
      return false;
    const newBlocked = this.blockedsRepository.create({
      blockedUser: AddBlockedUser.targetUser,
    });
    AddBlockedUser.blockedUsers.push(newBlocked);
    console.log('userData', userData);
    return await this.usersRepository.save(userData);
  }

  async remove(id: number): Promise<User> {
    const existingUser = await this.findOne(id);
    return await this.usersRepository.remove(existingUser);
  }

  async signToken(id: number): Promise<string> {
    const payload = { sub: id };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.jwtConfig.signOptions.expiresIn,
      secret: this.jwtConfig.secret,
    });
    return token;
  }

  async checkToken(id: number): Promise<string> {
    const payload = { sub: id };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.jwtConfig.signOptions.expiresIn,
      secret: this.jwtConfig.checkSecret,
    });
    return token;
  }

  async getUserIdFromCookie(token: any): Promise<number> {
    if (!token) {
      throw new HttpException('No JWT token found', 401);
    }
    const decodedToken = this.jwt.decode(token);
    if (!decodedToken || typeof decodedToken !== 'object') {
      throw new HttpException('Invalid JWT token', 401);
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decodedToken.exp < currentTime) {
      throw new HttpException('JWT token has expired', 401);
    }

    return decodedToken.sub;
  }

  async setTwoFactorAuthenticationSecret(
    secret: string,
    userId: number,
  ): Promise<UpdateResult> {
    return this.usersRepository.update(userId, {
      two_factor_auth_secret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: number): Promise<UpdateResult> {
    return await this.usersRepository.update(userId, {
      two_factor_enabled: true,
    });
  }

  async turnOffTwoFactorAuthentication(userId: number): Promise<UpdateResult> {
    return await this.usersRepository.update(userId, {
      two_factor_auth_secret: null,
      two_factor_enabled: false,
    });
  }

  async setLastActive(
    userId: number,
    lastActive: Date = new Date(),
  ): Promise<UserStatus> {
    const user = await this.findOne(userId);

    if (typeof lastActive !== 'object') {
      lastActive = new Date(lastActive);
    }

    user.lastActive = lastActive;
    const twoMinutesAgo = Date.now() - 120000; // compute once

    if (
      user.user_status === UserStatus.Offline &&
      lastActive.getTime() > twoMinutesAgo
    ) {
      user.user_status = UserStatus.Online;
    }

    await this.usersRepository.save(user);
    return user.user_status;
  }

  async setStatus(userId: number, status: UserStatus): Promise<UserStatus> {
    const user = await this.findOne(userId);
    if (
      status === UserStatus.Offline &&
      user.user_status !== UserStatus.Online
    ) {
      return user.user_status;
    }
    if (
      status === UserStatus.Online &&
      user.user_status !== UserStatus.Offline
    ) {
      return user.user_status;
    }

    user.user_status = status;
    await this.usersRepository.save(user);
    return user.user_status;
  }
}
