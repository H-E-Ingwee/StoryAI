import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const PORT = parseInt(process.env.API_PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation (only in dev)
  if (NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('StoryAI API')
      .setDescription('AI-powered storyboard and concept art generation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Start server
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ StoryAI API listening on port ${PORT}`);
    console.log(`✓ Environment: ${NODE_ENV}`);
    if (NODE_ENV === 'development') {
      console.log(`✓ Swagger docs: http://localhost:${PORT}/api/docs`);
    }
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
