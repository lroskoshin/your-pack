import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { SETUP_GRAM_CLIENT_WIZARD } from './contatnts';
import { UserWizardContext } from '../interfaces/context.interface';
import { GramService } from '@app/gram';
import { Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
@Wizard(SETUP_GRAM_CLIENT_WIZARD)
export class SetupGramWizard {
  private logger = new Logger(SetupGramWizard.name);
  constructor(private readonly gramService: GramService) {}
  @WizardStep(1)
  async onEnter(@Ctx() ctx: UserWizardContext) {
    await ctx.reply('Setup Gram Client, enter mobile number');
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(2)
  async onMessage(
    @Ctx() ctx: UserWizardContext,
    @Message('text') text: string,
  ) {
    if (typeof text !== 'string') {
      await ctx.reply('Please enter a valid mobile number');
      return;
    }
    this.logger.log('Signing in with QR code');
    const url = await this.gramService.signInWithQr();
    await ctx.reply(`Scan QR code: ${url}`);
    const png = await QRCode.toBuffer(url, {
      type: 'png',
      width: 512,
      errorCorrectionLevel: 'H',
      margin: 2,
    });
    await ctx.replyWithPhoto(
      { source: png, filename: 'qr.png' },
      { caption: `QR for: ${url}` },
    );
    ctx.wizard.next();
  }

  @WizardStep(3)
  async onLeave(@Ctx() ctx: UserWizardContext) {
    await ctx.reply('Setup Gram Client Success');
    await ctx.scene.leave();
  }
}
