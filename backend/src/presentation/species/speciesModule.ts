import { Module } from '@nestjs/common';
import { SpeciesController } from './speciesController';
import { SpeciesService } from '../../use-cases/species/speciesService';
import { SpeciesRepository } from '../../data/species/speciesRepository';
import { PvpRankingsRepository } from '../../data/pvp/pvpRankingsRepository';

@Module({
  controllers: [SpeciesController],
  providers: [SpeciesService, SpeciesRepository, PvpRankingsRepository],
  exports: [SpeciesService],
})
export class SpeciesModule {}
