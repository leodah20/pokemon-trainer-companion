import { ApiProperty } from '@nestjs/swagger';

class EvolutionNodeDto {
  @ApiProperty() speciesId: number;
  @ApiProperty() speciesName: string;
  @ApiProperty() type: string;
  @ApiProperty() candyCost: number;
}

class EvolutionFamilyDto {
  @ApiProperty() speciesId: number;
  @ApiProperty() speciesName: string;
  @ApiProperty({ type: [EvolutionNodeDto] }) evolutions: EvolutionNodeDto[];
}

class SpeciesCounterDto {
  @ApiProperty() speciesId: number;
  @ApiProperty() speciesName: string;
  @ApiProperty({ type: [String] }) types: string[];
  @ApiProperty() effectiveness: number;
}

export class PvpRankingDto {
  @ApiProperty() league: string;
  @ApiProperty() rank: number;
  @ApiProperty() rating: number;
  @ApiProperty() speciesId: number;
  @ApiProperty() speciesName: string;
  @ApiProperty() fastMove: string;
  @ApiProperty() chargeMove: string;
}

export class SpeciesDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() generation: number;
  @ApiProperty({ type: [String] }) types: string[];
  @ApiProperty() baseAttack: number;
  @ApiProperty() baseDefense: number;
  @ApiProperty() baseStamina: number;
}

export class SpeciesDetailDto extends SpeciesDto {
  @ApiProperty({ type: EvolutionFamilyDto, nullable: true })
  evolutionFamily: EvolutionFamilyDto | null;
  @ApiProperty({ type: [SpeciesCounterDto] })
  counters: SpeciesCounterDto[];
  @ApiProperty({ type: [PvpRankingDto] })
  pvpRankings: PvpRankingDto[];
}

export class PaginatedSpeciesDto {
  @ApiProperty({ type: [SpeciesDto] }) data: SpeciesDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class SpeciesMetadataDto {
  @ApiProperty({ type: [Number] }) generations: number[];
  @ApiProperty({ type: [String] }) types: string[];
}
