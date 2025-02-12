import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    const gameData = await this.gamesRepository.create(createGameDto);
    return this.gamesRepository.save(gameData);
  }

  async findAll(): Promise<Game[]> {
    return await this.gamesRepository.find();
  }

  async findByUserId(id: number): Promise<Game[]> {
    const gameData = await this.gamesRepository.find({
      where: [{ player1_user_id: id }, { player2_user_id: id }],
    });
    if (!gameData) throw new HttpException('Game Not Found', 404);
    return gameData;
  }

  // async update(
  //   id: number,
  //   UpdateGameDto: UpdateGameDto,): Promise<Game[]> {
  //   const existingGame = await this.findByPersonUserId(id);
  //   const gameData = this.gamesRepository.merge(
  //       existingGame,
  //       UpdateGameDto,
  //   );
  //   return await this.gamesRepository.save(
  //       gameData,
  //   );
  // }

  async remove(id: number): Promise<Game[]> {
    const existingGame = await this.findByUserId(id);
    return await this.gamesRepository.remove(existingGame);
  }
}
