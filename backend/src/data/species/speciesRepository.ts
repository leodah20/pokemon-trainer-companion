import { Injectable } from '@nestjs/common';
import { Species, SpeciesFilter, SpeciesCounter, EvolutionNode, EvolutionFamily } from '../../domain/species/types';
import { ALL_SPECIES, EVOLUTION_FAMILIES, TYPE_EFFECTIVENESS } from './speciesDatabase';
import { SPECIES_FORMS } from './speciesForms';

const ALL_SPECIES_WITH_FORMS = [...ALL_SPECIES, ...SPECIES_FORMS];

@Injectable()
export class SpeciesRepository {
  private readonly speciesById: Map<number, Species>;

  constructor() {
    this.speciesById = new Map(ALL_SPECIES_WITH_FORMS.map((s) => [s.id, s]));
  }

  findAll(filter: SpeciesFilter): { data: Species[]; total: number } {
    let filtered = [...ALL_SPECIES_WITH_FORMS];

    if (filter.name) {
      const q = filter.name.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (filter.type) {
      const t = filter.type.toLowerCase();
      filtered = filtered.filter((s) => s.types.some((st) => st.toLowerCase() === t));
    }
    if (filter.generation !== undefined) {
      filtered = filtered.filter((s) => s.generation === filter.generation);
    }
    if (filter.minAttack !== undefined) {
      filtered = filtered.filter((s) => s.baseAttack >= filter.minAttack!);
    }
    if (filter.maxAttack !== undefined) {
      filtered = filtered.filter((s) => s.baseAttack <= filter.maxAttack!);
    }
    if (filter.minDefense !== undefined) {
      filtered = filtered.filter((s) => s.baseDefense >= filter.minDefense!);
    }
    if (filter.maxDefense !== undefined) {
      filtered = filtered.filter((s) => s.baseDefense <= filter.maxDefense!);
    }
    if (filter.minStamina !== undefined) {
      filtered = filtered.filter((s) => s.baseStamina >= filter.minStamina!);
    }
    if (filter.maxStamina !== undefined) {
      filtered = filtered.filter((s) => s.baseStamina <= filter.maxStamina!);
    }

    const total = filtered.length;

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (filter.sortBy) {
        case 'id': cmp = a.id - b.id; break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'generation': cmp = a.generation - b.generation; break;
        case 'baseAttack': cmp = a.baseAttack - b.baseAttack; break;
        case 'baseDefense': cmp = a.baseDefense - b.baseDefense; break;
        case 'baseStamina': cmp = a.baseStamina - b.baseStamina; break;
      }
      return filter.sortOrder === 'desc' ? -cmp : cmp;
    });

    const offset = (filter.page - 1) * filter.limit;
    const data = filtered.slice(offset, offset + filter.limit);

    return { data, total };
  }

  findById(id: number): Species | undefined {
    return this.speciesById.get(id);
  }

  findEvolutionFamily(speciesId: number): EvolutionFamily | null {
    const species = this.speciesById.get(speciesId);
    if (!species) return null;

    for (const [baseId, chain] of Object.entries(EVOLUTION_FAMILIES)) {
      if (chain.includes(speciesId)) {
        const index = chain.indexOf(speciesId);
        let type: 'basic' | 'stage1' | 'stage2';
        if (chain.length === 1) {
          type = 'basic';
        } else if (index === 0) {
          type = 'basic';
        } else if (index === chain.length - 1) {
          type = 'stage2';
        } else {
          type = 'stage1';
        }

        const evolutions: EvolutionNode[] = chain
          .filter((id) => id !== speciesId)
          .map((id) => {
            const s = this.speciesById.get(id)!;
            const evIndex = chain.indexOf(id);
            let evType: 'basic' | 'stage1' | 'stage2';
            if (chain.length === 1) {
              evType = 'basic';
            } else if (evIndex === 0) {
              evType = 'basic';
            } else if (evIndex === chain.length - 1) {
              evType = 'stage2';
            } else {
              evType = 'stage1';
            }
            return {
              speciesId: id,
              speciesName: s.name,
              type: evType,
              candyCost: evIndex <= 1 ? 25 : 100,
            };
          });

        return {
          speciesId,
          speciesName: species.name,
          evolutions,
        };
      }
    }

    return {
      speciesId,
      speciesName: species.name,
      evolutions: [],
    };
  }

  findCounters(speciesId: number): SpeciesCounter[] {
    const species = this.speciesById.get(speciesId);
    if (!species) return [];

    const counts = new Map<string, { count: number; totalEffectiveness: number }>();

    for (const candidate of ALL_SPECIES_WITH_FORMS) {
      if (candidate.id === speciesId) continue;

      let effectiveness = 1;
      for (const targetType of species.types) {
        const attacking = TYPE_EFFECTIVENESS[candidate.types[0]];
        if (attacking && attacking[targetType] !== undefined) {
          effectiveness *= attacking[targetType];
        }
      }

      if (effectiveness >= 1.5) {
        const key = candidate.types.join('/');
        const existing = counts.get(key) || { count: 0, totalEffectiveness: 0 };
        existing.count++;
        existing.totalEffectiveness += effectiveness;
        counts.set(key, existing);
      }
    }

    const sorted = [...counts.entries()]
      .sort((a, b) => b[1].totalEffectiveness - a[1].totalEffectiveness)
      .slice(0, 10);

    return sorted.map(([typeKey]) => {
      const type = typeKey.split('/')[0];
      const best = ALL_SPECIES
        .filter((s) => s.types.includes(type) && s.id !== speciesId && !s.form)
        .sort((a, b) => (b.baseAttack + b.baseDefense) - (a.baseAttack + a.baseDefense))[0];
      return {
        speciesId: best?.id ?? 0,
        speciesName: best?.name ?? typeKey,
        types: typeKey.split('/'),
        effectiveness: 1.6,
      };
    });
  }

  getGenerations(): number[] {
    return [...new Set(ALL_SPECIES.map((s) => s.generation))].sort();
  }

  getTypes(): string[] {
    return [...new Set(ALL_SPECIES.flatMap((s) => s.types))].sort();
  }
}
