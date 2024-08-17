import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TUserRequest } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() { user }: TUserRequest,
    @Body() createWishDto: CreateWishDto,
  ) {
    return this.wishesService.create(user.id, createWishDto);
  }

  @Get('last')
  findLast() {
    return this.wishesService.findAll({
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  @Get('top')
  findTop() {
    return this.wishesService.findAll({
      order: { copied: 'DESC' },
      take: 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);
    if (!wish) {
      throw new NotFoundException('Желание не найдено');
    }
    return wish;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const wish = await this.wishesService.findOne(+id);
    if (!wish) {
      throw new NotFoundException('Желание не найдено');
    }
    if (wish.owner.id !== req.user.userId) {
      throw new ForbiddenException('Вы не можете редактировать это желание');
    }
    return this.wishesService.updateOne(+id, updateWishDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);
    if (!wish) {
      throw new NotFoundException('Желание не найдено');
    }
    if (wish.owner.id !== req.user.userId) {
      throw new ForbiddenException('Вы не можете удалить это желание');
    }
    return this.wishesService.removeOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copy(
    @Param('id') id: number,
    @Request() { user }: TUserRequest,
  ): Promise<Wish> {
    return this.wishesService.copy(id, user);
  }
}
