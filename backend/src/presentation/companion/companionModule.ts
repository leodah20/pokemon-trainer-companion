import { Module } from '@nestjs/common';
import { CompanionController } from './companionController';
import { CompanionService } from '../../use-cases/companion/companionService';
import { SpeciesModule } from '../species/speciesModule';
import { KnowledgeRepository } from '../../data/knowledge/knowledgeRepository';

@Module({
  imports: [SpeciesModule],
  controllers: [CompanionController],
  providers: [CompanionService, KnowledgeRepository],
})
export class CompanionModule {}
