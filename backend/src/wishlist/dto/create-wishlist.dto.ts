import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  name: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  itemsId: number[];
}
