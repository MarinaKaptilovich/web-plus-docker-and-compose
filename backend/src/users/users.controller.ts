import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Wish } from 'src/wishes/entities/wish.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TUser, TUserRequest } from './entities/user.entity';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('find')
  async findMany(@Body() dto: FindUsersDto): Promise<TUser[]> {
    return this.usersService.find(dto);
  }

  @Get('me')
  findOne(@Request() { user }: TUserRequest): Promise<TUser> {
    return this.usersService.findOneById(user.id);
  }

  @Get(':username')
  async findOneByUsername(@Param('username') username: string): Promise<TUser> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @Patch('me')
  updateOne(
    @Request() { user }: TUserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<TUser> {
    return this.usersService.updateOne(user.id, updateUserDto);
  }

  @Delete('me')
  removeOne(@Request() req) {
    return this.usersService.removeOne(req.user.userId);
  }

  @Get('me/wishes')
  findOwnWishes(@Request() { user }: TUserRequest): Promise<Wish[]> {
    return this.usersService.getWishes(user.username);
  }

  @Get(':username/wishes')
  async getWishes(@Param('username') username: string): Promise<Wish[]> {
    return this.usersService.getWishes(username);
  }
}
