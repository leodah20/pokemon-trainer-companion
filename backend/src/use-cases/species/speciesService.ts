import { Injectable, NotFoundException } from '@nestjs/common';
import { SpeciesRepository } from '../../data/species/speciesRepository';
import { PvpRankingsRepository } from '../../data/pvp/pvpRankingsRepository';
import {
  PaginatedSpeciesDto,
  SpeciesDetailDto,
  SpeciesDto,
  SpeciesMetadataDto,
} from '../../presentation/species/dto/speciesResponseDto';
import { SpeciesFilterDto } from '../../presentation/species/dto/speciesFilterDto';
import { SpeciesFilter } from '../../domain/species/types';

@Injectable()
export class SpeciesService {
  constructor(
    private readonly speciesRepo: SpeciesRepository,
    private readonly pvpRepo: PvpRankingsRepository,
  ) {}

  findAll(filter: SpeciesFilterDto): PaginatedSpeciesDto {
    const internalFilter: SpeciesFilter = {
      name: filter.name,
      type: filter.type,
      generation: filter.generation,
      minAttack: filter.minAttack,
      maxAttack: filter.maxAttack,
      minDefense: filter.minDefense,
      maxDefense: filter.maxDefense,
      minStamina: filter.minStamina,
      maxStamina: filter.maxStamina,
      page: filter.page ?? 1,
      limit: filter.limit ?? 20,
      sortBy: (filter.sortBy as any) ?? 'id',
      sortOrder: filter.sortOrder ?? 'asc',
    };

    const { data, total } = this.speciesRepo.findAll(internalFilter);
    const totalPages = Math.ceil(total / internalFilter.limit);

    return {
      data: data.map((s) => this.toDto(s)),
      total,
      page: internalFilter.page,
      limit: internalFilter.limit,
      totalPages,
    };
  }

  findById(id: number): SpeciesDetailDto {
    const species = this.speciesRepo.findById(id);
    if (!species) {
      throw new NotFoundException(`Species with id ${id} not found`);
    }

    const evolutionFamily = this.speciesRepo.findEvolutionFamily(id);
    const counters = this.speciesRepo.findCounters(id);
    const pvpRankings = this.pvpRepo.findBySpeciesId(id);

    return {
      ...this.toDto(species),
      evolutionFamily,
      counters,
      pvpRankings: pvpRankings.map((r) => ({
        ...r,
        speciesName: species.name,
      })),
    };
  }

  getEvolutions(id: number) {
    const species = this.speciesRepo.findById(id);
    if (!species) {
      throw new NotFoundException(`Species with id ${id} not found`);
    }
    return this.speciesRepo.findEvolutionFamily(id);
  }

  getCounters(id: number) {
    const species = this.speciesRepo.findById(id);
    if (!species) {
      throw new NotFoundException(`Species with id ${id} not found`);
    }
    return this.speciesRepo.findCounters(id);
  }

  getPvpRankings(id: number) {
    const species = this.speciesRepo.findById(id);
    if (!species) {
      throw new NotFoundException(`Species with id ${id} not found`);
    }
    return this.pvpRepo.findBySpeciesId(id).map((r) => ({
      ...r,
      speciesName: species.name,
    }));
  }

  getMetadata(): SpeciesMetadataDto {
    return {
      generations: this.speciesRepo.getGenerations(),
      types: this.speciesRepo.getTypes(),
    };
  }

  private toDto(species: { id: number; name: string; generation: number; types: string[]; baseAttack: number; baseDefense: number; baseStamina: number }): SpeciesDto {
    return {
      id: species.id,
      name: species.name,
      generation: species.generation,
      types: species.types,
      baseAttack: species.baseAttack,
      baseDefense: species.baseDefense,
      baseStamina: species.baseStamina,
    };
  }
}
