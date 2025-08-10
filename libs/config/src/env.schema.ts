import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString, IsUrl, MinLength } from 'class-validator';

export enum NodeEnvironment {
  development = 'development',
  production = 'production',
  test = 'test',
}

export class Env {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.development;

  @IsString()
  @MinLength(1)
  BOT_TOKEN!: string;

  @IsUrl({
    protocols: ['postgresql', 'prisma+postgres', 'postgres'],
    require_tld: false,
  })
  DATABASE_URL!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  ADMIN_ID!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  GRAM_API_ID!: number;

  @IsString()
  @MinLength(1)
  GRAM_API_HASH!: string;

  @IsString()
  @MinLength(1)
  X_BEARER_TOKEN!: string;

  @IsUrl({
    protocols: ['redis'],
    require_tld: false,
  })
  REDIS_URL!: string;

  @IsUrl({
    require_tld: false,
  })
  PUBLIC_URL!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  API_PORT!: number;
}
