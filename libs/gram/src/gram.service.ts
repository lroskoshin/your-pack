import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Api, TelegramClient } from 'telegram';
import { Env } from '@app/config';
import { ConfigService } from '@nestjs/config';
import { StoreSession } from 'telegram/sessions';

@Injectable()
export class GramService implements OnModuleInit {
  private logger = new Logger(GramService.name);
  private client: TelegramClient;
  constructor(private readonly configService: ConfigService<Env>) {
    const storeSession = new StoreSession('my_session');
    this.client = new TelegramClient(
      storeSession,
      this.configService.get('GRAM_API_ID', { infer: true })!,
      this.configService.get('GRAM_API_HASH', { infer: true })!,
      {
        connectionRetries: 5,
      },
    );
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Gram client connected');
    if (await this.client.isUserAuthorized()) {
      this.logger.log('User for gram authorized');
      const user = await this.client.getMe();
      this.logger.log(`User for gram: ${user.username}`);
    } else {
      this.logger.log('User for gram not authorized');
    }
  }

  public signInWithQr() {
    return new Promise<string>((resolve, reject) => {
      this.client
        .signInUserWithQrCode(
          {
            apiId: this.client.apiId,
            apiHash: this.client.apiHash,
          },
          {
            qrCode: (code) => {
              resolve(`tg://login?token=${code.token.toString('base64url')}`);
              return Promise.resolve();
            },
            onError: (error) => {
              this.logger.error('Error sending QR code', error);
            },
          },
        )
        .then((user) => {
          this.client.session.save();
          this.logger.log('Session saved, user:', user);
        })
        .catch((error: Error) => {
          this.logger.error('Error sending QR code', error);
          reject(error);
        });
    });
  }

  public async getChannelMembers(channel: string) {
    const channelEntity = await this.client.getEntity(channel);
    const channelFullInfo = await this.client.invoke(
      new Api.channels.GetFullChannel({
        channel: channelEntity,
      }),
    );
    if ('participantsCount' in channelFullInfo.fullChat) {
      return channelFullInfo.fullChat.participantsCount;
    }
    return undefined;
  }
}
