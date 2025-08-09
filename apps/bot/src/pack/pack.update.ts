import {
  Action,
  Command,
  Ctx,
  InjectBot,
  Message,
  Update,
} from 'nestjs-telegraf';
import { UserContext } from '../interfaces/context.interface';
import { Telegraf } from 'telegraf';
import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { ensureCbData } from '../utils/callbacks';
import { EDIT_PACK_SCENE } from './constants';
import { PackService } from './pack.service';

@Update()
export class PackUpdate implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<UserContext>,
    private readonly prisma: PrismaService,
    private readonly packService: PackService,
  ) {}

  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      ...(await this.bot.telegram.getMyCommands()),
      { command: 'new_pack', description: 'Create a new pack' },
      { command: 'packs', description: 'List your packs' },
      { command: 'check_pack', description: 'Check a pack' },
    ]);
  }

  @Command('new_pack')
  async newPack(
    @Ctx() ctx: UserContext,
    @Message('text') text: string,
  ): Promise<void> {
    try {
      const name = text.split(' ')[1];
      await this.packService.newPack(ctx, name);
      await ctx.reply(ctx.t('pack_created', { packName: name }));
    } catch (error: unknown) {
      await ctx.reply(
        ctx.t('error_creating_pack', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
      return;
    }
  }

  @Command('packs')
  async listPacks(@Ctx() ctx: UserContext): Promise<void> {
    const packs = await this.prisma.pack.findMany({
      where: { userId: ctx.user?.id },
    });
    if (packs.length === 0) {
      await ctx.reply(ctx.t('no_packs'));
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
    await ctx.scene.enter(EDIT_PACK_SCENE, { packId });
  }
}
