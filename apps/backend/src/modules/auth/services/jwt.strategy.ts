import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import configuration from 'src/config/configuration';
import { JwtPayload } from 'src/modules/auth/interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration().jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, username: payload.email };
  }
}
