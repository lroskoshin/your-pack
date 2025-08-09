import { Module } from '@nestjs/common';
import { AdminUpdate } from './admin.update';
import { SetupGramWizard } from './setup-gram.wizard';

@Module({
  providers: [AdminUpdate, SetupGramWizard],
  exports: [AdminUpdate],
})
export class AdminModule {}
