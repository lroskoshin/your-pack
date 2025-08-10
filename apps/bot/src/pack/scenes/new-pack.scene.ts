import {
  Ctx,
  Message,
  On,
  Scene,
  SceneEnter,
  SceneLeave,
} from 'nestjs-telegraf';
import { CREATE_PACK_SCENE } from '../constants';
import { UserContext } from '../../interfaces/context.interface';
import { PackService } from '../pack.service';

@Scene(CREATE_PACK_SCENE)
export class NewPackScene {
  constructor(private readonly packService: PackService) {}

  @SceneEnter()
  async enter(@Ctx() ctx: UserContext) {
    await ctx.reply(ctx.t('create_pack_instructions'));
  }

  @On('text')
  async onText(@Ctx() ctx: UserContext, @Message('text') name: string) {
    try {
      const userId = ctx.user?.id;
      if (!userId) {
        await ctx.reply(ctx.t('something_wrong'));
        return;
      }
      await this.packService.newPack(userId, name);
      Object.defineProperty(ctx.scene.state, 'packName', {
        value: name,
        writable: false,
      });
      await ctx.scene.leave();
    } catch (error: unknown) {
      await ctx.reply(
        ctx.t('error_creating_pack', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
      return;
    }
  }

  @SceneLeave()
  async leave(@Ctx() ctx: UserContext) {
    if ('packName' in ctx.scene.state && ctx.scene.state.packName) {
      await ctx.reply(
        ctx.t('pack_created', { packName: ctx.scene.state.packName }),
      );
    } else {
      await ctx.reply(ctx.t('something_wrong'));
    }
  }
}
