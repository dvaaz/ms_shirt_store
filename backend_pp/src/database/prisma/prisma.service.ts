import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // private readonly logger = new Logger(PrismaService.name); // Logger para registrar mensagens de log

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    const adapter = new PrismaMariaDb(connectionString);

    super({
      adapter,
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    // this.logger.log('Connecting to database...');
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
