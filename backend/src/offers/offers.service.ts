import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { UpdateWishDto } from 'src/wishes/dto/update-wish.dto';
import { WishesService } from 'src/wishes/wishes.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
    private readonly userService: UsersService,
  ) {}

  async create(userId, createOfferDto: CreateOfferDto): Promise<Offer> {
    const wish = await this.wishesService.findOne(createOfferDto.itemId);
    const user = await this.userService.findOneById(userId);
    const offer = Number(wish.raised) + createOfferDto.amount;

    if (offer > wish.price) {
      throw new BadRequestException(
        'Вносимая сумма не может быть больше стоимости желания',
      );
    }

    if (wish.owner.id === user.id) {
      throw new BadRequestException(
        'Вы не можете исполнить свое собственное желание',
      );
    }

    await this.wishesService.updateOne(createOfferDto.itemId, {
      raised: offer,
    } as UpdateWishDto);

    return this.offersRepository.save({ user, ...createOfferDto, item: wish });
  }

  async findAll(
    query?: FindOptionsWhere<Offer> | FindOptionsWhere<Offer>[],
  ): Promise<Offer[]> {
    return await this.offersRepository.find({
      where: query,
      relations: ['user', 'item'],
    });
  }

  async findOne(id: number): Promise<Offer> {
    return await this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });
  }

  async updateOne(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    await this.offersRepository.update(id, updateOfferDto);

    return await this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });
  }

  async removeOne(id: number): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });

    await this.offersRepository.delete(id);

    return offer;
  }
}
