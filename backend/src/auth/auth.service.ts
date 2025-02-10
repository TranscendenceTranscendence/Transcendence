import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity'; // Adjust the import path as necessary

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
