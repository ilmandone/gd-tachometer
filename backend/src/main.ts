import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Abilita CORS per il frontend Angular in sviluppo
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
