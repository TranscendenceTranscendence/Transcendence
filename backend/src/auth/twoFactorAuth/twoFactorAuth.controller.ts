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
import { toFileStream } from "qrcode";
import { PassThrough } from 'stream';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Two-Factor Authentication')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Get('generate')
  @UseGuards(JwtAccessAuthGuard)
  async generate(@Req() req: RequestWithUser) {
    console.log("generate");

    const user = req.user;
    if (user.two_factor_enabled)
      return { msg: "TwoFactorAuthentication already turned on" };

    const { otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(user);
    
    const qrStream = new PassThrough();
    await toFileStream(qrStream, otpAuthUrl);
    return new StreamableFile(qrStream);
  }

  @Post('turn-on')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Turn on two-factor authentication' })
  @ApiResponse({ status: 200, description: 'TwoFactorAuthentication turned on' })
  @ApiResponse({ status: 401, description: 'Invalid Authentication-Code' })
  @ApiBearerAuth()
  async turnOnTwoFactorAuthentication(
    @Req() req: RequestWithUser,
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string
  ) {
    const user = req.user;

    if (user.two_factor_enabled)
      return { msg: "TwoFactorAuthentication already turned on" };

    const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, user
    );
    if (!isCodeValidated) {
      throw new UnauthorizedException('Invalid Authentication-Code');
    }
    await this.usersService.turnOnTwoFactorAuthentication(user.id);

    // const accessToken = await this.authService.generateAccessToken(req.user, true);
    
    // req.res.cookie('access_token', accessToken, {
    //   httpOnly: true,
    //   signed: true,
    //   secure: true,         // Send only over HTTPS
    //   sameSite: 'none',     // Allow cross-origin requests
    // });

    const accessToken = await this.authService.generateAccessToken(user, true);
    return {
      msg: "TwoFactorAuthentication turned on",
      accessToken,
    };
  }

  @Post('turn-off')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Turn off two-factor authentication' })
  @ApiResponse({ status: 200, description: 'TwoFactorAuthentication turned off' })
  @ApiResponse({ status: 401, description: 'Invalid Authentication-Code' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Authenticate with two-factor authentication' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid Authentication-Code' })
  @ApiBearerAuth()
  async authenticate(
    @Req() req: RequestWithUser,
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string
  ) {
    const user = req.user;

    const isCodeValidated = await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, user
    );

    if (!user.two_factor_enabled) {
      throw new ForbiddenException('Two-Factor Authentication is not enabled');
    }

    if (!isCodeValidated) {
      throw new UnauthorizedException('Invalid Authentication-Code');
    }
    
    req.user.is_second_auth_done = true; // TODO Why store in the database?

    const accessToken = await this.authService.generateAccessToken(user, true);
    
    // req.res.cookie('access_token', accessToken, {
    //   httpOnly: true,
    //   signed: true,
    //   secure: true,         // Send only over HTTPS
    //   sameSite: 'none',     // Allow cross-origin requests
    // });

    // return user;
    return {
      msg: 'Authenticated successfully',
      accessToken,
    };
  }
}