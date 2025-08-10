import { NestFactory } from '@nestjs/core';
import { BotModule } from './bot.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(BotModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );
  await app.listen(process.env.API_PORT ?? 3007);
  console.log(`Server is running on ${await app.getUrl()}`);
}
bootstrap();
