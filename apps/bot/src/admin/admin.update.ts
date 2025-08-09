import { UserContext } from '../interfaces/context.interface';
import { Command, Ctx, Message, Update } from 'nestjs-telegraf';
import { AdminGuard } from './admin.guard';
import { UseFilters, UseGuards } from '@nestjs/common';
import { TelegrafExceptionFilter } from '../telegraf.filter';
import { SETUP_GRAM_CLIENT_WIZARD } from './contatnts';
import { GramService } from '@app/gram';

@UseFilters(TelegrafExceptionFilter)
@Update()
export class AdminUpdate {
  constructor(private readonly gramService: GramService) {}
  @UseGuards(AdminGuard)
  @Command('admin_check')
  async checkAdmin(@Ctx() ctx: UserContext) {
    await ctx.reply('You are admin');
  }

  @UseGuards(AdminGuard)
  @Command('admin_setup_gram')
  async setupGram(@Ctx() ctx: UserContext) {
    await ctx.scene.enter(SETUP_GRAM_CLIENT_WIZARD);
  }

  @UseGuards(AdminGuard)
  @Command('admin_check_tg_channel')
  async checkTgChannel(@Ctx() ctx: UserContext, @Message('text') text: string) {
    const channel = text.split(' ')[1].trim();
    if (typeof channel !== 'string' || !channel.startsWith('@')) {
      await ctx.reply('Please enter a valid channel name');
      return;
    }
    const members = await this.gramService.getChannelMembers(channel);
    if (members) {
      await ctx.reply(`Channel members: ${members}`);
    } else {
      await ctx.reply('Channel not found or not a channel or private');
    }
  }
}
