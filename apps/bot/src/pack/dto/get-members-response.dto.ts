import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

@Exclude()
export class GetMembersResponseDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  @Expose()
  telegramMembers?: number;

  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  @Expose()
  twitterFollowers?: number;
}
