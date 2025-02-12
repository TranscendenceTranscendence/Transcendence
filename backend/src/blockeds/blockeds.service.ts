import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlockedDto } from './dto/create-blocked.dto';
import { Blocked } from './blocked.entity';

@Injectable()
export class BlockedsService {
  constructor(
    @InjectRepository(Blocked)
    private readonly blockedsRepository: Repository<Blocked>,
  ) {}

  async create(createBlockedDto: CreateBlockedDto): Promise<Blocked> {
    const blockedData = await this.blockedsRepository.create(createBlockedDto);
    return this.blockedsRepository.save(blockedData);
  }

  async findAll(): Promise<Blocked[]> {
    return await this.blockedsRepository.find();
  }

  async findByUserId(id: number): Promise<Blocked[]> {
    const blockedData = await this.blockedsRepository.find({
      where: [{ blockedUser: { id } }, { user: { id } }],
    });
    if (!blockedData) throw new HttpException('Blocked Not Found', 404);
    return blockedData;
  }

  async remove(id: number): Promise<Blocked[]> {
    const existingBlocked = await this.findByUserId(id);
    return await this.blockedsRepository.remove(existingBlocked);
  }
}
