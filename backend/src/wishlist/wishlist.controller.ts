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
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistsService } from './wishlist.service';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @Request() { user }: TUserRequest,
  ): Promise<Wishlist> {
    return this.wishlistsService.create(createWishlistDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.wishlistsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    return wishlist;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException(
        'Вы не можете редактировать этот список желаний',
      );
    }
    return this.wishlistsService.updateOne(+id, updateWishlistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException('Вы не можете удалить этот список желаний');
    }
    return this.wishlistsService.removeOne(+id);
  }
}
