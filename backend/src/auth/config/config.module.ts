import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule globally available
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}