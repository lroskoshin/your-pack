import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { Pack, TelegramProvider, TwitterProvider } from '@prisma/client';
import { GramService } from '@app/gram';
import { TwitterService } from '@app/twitter';
import { ConfigService } from '@nestjs/config';
import { Env } from '@app/config';

@Injectable()
export class PackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gramService: GramService,
    private readonly twitterService: TwitterService,
    private readonly configService: ConfigService<Env>,
  ) {}

  public async getPackSecurely(userId: string, packId: string) {
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, userId },
      include: {
        telegramProvider: true,
        twitterProvider: true,
      },
    });
    if (!pack) {
      throw new Error('Pack not found');
    }
    return pack;
  }

  public async getPack(packId: string) {
    return this.prisma.pack.findFirst({
      where: { id: packId },
      include: {
        telegramProvider: true,
        twitterProvider: true,
      },
    });
  }

  public async addTwitter(
    userId: string,
    packId: string,
    profileId: string,
  ): Promise<null | TwitterProvider> {
    const pack = await this.getPackSecurely(userId, packId);
    return this.prisma.twitterProvider.upsert({
      where: { packId: pack.id },
      update: { profileId },
      create: { profileId, packId: pack.id, userId },
    });
  }

  public async addTelegram(userId: string, packId: string, chatName: string) {
    const pack = await this.getPackSecurely(userId, packId);
    return this.prisma.telegramProvider.upsert({
      where: { packId: pack.id },
      update: { chatName },
      create: { chatName, packId: pack.id, userId },
    });
  }

  public async deleteTelegram(userId: string, packId: string) {
    const pack = await this.getPackSecurely(userId, packId);
    return this.prisma.telegramProvider.delete({
      where: { packId: pack.id },
    });
  }

  public async deleteTwitter(userId: string, packId: string) {
    const pack = await this.getPackSecurely(userId, packId);
    return this.prisma.twitterProvider.delete({
      where: { packId: pack.id },
    });
  }

  public async newPack(userId: string, name: string) {
    if (name.length < 1 || name.length > 25) {
      throw new Error('Invalid pack name');
    }
    return this.prisma.pack.create({
      data: { name, userId },
    });
  }

  public async checkPackSecurely(userId: string, packId: string) {
    const pack = await this.getPackSecurely(userId, packId);
    return this.checkPack(pack);
  }
  public async getMemberData(packId: string) {
    const pack = await this.getPack(packId);
    if (!pack) {
      throw new Error('Pack not found');
    }
    return this.checkPack(pack);
  }

  private async checkPack(
    pack: Pack & {
      telegramProvider: TelegramProvider | null;
      twitterProvider: TwitterProvider | null;
    },
  ) {
    const result: CheckPackResult = {
      packName: pack.name,
    };
    if (pack.telegramProvider) {
      result.telegramMembers = await this.gramService.getChannelMembers(
        pack.telegramProvider.chatName,
      );
    }
    if (pack.twitterProvider) {
      result.twitterFollowers = await this.twitterService.getMembersAsGuest(
        pack.twitterProvider.profileId,
      );
    }
    return result;
  }

  public async deletePack(userId: string, packId: string) {
    const pack = await this.getPackSecurely(userId, packId);
    const [, , deletedPack] = await this.prisma.$transaction([
      this.prisma.telegramProvider.deleteMany({
        where: { packId: pack.id, userId },
      }),
      this.prisma.twitterProvider.deleteMany({
        where: { packId: pack.id, userId },
      }),
      this.prisma.pack.delete({ where: { id: pack.id } }),
    ]);
    return deletedPack;
  }

  public async getPackPublicUrl(userId: string, packId: string) {
    const pack = await this.getPackSecurely(userId, packId);
    const publicUrl = this.configService.get('PUBLIC_URL', { infer: true })!;
    const base64PackId = Buffer.from(pack.id).toString('base64');
    return `${publicUrl}/pack/${base64PackId}`;
  }

  public getPackFromBase64PackId(base64PackId: string) {
    return Buffer.from(base64PackId, 'base64').toString('utf-8');
  }
}

type CheckPackResult = {
  packName: string;
  telegramMembers?: number;
  twitterFollowers?: number;
};
