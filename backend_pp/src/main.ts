import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Variavel autoexplicativa: origensPermitidas
  // const origensPermitidas = process.env.CORS_ORIGINS?.slip(',') || []

  // Enable CORS
   app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Pedidos e Pagamentos')
    .setDescription('API para gerenciamento de pedidos e pagamentos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  // api json do swagger
  SwaggerModule.setup('api-json', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(process.env.PORT ?? 3080);
}
bootstrap();
