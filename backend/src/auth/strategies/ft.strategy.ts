import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-42';
import { Inject, Injectable } from '@nestjs/common';
import FortyTwoOauthConfig from '../../config/ft-oauth.config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../../users/users.service';
import { User, UserStatus } from '../../users/user.entity';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'ft') {
  private defaultAvatar: string;

  constructor(
    @Inject(FortyTwoOauthConfig.KEY) private fortyTwoConfiguration: ConfigType<typeof FortyTwoOauthConfig>,
    private httpService: HttpService,
    private usersService: UsersService,
  ) {
    console.log("TEEEEESSSTTTTT")
    super({
      authorizationURL: `https://api.intra.42.fr/oauth/authorize?client_id=${fortyTwoConfiguration.clientID}&redirect_uri=${fortyTwoConfiguration.callbackURL}&response_type=code`,
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: fortyTwoConfiguration.clientID,
      clientSecret: fortyTwoConfiguration.clientSecret,
      callbackURL: fortyTwoConfiguration.callbackURL,
    });

    // console.log("Exists: " + fs.existsSync(path.join(__dirname, '../../../img/cute_dog.jpeg')));
    this.defaultAvatar = '/uploads/cute_dog.jpeg';
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, cb: any) {
    let user = await this.usersService.findOne(profile.id);

    if (user == null) {
      user = new User();
      user.id = profile.id;
      user.avatar = this.defaultAvatar; // Set default avatar if profile image is not available
      user.user_status = UserStatus.Offline;
      user.is_second_auth_done = false;
      user.email = profile.emails[0].value;
      user.ladder_level = 0;
      user.nickname = '';

      user = await this.usersService.create(user);
    }
    if (user)
      cb(null, user);
    else
      cb(null, false);
  }
}