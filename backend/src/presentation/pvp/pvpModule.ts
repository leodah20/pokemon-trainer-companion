import { Module } from '@nestjs/common';
import { PvpController } from './pvpController';
import { PvpService } from '../../use-cases/pvp/pvpService';
import { PvpRankingsRepository } from '../../data/pvp/pvpRankingsRepository';

@Module({
  controllers: [PvpController],
  providers: [PvpService, PvpRankingsRepository],
  exports: [PvpService, PvpRankingsRepository],
})
export class PvpModule {}
