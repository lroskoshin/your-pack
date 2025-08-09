import { Injectable } from '@nestjs/common';

@Injectable()
export class BotService {
  getHello(): string {
    return 'Hello World!';
  }
}
