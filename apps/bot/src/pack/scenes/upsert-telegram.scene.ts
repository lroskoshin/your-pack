import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { EDIT_PACK_TELEGRAM_SCENE } from '../constants';
import { PackService } from '../pack.service';
import { UserContext } from '../../interfaces/context.interface';

@Scene(EDIT_PACK_TELEGRAM_SCENE)
export class UpsertTelegramScene {
  constructor(private readonly packService: PackService) {}
  @SceneEnter()
  async enter(@Ctx() ctx: UserContext) {
    await ctx.reply(ctx.t('telegram_add_instructions'));
  }

  @On('text')
  async onText(@Ctx() ctx: UserContext, @Message('text') text: string) {
    if (!text.startsWith('@')) {
      await ctx.reply(ctx.t('telegram_add_error'));
      return;
    }
    const packId = ctx.scene.state?.packId;
    const userId = ctx.user?.id;
    if (!packId || !userId) {
      await ctx.reply(ctx.t('telegram_add_error'));
      return;
    }
    const telegramProvider = await this.packService.addTelegram(
      userId,
      packId,
      text,
    );
    if (!telegramProvider) {
      await ctx.reply(ctx.t('telegram_add_error'));
      return;
    }
    await ctx.reply(ctx.t('telegram_add_success'));
    await ctx.scene.leave();
  }
}
