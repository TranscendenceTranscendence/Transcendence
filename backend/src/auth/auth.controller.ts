// Auth Controller
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FortyTwoAuthGuard } from './guards/ft-auth.guard';
import { UsersService } from '../users/users.service';
import { AchievementsService } from '../achievements/achievements.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  AuthenticatedRequest,
  JwtAccessAuthGuard,
} from './guards/jwt-access.guard';
import { AchievementType } from '../achievements/achievement.entity';

@ApiTags('Auth') // Grouping for Swagger
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly achievementsService: AchievementsService,
  ) {}

  @Get('42/login')
  @ApiOperation({ summary: 'Login with 42 OAuth' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to 42 OAuth login page.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @UseGuards(FortyTwoAuthGuard)
  fortyTwoLogin() {}

  @Get('42/callback')
  @ApiOperation({ summary: '42 OAuth callback' })
  @ApiResponse({
    status: 302,
    description:
      'Redirect based on user status (e.g., two-factor, nickname update).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoCallback(@Req() req: Request, @Res() res: Response) {
    // Extract the user ID from the request object (set by your auth guard)
    const userId = req.user['id'];

    // Retrieve the user from the database
    const user = await this.usersService.findOne(userId);

    // Award the FIRST_LOGIN achievement.
    // The achievement service can handle checking if the achievement was already awarded.
    await this.achievementsService.addAchievementToUser(
      user.id,
      AchievementType.FIRST_LOGIN,
    );

    // Generate an access token for the user
    const accessToken = await this.authService.generateAccessToken(user, false);

    // Set the token header and determine the appropriate redirect
    res.setHeader('Authorization', `Bearer ${accessToken}`);

    let redirectUrl = null;
    if (
      req.user['nickname'] === null ||
      (req.user['nickname'] as string).trim().length === 0
    ) {
      redirectUrl = '/update';
    } else if (user.two_factor_enabled === true) {
      redirectUrl = '/2fa/authenticate';
    }

    if (redirectUrl) {
      req.res.redirect(
        `http://localhost:3001?access_token=${accessToken}&redirect=${redirectUrl}`,
      );
    } else {
      req.res.redirect(`http://localhost:3001?access_token=${accessToken}`);
    }
    return;
  }

  @Post('logout')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiBearerAuth()
  async logout(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    await this.usersService.update(user.id, {
      nickname: user.nickname,
      avatar: user.avatar,
      two_factor_enabled: user.two_factor_enabled,
      is_second_auth_done: false,
    });
    return { msg: 'User logged out successfully' };
  }
}
