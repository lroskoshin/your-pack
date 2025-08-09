import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { UserContext } from '../../interfaces/context.interface';
import {
  EDIT_PACK_SCENE,
  EDIT_PACK_TELEGRAM_SCENE,
  EDIT_PACK_TWITTER_SCENE,
} from '../constants';
import { Action } from 'nestjs-telegraf';
import { PackService } from '../pack.service';
import { fmt } from 'telegraf/format';

@Scene(EDIT_PACK_SCENE)
export class EditPackScene {
  constructor(private readonly packService: PackService) {}
  @SceneEnter()
  async enter(@Ctx() ctx: UserContext) {
    const pack = await this.packService.getPack(ctx);
    if (!pack) {
      await ctx.reply(ctx.t('pack_not_found'));
      return;
    }

    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];

    if (pack.telegramProvider) {
      keyboard.push([
        {
          text: ctx.t('edit_telegram'),
          callback_data: `provider:telegram:edit`,
        },
        {
          text: ctx.t('delete_telegram'),
          callback_data: `provider:telegram:delete`,
        },
      ]);
    } else {
      keyboard.push([
        { text: ctx.t('add_telegram'), callback_data: 'provider:telegram:add' },
      ]);
    }

    if (pack.twitterProvider) {
      keyboard.push([
        {
          text: ctx.t('edit_twitter'),
          callback_data: `provider:twitter:edit`,
        },
        {
          text: ctx.t('delete_twitter'),
          callback_data: `provider:twitter:delete`,
        },
      ]);
    } else {
      keyboard.push([
        { text: ctx.t('add_twitter'), callback_data: 'provider:twitter:add' },
      ]);
    }

    keyboard.push([
      {
        text: ctx.t('check_pack'),
        callback_data: `check_pack`,
      },
    ]);

    keyboard.push([
      {
        text: ctx.t('edit_pack_close'),
        callback_data: `edit_pack_close`,
      },
    ]);

    await ctx.reply(ctx.t('edit_pack_step1', { packName: pack.name }), {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Action('provider:telegram:add')
  async addTelegram(@Ctx() ctx: UserContext) {
    await ctx.scene.enter(EDIT_PACK_TELEGRAM_SCENE, {
      packId: ctx.scene.state?.packId,
    });
  }

  @Action('provider:telegram:edit')
  async editTelegram(@Ctx() ctx: UserContext) {
    await ctx.scene.enter(EDIT_PACK_TELEGRAM_SCENE, {
      packId: ctx.scene.state?.packId,
    });
  }

  @Action('provider:telegram:delete')
  async deleteTelegram(@Ctx() ctx: UserContext) {
    await this.packService.deleteTelegram(ctx);
    await ctx.reply(ctx.t('integration_deleted'));
    await ctx.scene.reenter();
  }

  @Action('provider:twitter:add')
  async addTwitter(@Ctx() ctx: UserContext) {
    await ctx.scene.enter(EDIT_PACK_TWITTER_SCENE, {
      packId: ctx.scene.state?.packId,
    });
  }

  @Action('provider:twitter:edit')
  async editTwitter(@Ctx() ctx: UserContext) {
    await ctx.scene.enter(EDIT_PACK_TWITTER_SCENE, {
      packId: ctx.scene.state?.packId,
    });
  }

  @Action('provider:twitter:delete')
  async deleteTwitter(@Ctx() ctx: UserContext) {
    const deleted = await this.packService.deleteTwitter(ctx);
    if (!deleted) {
      await ctx.reply(ctx.t('integration_not_found'));
    } else {
      await ctx.reply(ctx.t('integration_deleted'));
    }
    await ctx.scene.reenter();
  }

  @Action('edit_pack_close')
  async close(@Ctx() ctx: UserContext) {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
  }

  @Action('check_pack')
  async closePack(@Ctx() ctx: UserContext) {
    const result = await this.packService.checkPack(ctx);
    if (!result) {
      await ctx.reply(ctx.t('pack_not_found'));
      return;
    }
    await ctx.reply(
      fmt(
        ctx.t('check_pack_result', {
          packName: result.packName,
          telegramMembers: result.telegramMembers ?? '?',
          twitterFollowers: result.twitterFollowers ?? '?',
        }),
      ),
      { parse_mode: 'HTML' },
    );
  }
}
