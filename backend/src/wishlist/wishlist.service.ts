import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { WishesService } from 'src/wishes/wishes.service';
import { FindManyOptions, In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
    private usersService: UsersService,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const user = await this.usersService.findOneById(userId);
    const wishes = await this.wishesService.findAll({
      where: { id: In(createWishlistDto.itemsId) },
    });

    return this.wishlistsRepository.save({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });
  }

  async findAll(query?: FindManyOptions<Wishlist>): Promise<Wishlist[]> {
    const wishlists = await this.wishlistsRepository.find({
      ...query,
      relations: {
        owner: true,
        items: true,
      },
    });

    wishlists.forEach((wishlist) => {
      delete wishlist.owner.password;
      delete wishlist.owner.email;
    });

    return wishlists;
  }

  async findOne(id: number): Promise<Wishlist | undefined> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: {
        id,
      },
      relations: {
        owner: true,
        items: true,
      },
    });

    return wishlist;
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    await this.wishlistsRepository.update(id, updateWishlistDto);
    return await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  async removeOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
    await this.wishlistsRepository.delete(id);
    return wishlist;
  }
}
