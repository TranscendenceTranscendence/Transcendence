import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      return false;
    }

    const user = request.user;
    if (user.two_factor_enabled) {
      const is2FAVerified = request.headers['x-2fa-verified'];
      if (!is2FAVerified) {
        throw new UnauthorizedException('2FA verification required');
      }
    }

    return true;
  }
}