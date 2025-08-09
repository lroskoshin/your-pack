// apps/bot/src/bot.update.ts
import { Update, Start, Ctx, InjectBot, Sender, Action } from 'nestjs-telegraf';
import { fmt } from 'telegraf/format';
import { OnModuleInit } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { PrismaService } from '@app/prisma';
import { UserContext } from '../interfaces/context.interface';
import { Update as UpdateType } from 'telegraf/typings/core/types/typegram';

@Update()
export class StartUpdate implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}

  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      { command: 'new_pack', description: 'Create a new pack' },
    ]);
  }

  @Start()
  async start(@Ctx() ctx: UserContext, @Sender('id') telegramId: number) {
    if (!ctx.user) {
      if (!telegramId) {
        await ctx.reply(fmt`👋 Hi! Sorry but it seems like you are not user`, {
          parse_mode: 'HTML',
        });
        return;
      }
      await this.prisma.user.create({
        data: {
          telegramId: telegramId,
        },
      });
    }
    await ctx.reply(fmt`👋 Hi! Choose your language`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'English', callback_data: 'EN' }],
          [{ text: 'Russian', callback_data: 'RU' }],
        ],
      },
    });
  }

  @Action(/^EN|RU$/)
  async callbackQuery(
    @Sender('id') telegramId: number,
    @Ctx() ctx: UserContext & { update: UpdateType.CallbackQueryUpdate },
  ) {
    const cbQuery = ctx.update.callback_query;
    const userAnswer = 'data' in cbQuery ? cbQuery.data : null;
    if (userAnswer === 'EN' || userAnswer === 'RU') {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
      });
      if (user) {
        await this.prisma.user.update({
          where: { telegramId },
          data: { language: userAnswer },
        });
      } else {
        await this.prisma.user.create({
          data: { telegramId, language: userAnswer },
        });
      }
      await ctx.reply(ctx.t('language_changed', { lang: ctx.language }));
      return;
    }
  }
}
