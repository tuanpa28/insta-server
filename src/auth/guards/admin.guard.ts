import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH_ADMIN_GUARD } from '@/libs/common/constants';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>(
      SKIP_AUTH_ADMIN_GUARD,
      context.getHandler(),
    );
    if (!requiredRole) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (user && user.isAdmin === true) {
      return true;
    }

    throw new UnauthorizedException("You're not authorization!");
  }
}
