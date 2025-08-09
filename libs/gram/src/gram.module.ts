import { Global, Module } from '@nestjs/common';
import { GramService } from './gram.service';

@Global()
@Module({
  providers: [GramService],
  exports: [GramService],
})
export class GramModule {}
