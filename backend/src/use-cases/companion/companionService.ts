import { Injectable } from '@nestjs/common';
import { SpeciesService } from '../species/speciesService';
import { generateCompanionSuggestion } from '../../data/companion/geminiClient';
import { buildCompanionPrompt } from './buildCompanionPrompt';
import { CompanionContext } from '../../domain/companion/types';

@Injectable()
export class CompanionService {
  constructor(private readonly speciesService: SpeciesService) {}

  async getSuggestion(speciesId: number, context: CompanionContext, extra?: string): Promise<string> {
    // findById throws NotFoundException for an unknown id — let it propagate, Nest turns it
    // into a 404 automatically, same as the species endpoints.
    const species = this.speciesService.findById(speciesId);
    const prompt = buildCompanionPrompt(species, context, extra);
    return generateCompanionSuggestion(prompt);
  }
}
