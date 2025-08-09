import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { PrismaModule } from '@app/prisma';
import { EnvModule } from '@app/config';
import { Env } from '@app/config/env.schema';
import { ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UserMiddleware } from './user/user.middleware';
import { StartModule } from './start/start.module';
import { PackModule } from './pack/pack.module';
import { session } from 'telegraf';
import { AdminModule } from './admin/admin.module';
import { GramModule } from '@app/gram';
import { TwitterModule } from '@app/twitter';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    EnvModule,
    PrismaModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService<Env>) => ({
        stores: [createKeyv(configService.get('REDIS_URL', { infer: true }))],
        ttl: 60_000, // 60 seconds in milliseconds for cache-manager v7 / Keyv
        max: 100,
      }),
      inject: [ConfigService<Env>],
    }),
    TwitterModule,
    GramModule,
    TelegrafModule.forRootAsync({
      imports: [UserModule],
      useFactory: (
        configService: ConfigService<Env>,
        userMiddleware: UserMiddleware,
      ) => ({
        token: configService.get('BOT_TOKEN', { infer: true })!,
        middlewares: [userMiddleware.use, session()],
        include: [StartModule, PackModule, AdminModule],
      }),
      inject: [ConfigService, UserMiddleware],
    }),
    StartModule,
    PackModule,
    AdminModule,
  ],
  providers: [BotService],
})
export class BotModule {}
