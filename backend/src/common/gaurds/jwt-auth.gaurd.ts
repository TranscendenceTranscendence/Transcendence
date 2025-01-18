import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const authorizationHeader = request.headers['Authorization'] as string;

      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No Bearer token found in Authorization header');
      }

      const accessToken = authorizationHeader.split(' ')[1];
      const decodedToken = await this.jwtService.verifyAsync(accessToken, { secret: process.env.JWT_SECRET });

      if (!decodedToken) {
        console.log('Invalid access token');
        throw new UnauthorizedException('Invalid access token');
      }

      const userId = decodedToken.sub; // Use 'sub' to get the user ID
      const user = await this.userService.findOne(userId);

      if (!user) {
        console.log('User not found');
        throw new UnauthorizedException('User not found');
      }

      const twoFactorAuthenticated = decodedToken.isSecondFactorAuthenticated;

      if (user.two_factor_enabled && !twoFactorAuthenticated) {
        // User might be doing the authentication, so let it pass.
        if (request.url !== '/2fa/authenticate') {
          console.log('2FA is enabled but not authenticated, tried to access url ' + request.url);
          throw new ForbiddenException('2FA is enabled but not authenticated');
        }
        console.log('Authenticating 2FA');
      }

      return true; // Allow the request to proceed
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}