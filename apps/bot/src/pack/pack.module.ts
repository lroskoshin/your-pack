import { Module } from '@nestjs/common';
import { PackUpdate } from './pack.update';
import { EditPackScene } from './scenes/edit-pack.scene';
import { PackService } from './pack.service';
import { UpsertTelegramScene } from './scenes/upsert-telegram.scene';
import { UpsertTwitterScene } from './scenes/upsert-twitter.scene';

@Module({
  providers: [
    PackUpdate,
    EditPackScene,
    PackService,
    UpsertTelegramScene,
    UpsertTwitterScene,
  ],
})
export class PackModule {}
