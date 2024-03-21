import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Profile, Strategy } from 'passport-google-oauth20';
import * as randomstring from 'randomstring';

import { CreateUserDto } from '@/user/dtos';
import { User } from '@/user/schema/user.schema';
import { UserService } from '@/user/user.service';
import 'dotenv/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.URL_SERVER}/auth/google/redirect`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    createProfile: CreateUserDto,
  ): Promise<any> {
    const user = await this.profileToUser(profile);
    const newUser = Object.assign(user, createProfile);
    return (
      (await this.userService.findOneOptions({
        field: '$or',
        payload: [{ googleId: user.googleId }, { email: user.email }],
      })) || (await this.userService.create(newUser))
    );
  }

  private async profileToUser(profile: Profile): Promise<User> {
    const password = randomstring.generate({
      length: 6,
      charset: 'numeric',
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    return {
      googleId: profile.id,
      username: profile.name.givenName,
      full_name: profile.displayName,
      email: profile.emails[0].value,
      profile_image: profile.photos[0].value,
      password: hashedPassword,
    } as User;
  }
}
