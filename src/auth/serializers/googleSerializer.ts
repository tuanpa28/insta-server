import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserGoogleDto } from '../dtos';

@Injectable()
export class GoogleSerializer extends PassportSerializer {
  constructor(private userService: UserService) {
    super();
  }

  serializeUser(user: UserGoogleDto, done: CallableFunction) {
    done(null, user._id);
  }

  async deserializeUser(id: string, done: CallableFunction) {
    return await this.userService
      .findOne(id)
      .then((user) => done(null, user))
      .catch((err) => done(err));
  }
}
