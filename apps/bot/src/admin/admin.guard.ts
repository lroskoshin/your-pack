import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { UserContext } from '../interfaces/context.interface';
import { ConfigService } from '@nestjs/config';
import { Env } from '@app/config/env.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService<Env>,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext<UserContext>();
    const isAdmin =
      this.configService.get('ADMIN_ID', { infer: true }) === from?.id;
    if (!isAdmin) {
      throw new TelegrafException('You are not admin 😡');
    }

    return true;
  }
}
