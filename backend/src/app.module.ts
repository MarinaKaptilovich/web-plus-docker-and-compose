import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { Offer } from './offers/entities/offer.entity'
import { OffersModule } from './offers/offers.module'
import { User } from './users/entities/user.entity'
import { UsersModule } from './users/users.module'
import { Wish } from './wishes/entities/wish.entity'
import { WishesModule } from './wishes/wishes.module'
import { Wishlist } from './wishlist/entities/wishlist.entity'
import { WishlistModule } from './wishlist/wishlist.module'

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'postgres',
			port: 5432,
			username: 'student',
			password: 'student',
			database: 'kupipodariday',
			entities: [User, Wish, Offer, Wishlist],
			synchronize: true,
		}),
		UsersModule,
		WishesModule,
		WishlistModule,
		OffersModule,
		AuthModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
