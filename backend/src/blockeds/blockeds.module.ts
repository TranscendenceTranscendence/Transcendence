import { Module } from '@nestjs/common';
import { BlockedsService } from './blockeds.service';
import { BlockedsController } from './blockeds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blocked } from './blocked.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blocked])],
  providers: [BlockedsService],
  controllers: [BlockedsController],
})
export class BlockedsModule {}
