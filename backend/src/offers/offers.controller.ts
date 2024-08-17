import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TUserRequest } from 'src/users/entities/user.entity';
import { WishesService } from '../wishes/wishes.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() { user }: TUserRequest,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    return this.offersService.create(user.id, createOfferDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const offer = await this.offersService.findOne(+id);

    if (!offer) {
      throw new NotFoundException('Желание не найдено');
    }

    return offer;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const offer = await this.offersService.findOne(+id);

    if (!offer) {
      throw new NotFoundException('Желание не найдено');
    }

    if (offer.user.id !== req.user.userId) {
      throw new ForbiddenException('Вы не можете удалить это желание');
    }

    const wish = await this.wishesService.findOne(offer.item.id);
    wish.raised -= offer.amount;
    await this.wishesService.updateOne(wish.id, wish);

    return this.offersService.removeOne(+id);
  }
}
