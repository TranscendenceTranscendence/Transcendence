export interface Payload {
    id: number;
    email: string;
    iat?: string;
    exp?: string;
    // 액세스 토큰의 2차 인증 여부 
    isSecondFactorAuthenticated?: boolean;
  }