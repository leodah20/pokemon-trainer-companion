import { Injectable } from '@nestjs/common';
import { KnowledgeEntry } from '../../domain/knowledge/types';
import { KNOWLEDGE_ENTRIES } from './knowledge-data';

@Injectable()
export class KnowledgeRepository {
  private readonly entriesBySpeciesId: Map<number, KnowledgeEntry>;

  constructor() {
    this.entriesBySpeciesId = new Map(KNOWLEDGE_ENTRIES.map((e) => [e.speciesId, e]));
  }

  findBySpeciesId(speciesId: number): KnowledgeEntry | null {
    return this.entriesBySpeciesId.get(speciesId) ?? null;
  }
}
