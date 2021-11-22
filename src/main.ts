import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // strip off any properties that
      // do not use any validation decorators
      whitelist: true,
      // transform payloads to objects typed
      // according to their DTO classes;
      // will also perform conversion of
      // path parameter and query parameter
      // from string to another primitive types
      transform: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
