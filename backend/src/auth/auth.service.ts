import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity'; // Adjust the import path as necessary
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service'; // Adjust the import path as necessary

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService, // Adjust the import path as necessary
  ) {}

  async getTokenByUserId(userId: number): Promise<string> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      needsTwoFactorAuthentication: false,
      isSecondFactorAuthenticated: true,
    };
    return this.jwtService.signAsync(payload);
  }

  async generateAccessToken(
    user: User,
    isTwoFactorAuthenticated: boolean,
  ): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      needsTwoFactorAuthentication:
        user.two_factor_enabled && !isTwoFactorAuthenticated,
      isSecondFactorAuthenticated: isTwoFactorAuthenticated,
    };
    return this.jwtService.signAsync(payload);
  }
}
