import { Module } from '@nestjs/common';
import { StartUpdate } from './start.update';

@Module({
  providers: [StartUpdate],
})
export class StartModule {}
