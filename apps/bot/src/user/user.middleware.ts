import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { UserContext } from '../interfaces/context.interface';
import * as I18next from 'i18next';
import ru from '../i18n/ru';
import en from '../i18n/en';

@Injectable()
export class UserMiddleware {
  constructor(private readonly prisma: PrismaService) {}
  use = async (ctx: UserContext, next: () => Promise<void>) => {
    ctx.language = 'en';
    ctx.t = await I18next.init({
      lng: ctx.language,
      resources: {
        en: { translation: en },
        ru: { translation: ru },
      },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        telegramId: ctx.from?.id,
      },
    });
    if (user) {
      ctx.language = user.language === 'RU' ? 'ru' : 'en';
    }
    ctx.user = user;
    await next();
  };
}
