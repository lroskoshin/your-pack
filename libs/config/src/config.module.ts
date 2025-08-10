import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Env } from './env.schema';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const validated = plainToInstance(Env, config, {
          enableImplicitConversion: true,
        });
        const errors = validateSync(validated, {
          skipMissingProperties: false,
          whitelist: true,
          forbidUnknownValues: true,
        });
        if (errors.length > 0) {
          const messages = errors.map((e) => {
            const constraints = e.constraints
              ? JSON.stringify(e.constraints)
              : 'invalid';
            return `${e.property}: ${constraints}`;
          });
          throw new Error(`Config validation error: ${messages.join('; ')}`);
        }
        return validated;
      },
    }),
  ],
})
export class EnvModule {}
