import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
  constructor() {
    super({
      authorizationURL: 'https://provider.com/oauth2/authorize',
      tokenURL: 'https://provider.com/oauth2/token',
      clientID: 'your-client-id',
      clientSecret: 'your-client-secret',
      callbackURL: 'http://f1r3s12:3000/auth/oauth/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    try {
      const user = { accessToken, profile };
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
