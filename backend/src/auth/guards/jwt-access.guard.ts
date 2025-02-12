import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const accessToken = authHeader.substring(7); // More efficient than split
    let decodedToken;

    try {
      decodedToken = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!decodedToken?.sub) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    const user = await this.userService.findOne(decodedToken.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (
      user.two_factor_enabled &&
      !decodedToken.isSecondFactorAuthenticated &&
      request.url !== '/2fa/authenticate'
    ) {
      throw new ForbiddenException('2FA is enabled but not authenticated');
    }

    request.user = user;
    return true;
  }
}
