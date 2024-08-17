import { IsBoolean, IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  hidden: boolean;

  @IsNotEmpty()
  @IsInt()
  itemId: number;
}
