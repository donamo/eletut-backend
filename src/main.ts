import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { getNestLogLevels } from './common/logging';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getNestLogLevels(process.env.LOG_LEVEL),
  });
  const config = app.get(ConfigService);

  configureApp(app);

  await app.listen(config.get<number>('PORT') ?? 3000);
}

void bootstrap();
