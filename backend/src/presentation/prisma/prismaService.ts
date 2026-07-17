import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly dbEnabled: boolean;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (url) {
      super({ adapter: new PrismaPg({ connectionString: url }) });
    } else {
      process.env.DATABASE_URL = 'postgresql://_:_@localhost:5432/_';
      super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
    }
    this.dbEnabled = !!url;
  }

  async onModuleInit(): Promise<void> {
    if (!this.dbEnabled) {
      this.logger.warn('DATABASE_URL not set — running without database. JSON-backed features work normally.');
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.dbEnabled) return;
    await this.$disconnect();
  }
}
