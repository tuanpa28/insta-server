import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '@/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleSerializer } from './serializers';
import { GoogleStrategy } from './strategies';

@Module({
  imports: [
    UserModule,
    JwtModule.register({ global: true }),
    PassportModule.register({
      defaultStrategy: 'google',
      session: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GoogleSerializer],
})
export class AuthModule {}
