// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Omogućavamo frontend-u da šalje request-e ka backend-u
  app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://leave-project.vercel.app',
    'https://leave-project-o161094ee-katarinas-projects-23d67f0f.vercel.app'
  ],
      credentials: true, // opciono, za cookie-based auth
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();