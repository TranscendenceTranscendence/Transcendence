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
    const token = this.extractToken(context);
    const decodedToken = await this.validateToken(token);
    const user = await this.getUser(decodedToken);
    this.attachUser(context, user, decodedToken);
    return true;
  }

  // Extracts the token from the HTTP headers or WebSocket handshake.
  private extractToken(context: ExecutionContext): string {
    const contextType = context.getType();
    let token: string;

    if (contextType === 'http') {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid authorization header');
      }
      token = authHeader.substring(7);
    } else if (contextType === 'ws') {
      const client = context.switchToWs().getClient();
      token = client.handshake?.auth?.token;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      // Remove "Bearer " if it exists
      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }
    } else {
      throw new UnauthorizedException('Unsupported context');
    }
    return token;
  }

  // Validates the token using JwtService and returns the decoded token.
  private async validateToken(token: string): Promise<any> {
    let decodedToken;
    try {
      decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
    if (!decodedToken?.sub) {
      throw new UnauthorizedException('Invalid access token payload');
    }
    return decodedToken;
  }

  // Retrieves the user from the database using the decoded token's subject.
  private async getUser(decodedToken: any) {
    const user = await this.userService.findOne(decodedToken.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // Attaches the user to the request (for HTTP) or client (for WebSocket) after performing any additional checks.
  private attachUser(context: ExecutionContext, user: any, decodedToken: any) {
    const contextType = context.getType();
    if (contextType === 'http') {
      const request = context.switchToHttp().getRequest();
      if (
        user.two_factor_enabled &&
        !decodedToken.isSecondFactorAuthenticated &&
        request.url !== '/2fa/authenticate'
      ) {
        throw new ForbiddenException('2FA is enabled but not authenticated');
      }
      request.user = user;
    } else if (contextType === 'ws') {
      const client = context.switchToWs().getClient();
      if (
        user.two_factor_enabled &&
        !decodedToken.isSecondFactorAuthenticated
      ) {
        throw new ForbiddenException('2FA is enabled but not authenticated');
      }
      client.user = user;
    }
  }
}
