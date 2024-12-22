import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Payload } from "../payload/payload.interface";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor'
) {
  constructor(
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
        return req?.cookies?.two_fa_token;
      } ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET
    });
  }

  async validate(payload: Payload) {
    const user = await this.userService.findOne(payload.id);
    
    if (!user.two_factor_enabled) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user; 
    }
  }
}