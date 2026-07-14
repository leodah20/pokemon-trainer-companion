import { ApiPropertyOptional } from '@nestjs/swagger';

export class SpeciesFilterDto {
  @ApiPropertyOptional({ description: 'Search by name (partial match)' })
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by type (e.g. Fire, Water)' })
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by generation number' })
  generation?: number;

  @ApiPropertyOptional({ description: 'Minimum base attack' })
  minAttack?: number;

  @ApiPropertyOptional({ description: 'Maximum base attack' })
  maxAttack?: number;

  @ApiPropertyOptional({ description: 'Minimum base defense' })
  minDefense?: number;

  @ApiPropertyOptional({ description: 'Maximum base defense' })
  maxDefense?: number;

  @ApiPropertyOptional({ description: 'Minimum base stamina' })
  minStamina?: number;

  @ApiPropertyOptional({ description: 'Maximum base stamina' })
  maxStamina?: number;

  @ApiPropertyOptional({ default: 1 })
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'id' })
  sortBy?: string = 'id';

  @ApiPropertyOptional({ default: 'asc', enum: ['asc', 'desc'] })
  sortOrder?: 'asc' | 'desc' = 'asc';
}
