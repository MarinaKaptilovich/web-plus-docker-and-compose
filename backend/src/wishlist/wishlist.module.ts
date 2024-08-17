import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { WishesModule } from '../wishes/wishes.module';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistsController } from './wishlist.controller';
import { WishlistsService } from './wishlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist]), WishesModule, UsersModule],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistModule {}
