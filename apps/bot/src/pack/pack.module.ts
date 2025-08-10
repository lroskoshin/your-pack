import { Module } from '@nestjs/common';
import { PackUpdate } from './pack.update';
import { PackService } from './pack.service';
import { UpsertTelegramScene } from './scenes/upsert-telegram.scene';
import { UpsertTwitterScene } from './scenes/upsert-twitter.scene';
import { PackController } from './pack.controller';
import { NewPackScene } from './scenes/new-pack.scene';

@Module({
  controllers: [PackController],
  providers: [
    PackUpdate,
    PackService,
    UpsertTelegramScene,
    UpsertTwitterScene,
    NewPackScene,
  ],
  exports: [PackService],
})
export class PackModule {}
