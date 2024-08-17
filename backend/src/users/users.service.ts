/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Wish } from 'src/wishes/entities/wish.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TUser, User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Пользователь уже существует');
    }

    const user = this.userRepository.create(createUserDto);

    return await this.userRepository.save(user);
  }

  async findAll(
    query?: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User[]> {
    return await this.userRepository.find({ where: query });
  }

  find(findUserDto: FindUsersDto): Promise<TUser[]> {
    return this.userRepository.find({
      where: [
        { username: Like(`%${findUserDto.query}%`) },
        { email: Like(`%${findUserDto.query}%`) },
      ],
    });
  }

  async findOne(searchIndex: string): Promise<User> {
    return this.userRepository.findOne({
      where: [{ email: searchIndex }, { username: searchIndex }],
    });
  }

  async findOneById(id: number): Promise<TUser> {
    const { password, ...user } = await this.userRepository.findOne({
      where: { id },
    });

    return user;
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<TUser> {
    const user = await this.findOneById(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findOne(updateUserDto.username);

      if (existingUser) {
        throw new ConflictException('Пользователь уже существует');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOne(updateUserDto.email);

      if (existingUser) {
        throw new ConflictException('Пользователь уже существует');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update({ id: id }, updateUserDto);

    return this.findOneById(id);
  }

  async removeOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    await this.userRepository.delete(id);
    return user;
  }

  async getWishes(username: string): Promise<Wish[]> {
    const user = await this.findOne(username);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const { wishes } = await this.userRepository.findOne({
      where: { username },
      select: ['wishes'],
      relations: ['wishes', 'wishes.owner', 'wishes.offers'],
    });

    return wishes;
  }
}
