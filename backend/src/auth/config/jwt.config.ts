import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

interface CustomJwtModuleOptions extends JwtModuleOptions {
  checkSecret: string;
}

export default registerAs('jwtConfig', (): CustomJwtModuleOptions => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRE_IN,
  },
  checkSecret: process.env.JWT_CHECK_SECRET,
}));