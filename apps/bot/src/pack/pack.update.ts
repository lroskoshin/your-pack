import { Action, Command, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { UserContext } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { ensureCbData } from '../utils/callbacks';
import { PackService } from './pack.service';
import {
  EDIT_PACK_TWITTER_SCENE,
  EDIT_PACK_TELEGRAM_SCENE,
  CREATE_PACK_SCENE,
} from './constants';
import { fmt } from 'telegraf/format';

@Update()
export class PackUpdate implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<UserContext>,
    private readonly prisma: PrismaService,
    private readonly packService: PackService,
  ) {}

  async onModuleInit() {
    const commands = await this.bot.telegram.getMyCommands();
    if (commands) {
      await this.bot.telegram.setMyCommands(
        [
          ...(await this.bot.telegram.getMyCommands()),
          { command: 'new', description: 'Create a new pack' },
          { command: 'packs', description: 'List your packs' },
        ],
        {
          language_code: 'en',
        },
      );
      await this.bot.telegram.setMyCommands(
        [
          ...(await this.bot.telegram.getMyCommands()),
          { command: 'new', description: 'Создать новый pack' },
          { command: 'packs', description: 'Список ваших pack' },
        ],
        {
          language_code: 'ru',
        },
      );
    }
  }

  @Command('new')
  async newPack(@Ctx() ctx: UserContext): Promise<void> {
    await ctx.scene.enter(CREATE_PACK_SCENE);
  }

  @Command('packs')
  async listPacks(@Ctx() ctx: UserContext): Promise<void> {
    const packs = await this.prisma.pack.findMany({
      where: { userId: ctx.user?.id },
    });
    if (packs.length === 0) {
      await ctx.reply(ctx.t('no_packs'), {
        parse_mode: 'HTML',
      });
      return;
    }
    await ctx.reply(ctx.t('packs_list'), {
      reply_markup: {
        inline_keyboard: packs.map((pack) => [
          { text: pack.name, callback_data: `edit_pack:${pack.id}` },
        ]),
      },
    });
  }

  @Action(/^edit_pack:(.+)$/)
  async callbackQuery(@Ctx() ctx: UserContext) {
    const packId = await ensureCbData(ctx);
    const userId = ctx.user?.id;
    if (!userId) {
      await ctx.reply(ctx.t('something_wrong'));
      return;
    }
    const pack = await this.packService.getPackSecurely(userId, packId);
    if (!pack) {
      await ctx.reply(ctx.t('pack_not_found'));
      return;
    }
    const publicUrl = await this.packService.getPackPublicUrl(userId, packId);
    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];

    if (pack.telegramProvider) {
      keyboard.push([
        {
          text: ctx.t('edit_telegram'),
          callback_data: `provider:telegram:edit:${pack.id}`,
        },
        {
          text: ctx.t('delete_telegram'),
          callback_data: `provider:telegram:delete:${pack.id}`,
        },
      ]);
    } else {
      keyboard.push([
        {
          text: ctx.t('add_telegram'),
          callback_data: `provider:telegram:add:${pack.id}`,
        },
      ]);
    }

    if (pack.twitterProvider) {
      keyboard.push([
        {
          text: ctx.t('edit_twitter'),
          callback_data: `provider:twitter:edit:${pack.id}`,
        },
        {
          text: ctx.t('delete_twitter'),
          callback_data: `provider:twitter:delete:${pack.id}`,
        },
      ]);
    } else {
      keyboard.push([
        {
          text: ctx.t('add_twitter'),
          callback_data: `provider:twitter:add:${pack.id}`,
        },
      ]);
    }

    keyboard.push([
      {
        text: ctx.t('check_pack'),
        callback_data: `check_pack:${pack.id}`,
      },
    ]);

    keyboard.push([
      {
        text: ctx.t('delete_pack'),
        callback_data: `delete_pack:${pack.id}`,
      },
    ]);
    const message = ctx.t('edit_pack_step1', { packName: pack.name });
    await ctx.reply(
      fmt`${message}
<code>${publicUrl}</code>`,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
        parse_mode: 'HTML',
      },
    );
  }

  @Action(/^delete_pack:(.+)$/)
  async deletePack(@Ctx() ctx: UserContext) {
    const data = await this.ensureData(ctx);
    const pack = await this.packService.deletePack(data.userId, data.packId);
    await ctx.reply(ctx.t('pack_deleted', { packName: pack.name }));
  }

  @Action(/^provider:telegram:(add|edit):(.+)$/)
  async handleTelegramAction(@Ctx() ctx: UserContext) {
    const data = await this.ensureData(ctx);
    await ctx.scene.enter(EDIT_PACK_TELEGRAM_SCENE, { packId: data.packId });
  }

  @Action(/^provider:twitter:(add|edit):(.+)$/)
  async handleTwitterAction(@Ctx() ctx: UserContext) {
    const data = await this.ensureData(ctx);
    await ctx.scene.enter(EDIT_PACK_TWITTER_SCENE, { packId: data.packId });
  }

  @Action(/^provider:telegram:delete:(.+)$/)
  async deleteTelegram(@Ctx() ctx: UserContext) {
    const data = await this.ensureData(ctx);
    await this.packService.deleteTelegram(data.userId, data.packId);
    await ctx.reply(ctx.t('telegram_deleted'));
  }

  @Action(/^provider:twitter:delete:(.+)$/)
  async deleteTwitter(@Ctx() ctx: UserContext) {
    const data = await this.ensureData(ctx);
    await this.packService.deleteTwitter(data.userId, data.packId);
    await ctx.reply(ctx.t('twitter_deleted'));
  }

  @Action(/^check_pack:(.+)$/)
  async checkPack(@Ctx() ctx: UserContext) {
    const data = await this.ensureData(ctx);
    const result = await this.packService.checkPackSecurely(
      data.userId,
      data.packId,
    );
    await ctx.reply(
      ctx.t('check_pack_result', {
        telegramMembers: result.telegramMembers,
        twitterFollowers: result.twitterFollowers,
        packName: result.packName,
      }),
      {
        parse_mode: 'HTML',
      },
    );
  }

  private async ensureData(ctx: UserContext) {
    const packId = await ensureCbData(ctx);
    const userId = ctx.user?.id;
    if (!userId) {
      await ctx.reply(ctx.t('something_wrong'));
      throw new Error('There is no user id in the context');
    }
    return {
      packId,
      userId,
    };
  }
}
