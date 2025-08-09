import { Global, Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';

@Global()
@Module({
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule {}
