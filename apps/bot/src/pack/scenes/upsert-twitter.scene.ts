import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { EDIT_PACK_SCENE, EDIT_PACK_TWITTER_SCENE } from '../constants';
import { PackService } from '../pack.service';
import { UserContext } from '../../interfaces/context.interface';

@Scene(EDIT_PACK_TWITTER_SCENE)
export class UpsertTwitterScene {
  constructor(private readonly packService: PackService) {}
  @SceneEnter()
  async enter(@Ctx() ctx: UserContext) {
    await ctx.reply(ctx.t('twitter_add_instructions'));
  }

  @On('text')
  async onText(@Ctx() ctx: UserContext, @Message('text') text: string) {
    if (!text.startsWith('@')) {
      await ctx.reply(ctx.t('twitter_add_error'));
      return;
    }
    const twitterProvider = await this.packService.addTwitter(ctx, text);
    if (!twitterProvider) {
      await ctx.reply(ctx.t('twitter_add_error'));
      return;
    }
    await ctx.reply(ctx.t('twitter_add_success'));
    await ctx.scene.enter(EDIT_PACK_SCENE, {
      packId: ctx.scene.state?.packId,
    });
  }
}
