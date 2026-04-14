// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Omogućavamo frontend-u da šalje request-e ka backend-u
  app.enableCors({
    origin: ['https://sbb20428.mycpanel.rs/leave-management/'], // live frontend URL
    credentials: true, // opciono, za cookie-based auth
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();