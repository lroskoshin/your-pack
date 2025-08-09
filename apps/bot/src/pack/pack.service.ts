import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { UserContext } from '../interfaces/context.interface';
import { TwitterProvider } from '@prisma/client';
import z from 'zod';
import { GramService } from '@app/gram';
import { TwitterService } from '@app/twitter';

@Injectable()
export class PackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gramService: GramService,
    private readonly twitterService: TwitterService,
  ) {}
  public async getPack(ctx: UserContext) {
    if (
      !('packId' in ctx.scene.state) ||
      typeof ctx.scene.state.packId !== 'string'
    ) {
      return null;
    }
    if (!ctx.user) {
      return null;
    }
    const pack = await this.prisma.pack.findFirst({
      where: { id: ctx.scene.state.packId, userId: ctx.user.id },
      include: {
        telegramProvider: true,
        twitterProvider: true,
      },
    });
    if (!pack) {
      return null;
    }
    return pack;
  }

  public async addTwitter(
    ctx: UserContext,
    profileId: string,
  ): Promise<null | TwitterProvider> {
    const pack = await this.getPack(ctx);
    if (!pack || !ctx.user) {
      return null;
    }
    return this.prisma.twitterProvider.upsert({
      where: { packId: pack.id, userId: ctx.user.id },
      update: { profileId },
      create: { profileId, packId: pack.id, userId: ctx.user.id },
    });
  }

  public async addTelegram(ctx: UserContext, chatName: string) {
    const pack = await this.getPack(ctx);
    if (!pack || !ctx.user) {
      return null;
    }
    return this.prisma.telegramProvider.upsert({
      where: { packId: pack.id, userId: ctx.user.id },
      update: { chatName },
      create: { chatName, packId: pack.id, userId: ctx.user.id },
    });
  }

  public async deleteTelegram(ctx: UserContext) {
    const pack = await this.getPack(ctx);
    if (!pack || !ctx.user) {
      return null;
    }
    return this.prisma.telegramProvider.delete({
      where: { packId: pack.id, userId: ctx.user.id },
    });
  }

  public async deleteTwitter(ctx: UserContext) {
    const pack = await this.getPack(ctx);
    if (!pack || !ctx.user) {
      return null;
    }
    return this.prisma.twitterProvider.delete({
      where: { packId: pack.id, userId: ctx.user.id },
    });
  }

  public async newPack(ctx: UserContext, name: string) {
    if (!ctx.user?.id) {
      throw new Error('User not found');
    }
    const parseResult = z.string().min(1).safeParse(name);
    if (parseResult.error) {
      throw new Error('Invalid pack name');
    }
    return this.prisma.pack.create({
      data: { name, userId: ctx.user.id },
    });
  }

  public async checkPack(ctx: UserContext) {
    const pack = await this.getPack(ctx);
    if (!pack || !ctx.user) {
      return null;
    }
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
        pack.twitterProvider.profileId.slice(1),
      );
    }
    return result;
  }

  public async deletePack(ctx: UserContext) {
    const pack = await this.getPack(ctx);
    if (!pack || !ctx.user) {
      return null;
    }
    return this.prisma.pack.delete({
      where: { id: pack.id, userId: ctx.user.id },
    });
  }
}

type CheckPackResult = {
  packName: string;
  telegramMembers?: number;
  twitterFollowers?: number;
};
