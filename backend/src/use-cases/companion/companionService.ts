import { Injectable } from '@nestjs/common';
import { SpeciesService } from '../species/speciesService';
import { generateCompanionSuggestion } from '../../data/companion/geminiClient';
import { buildCompanionPrompt } from './buildCompanionPrompt';
import { CompanionContext } from '../../domain/companion/types';
import { KnowledgeRepository } from '../../data/knowledge/knowledgeRepository';

@Injectable()
export class CompanionService {
  constructor(
    private readonly speciesService: SpeciesService,
    private readonly knowledgeRepository: KnowledgeRepository,
  ) {}

  async getSuggestion(speciesId: number, context: CompanionContext, extra?: string): Promise<string> {
    // findById throws NotFoundException for an unknown id — let it propagate, Nest turns it
    // into a 404 automatically, same as the species endpoints.
    const species = this.speciesService.findById(speciesId);
    const knowledge = this.knowledgeRepository.findBySpeciesId(speciesId);
    const prompt = buildCompanionPrompt(species, context, extra, knowledge);
    return generateCompanionSuggestion(prompt);
  }
}
