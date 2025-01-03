import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.signedCookies?.jwt ?? request.cookies?.jwt; // Extract JWT from the cookie
    if (!token) {
      throw new UnauthorizedException('No JWT found in cookies');
    }
    try {
      // Verify the token and attach the payload to the request
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Ensure your secret is configured
      });
      request.user = { id: payload.sub }; // Attach the decoded payload to req.user
      return true; // Allow the request to proceed
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}