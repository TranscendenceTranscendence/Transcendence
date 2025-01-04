import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity'; // Adjust the import path as necessary
import { Payload } from './payload/payload.interface';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    async generateAccessToken(user: User, isSecondFactorAuthenticated = false): Promise<string> {
        const payload: Payload = {
          id: user.id,
          email: user.email,
          isSecondFactorAuthenticated: isSecondFactorAuthenticated,
        }
        return this.jwtService.signAsync(payload);
      }
}