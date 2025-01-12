import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.log('Invalid authorization header');
          return false;
      }
      const accessToken = authHeader.split(' ')[1];
      const decodedToken = await this.jwtService.verifyAsync(accessToken, { secret: process.env.JWT_SECRET });

      if (!decodedToken) {
          console.log('Invalid access token');
          return false;
      }

      const userId = decodedToken.id;
      console.log('Decoded user id: ' + userId);
      const user = await this.userService.findOne(userId);

      if (!user) {
        console.log('User not found');
        return false;
      }

      const twoFactorAuthenticated = decodedToken.isSecondFactorAuthenticated;

      if (user.two_factor_enabled && !twoFactorAuthenticated) {
        // User might be doing the authentication, so let it pass.
        if (request.url !== '/2fa/authenticate') {
          console.log('2FA is enabled but not authenticated, tried to access url ' + request.url);
          return false;
        }
        console.log('Authenticating 2FA');
      }

      // Convert user information to User entity and assign
      request.user = user;
      return true; // Sucess authentication
      } catch (err) {
        console.log(err);
        return false; // failed
      }
    }
//     try {
//       const request = context.switchToHttp().getRequest();
//       console.log('cookies ' + JSON.stringify(request.cookies));
//       const access_token = request.cookies["access_token"];
//       console.log('Access token ' + access_token);

//       const decodedToken = await this.jwtService.verifyAsync(access_token);

//       if (!decodedToken) {
//         console.log('Invalid access token');
//         return false; // 액세스 토큰이 유효하지 않음
//       }

//       const userId = decodedToken.id;
//       console.log('Decoded user id: ' + userId);
//       const user = await this.userService.findOne(userId);

//       if (!user) {
//         console.log('User not found');
//         return false; // 사용자가 존재하지 않음
//       }

//       const twoFactorAuthenticated = decodedToken.isSecondFactorAuthenticated;

//       if (user.two_factor_enabled && !twoFactorAuthenticated) {
//         // User might be doing the authentication, so let it pass.
//         if (request.url !== '/2fa/authenticate') {
//           console.log('2FA is enabled but not authenticated, tried to access url ' + request.url);
//           return false;
//         }
//         console.log('Authenticating 2FA');
//       }

//       // 사용자 정보를 User 엔터티로 변환하여 할당
//       request.user = user;
//       return true; // 인증 성공
//     } catch (err) {
//       console.log(err);
//       return false; // 인증 실패
//     }
//   }
}
