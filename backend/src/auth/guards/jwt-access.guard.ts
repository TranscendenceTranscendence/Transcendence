import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../users/users.service";
import { Payload } from "../payload/payload.interface";
import { User } from "../../users/user.entity";

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const access_token = request.cookies['access_token'];

      const decodedToken = await this.jwtService.verifyAsync(access_token);

      if (!decodedToken) {
        return false; // 액세스 토큰이 유효하지 않음
      }

      const userId = decodedToken.id;
      const user = await this.userService.findOne(userId);

      if (!user) {
        return false; // 사용자가 존재하지 않음
      }

      // 사용자 정보를 User 엔터티로 변환하여 할당
      request.user = user;
      return true; // 인증 성공
    } catch (err) {
      return false; // 인증 실패
    }
  }
}
// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAccessAuthGuard extends AuthGuard('jwt') {}