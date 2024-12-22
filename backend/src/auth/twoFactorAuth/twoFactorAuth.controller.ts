import { TwoFactorAuthService } from "./twoFactorAuth.service";
import {
    ClassSerializerInterceptor, 
    Controller, 
    Post, 
    Get, 
    Req,
    Body,
    UseGuards, 
    UseInterceptors,
    UnauthorizedException,
    ForbiddenException,
    StreamableFile
} from "@nestjs/common";
import { JwtAccessAuthGuard } from "../guards/jwt-access.guard";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import { UsersService } from "../../users/users.service";
import { AuthService } from "../auth.service";
import { Request } from 'express';
import { toFileStream } from "qrcode";
import { PassThrough } from 'stream';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Get('generate') // TODO add guard, check if user has already 2fa enabled
  async register(@Req() request: Request) {
    console.log("generate");
    const token = request.signedCookies['jwt'];
    const userId = await this.usersService.getUserIdFromCookie(token);
    const user = await this.usersService.findOne(userId);
    const { otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(user);
    
    const qrStream = new PassThrough();
    await toFileStream(qrStream, otpAuthUrl);
    return new StreamableFile(qrStream);
  }

  @Post('turn-on')
  async turnOnTwoFactorAuthentication(
    @Req() req: Request,
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string
  ) {
    console.log("turn-on");
    console.log(twoFactorAuthenticationCode);

    const token = req.signedCookies['jwt'];
    const userId = await this.usersService.getUserIdFromCookie(token);
    const user = await this.usersService.findOne(userId);

    const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, user
    );
    if (!isCodeValidated) {
      throw new UnauthorizedException('Invalid Authentication-Code');
    }
    await this.usersService.turnOnTwoFactorAuthentication(user.id);

    return {
      msg: "TwoFactorAuthentication turned on"
    }
  }

  @Post('turn-off')
  @UseGuards(JwtAccessAuthGuard)
  async turnOffTwoFactorAuthentication(
    @Req() req: RequestWithUser,
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string
  ) {
    const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, req.user
    );
    if (!isCodeValidated) {
      throw new UnauthorizedException('Invalid Authentication-Code');
    }
    await this.usersService.turnOffTwoFactorAuthentication(req.user.id);

    return {
      msg: "TwoFactorAuthentication turned off"
    }
  }

  @Post('authenticate')
  @UseGuards(JwtAccessAuthGuard)
  async authenticate(
    @Req() req: any,
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string
  ) {
    const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, req.user
    );

    if (!req.user.twoFactorAuthEnabled) {
      throw new ForbiddenException('Two-Factor Authentication is not enabled');
    }

    if (!isCodeValidated) {
      throw new UnauthorizedException('Invalid Authentication-Code');
    }
    
    req.user.isSecondFactorAuthenticated = true;

    const accessToken = await this.authService.generateAccessToken(req.user, true);
    
    req.res.cookie('2fa_token', accessToken, {
      httpOnly: true,
      path: '/',
    });

    return req.user;
  }
}