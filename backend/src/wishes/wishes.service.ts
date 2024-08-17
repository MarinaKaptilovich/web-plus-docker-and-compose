/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    private readonly userService: UsersService,
  ) {}

  async create(userId: number, createWishDto: CreateWishDto): Promise<Wish> {
    const user = await this.userService.findOneById(userId);

    return this.wishesRepository.save({
      ...createWishDto,
      owner: user,
    });
  }

  async findAll(query?: FindManyOptions<Wish>): Promise<Wish[]> {
    return await this.wishesRepository.find({
      ...query,
      relations: ['owner'],
    });
  }

  async findOne(id: number): Promise<Wish> {
    return await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto): Promise<Wish> {
    await this.wishesRepository.update(id, updateWishDto);
    return await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async removeOne(id: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    await this.wishesRepository.delete(id);
    return wish;
  }

  async copy(wishId: number, user): Promise<Wish> {
    const { id, createdAt, updatedAt, copied, raised, offers, ...dataWish } =
      await this.findOne(wishId);
    const owner = await this.userService.findOneById(user.id);

    await this.wishesRepository.update(id, { copied: copied + 1 });

    return this.wishesRepository.save({
      ...dataWish,
      owner,
    });
  }
}
