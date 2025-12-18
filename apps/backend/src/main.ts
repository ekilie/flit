import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SeederService } from 'src/modules/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const apiPrefix = '/api/v1';

  app.enableCors();
  app.use(helmet());
  app.setGlobalPrefix(apiPrefix, { exclude: ['/'] });

  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('app.name') || 'Default App Name')
    .setDescription(
      configService.get<string>('app.description') || 'Default App Description',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.get(SeederService).seed();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
