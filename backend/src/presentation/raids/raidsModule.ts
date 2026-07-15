import { Module } from '@nestjs/common';
import { RaidsController } from './raidsController';
import { RaidsService } from '../../use-cases/raids/raidsService';
import { RaidsRepository } from '../../data/raids/raidsRepository';

@Module({
  controllers: [RaidsController],
  providers: [RaidsService, RaidsRepository],
  exports: [RaidsService],
})
export class RaidsModule {}
