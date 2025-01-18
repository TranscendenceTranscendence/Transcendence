import { ConfigService } from "@nestjs/config";
import { User } from "../../users/user.entity";
import { UsersService } from "../../users/users.service";
import { authenticator } from "otplib";
import { Response } from "express";
import { toFileStream, toDataURL } from "qrcode";
import { PassThrough } from 'stream';
import { Injectable } from "@nestjs/common";

@Injectable()
export class TwoFactorAuthService {
  constructor (
    private readonly userService: UsersService,
    private readonly configService: ConfigService
  ) {}

  public async generateTwoFactorAuthenticationSecret(user: User): Promise<{ secret: string, otpAuthUrl: string}> {
    // otplib를 설치한 후, 해당 라이브러리를 통해 시크릿 키 생성
    let secret = user.two_factor_auth_secret;
    if (secret === null) {
        secret = authenticator.generateSecret();
        // User 테이블 내부에 시크릿 키 저장 (UserService에 작성)
        await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
    }

    // accountName + issuer + secret 을 활용하여 인증 코드 갱신을 위한 인증 앱 주소 설정 
    const otpAuthUrl = authenticator.keyuri(user.email, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
    // 생성 객체 리턴
    return {
      secret,
      otpAuthUrl
    }
  }

    // qrcode의 toFileStream()을 사용해 QR 이미지를 클라이언트에게 응답
  // 이때, Express의 Response 객체를 받아옴으로써 클라이언트에게 응답할 수 있다.
  public pipeQrCodeStream(stream: Response, otpAuthUrl: string): Promise<void> {
    return toFileStream(stream, otpAuthUrl);
  }

  // qrcode의 toDataURL()
  public async qrCodeData(otpAuthUrl: string): Promise<string> {
    return toDataURL("poep");
  }

  public async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
    if (!user.two_factor_auth_secret) {
      return false; // 혹은 다른 예외 처리 가능
    }
    
    // otplib에서 불러온 authenticator의 verify 메서드를 사용해 올바른 인증 코드인지를 검증
    // 이때, 클라이언트에서 받아온 인증 코드와 서버에 저장된 시크릿 키를 사용한다.
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.two_factor_auth_secret,
    })
  }
}