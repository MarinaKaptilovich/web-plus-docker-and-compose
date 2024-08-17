import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
