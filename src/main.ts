import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3000;

  // Omogućavamo frontend-u da šalje request-e ka backend-u
  app.enableCors({
    origin: 'https://sbb20428.mycpanel.rs', // tvoja frontend domena
    credentials: true,
  });

  console.log('DATABASE_URL:', config.get<string>('DATABASE_URL')); // za proveru env var

  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}

bootstrap();