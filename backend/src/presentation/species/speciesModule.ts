import { Module } from '@nestjs/common';
import { SpeciesController } from './speciesController';
import { SpeciesService } from '../../use-cases/species/speciesService';
import { SpeciesRepository } from '../../data/species/speciesRepository';
import { PvpModule } from '../pvp/pvpModule';

@Module({
  imports: [PvpModule],
  controllers: [SpeciesController],
  providers: [SpeciesService, SpeciesRepository],
  exports: [SpeciesService],
})
export class SpeciesModule {}
