import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';

import { UserService } from '@/user/user.service';
import { LogInDto, RegisterDto, UserGoogleDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(logInDataDto: LogInDto) {
    try {
      const { emailOrUsername, password } = logInDataDto;

      const query = isEmail(emailOrUsername) ? 'email' : 'username';

      const user = await this.userService.findOneOptions({
        field: query,
        payload: emailOrUsername,
      });

      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại!');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu không hợp lệ!');
      }

      const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        full_name: user.full_name,
        profile_image: user.profile_image,
        bio: user.bio,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        current_city: user.current_city,
        from: user.from,
        followers: user.followers,
        followings: user.followings,
        tick: user.tick,
        isAdmin: user.isAdmin,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
        secret: process.env.SECRET_KEY_JWT,
      });

      const refreshToken = await this.jwtService.signAsync(
        { _id: user._id },
        { expiresIn: '1d', secret: process.env.SECRET_KEY_JWT },
      );

      return {
        accessToken,
        refreshToken,
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

  async register(registerDataDto: RegisterDto) {
    try {
      const { username, email, password, full_name } = registerDataDto;

      const existingUser = await this.userService.findOneOptions({
        field: 'username',
        payload: username,
      });

      if (existingUser) {
        throw new UnauthorizedException('Tên người dùng đã tồn tại!');
      }

      const existingEmail = await this.userService.findOneOptions({
        field: 'email',
        payload: email,
      });

      if (existingEmail) {
        throw new UnauthorizedException('Địa chỉ email đã tồn tại!');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userService.create({
        username,
        email,
        password: hashedPassword,
        full_name,
      });

      return { user };
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

  async refreshToken(token: string) {
    try {
      const user = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY_JWT,
      });

      const currentUser = await this.userService.findOne(user._id);

      if (!currentUser) {
        throw new UnauthorizedException('Tài khoản không tồn tại!');
      }

      const payload = {
        _id: currentUser._id,
        username: currentUser.username,
        email: currentUser.email,
        password: currentUser.password,
        full_name: currentUser.full_name,
        profile_image: currentUser.profile_image,
        bio: currentUser.bio,
        date_of_birth: currentUser.date_of_birth,
        gender: currentUser.gender,
        current_city: currentUser.current_city,
        from: currentUser.from,
        followers: currentUser.followers,
        followings: currentUser.followings,
        tick: currentUser.tick,
        isAdmin: currentUser.isAdmin,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
        secret: process.env.SECRET_KEY_JWT,
      });

      const refreshToken = await this.jwtService.signAsync(
        { _id: user._id },
        { expiresIn: '1d', secret: process.env.SECRET_KEY_JWT },
      );

      return {
        accessToken,
        refreshToken,
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

  async googleAuthRedirect(user: UserGoogleDto) {
    try {
      const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        full_name: user.full_name,
        profile_image: user.profile_image,
        bio: user.bio,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        current_city: user.current_city,
        from: user.from,
        followers: user.followers,
        followings: user.followings,
        tick: user.tick,
        isAdmin: user.isAdmin,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
        secret: process.env.SECRET_KEY_JWT,
      });

      const refreshToken = await this.jwtService.signAsync(
        { _id: user._id },
        { expiresIn: '1d', secret: process.env.SECRET_KEY_JWT },
      );

      return {
        accessToken,
        refreshToken,
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
}
