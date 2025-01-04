// Auth Controller
import {
    Controller,
    Get,
    HttpStatus,
    Req,
    Res,
    Delete,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response as ExpressResponse } from 'express';
import { FortyTwoAuthGuard } from './guards/ft-auth/ft-auth.guard';
import { UsersService } from "../users/users.service";
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@ApiTags('Auth') // Grouping for Swagger
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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
    fortyTwoLogin(@Req() req: Request) {}

    @Get('42/callback')
    @ApiOperation({ summary: '42 OAuth callback' })
    @ApiResponse({
        status: 302,
        description: 'Redirect based on user status (e.g., two-factor, nickname update).',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @UseGuards(FortyTwoAuthGuard)
    async fortyTwoCallback(@Req() req: Request, @Res() res: ExpressResponse) {
        if (req.user['twofactor'] == true) {
            const checkCookie = await this.usersService.checkToken(req.user['id']);
            req.res.cookie('jwt', checkCookie, {path: '/', httpOnly: true, signed: true});
        }
        const token = await this.usersService.signToken(req.user['id']);
        req.res.cookie('jwt', token, {
            httpOnly: true,
            signed: true,
            secure: true,         // Send only over HTTPS
            sameSite: 'none',     // Allow cross-origin requests
        });

        if (req.user['nickname'] === null || (req.user['nickname'] as string).trim().length == 0) {
            req.res.redirect(`http://localhost:3001/update`);
        } else {
            req.res.redirect('http://localhost:3001');
        }
        return;
    }

    @Delete('42/logout')
    @ApiOperation({ summary: 'Logout from 42 OAuth' })
    @ApiResponse({
        status: 200,
        description: 'Logout successful and JWT cookie cleared.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @UseGuards(AuthGuard('jwt'))
    async fortyTwoLogout(@Req() req: Request, @Res() res: ExpressResponse) {
        res.clearCookie('jwt');
        res.status(HttpStatus.OK).send();
        req.res.redirect('http://localhost:3001/login');
    }
}

