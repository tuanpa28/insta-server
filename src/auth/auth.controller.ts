import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LogInDto, RegisterDto } from './dtos';
import { googleGuard } from './guards';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  async login(
    @Body() signInDto: LogInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.login(signInDto);

      res.cookie('refreshToken', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 24 giờ
      });

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        accessToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const { user } = await this.authService.register(registerDto);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        user,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('refreshToken')
  @ApiOperation({ summary: 'Create new token' })
  async refreshToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken)
        throw new UnauthorizedException('You`re not authenticate!');

      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 24 giờ
      });

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        accessToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Delete('logout')
  @ApiOperation({ summary: 'Logout' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');

    return {
      isError: false,
      statusCode: HttpStatus.OK,
      message: 'Successful',
    };
  }

  @Get('google')
  @UseGuards(googleGuard)
  @ApiOperation({ summary: 'Login google' })
  async googleAuth(): Promise<HttpStatus> {
    return HttpStatus.OK;
  }

  @Get('google/redirect')
  @UseGuards(googleGuard)
  @ApiOperation({ summary: 'Redirect google' })
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    try {
      const { accessToken, refreshToken } =
        await this.authService.googleAuthRedirect(req.user);

      res.cookie('refreshToken', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 giờ
      });

      res.send(`
        <script>
          window.opener.postMessage({ type: "success", accessToken: "${accessToken}" }, "*");
          window.close();
        </script>
      `);

      const redirectUrl = new URL(process.env.URL_CLIENT);
      redirectUrl.searchParams.append('accessToken', accessToken);

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
