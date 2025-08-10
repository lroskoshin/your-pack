import { Module } from '@nestjs/common';
import { PackUpdate } from './pack.update';
import { PackService } from './pack.service';
import { UpsertTelegramScene } from './scenes/upsert-telegram.scene';
import { UpsertTwitterScene } from './scenes/upsert-twitter.scene';
import { PackController } from './pack.controller';

@Module({
  controllers: [PackController],
  providers: [PackUpdate, PackService, UpsertTelegramScene, UpsertTwitterScene],
  exports: [PackService],
})
export class PackModule {}
