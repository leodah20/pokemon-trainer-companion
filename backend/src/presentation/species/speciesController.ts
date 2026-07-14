import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SpeciesService } from '../../use-cases/species/speciesService';
import { SpeciesFilterDto } from './dto/speciesFilterDto';
import {
  SpeciesDto,
  SpeciesDetailDto,
  PaginatedSpeciesDto,
  SpeciesMetadataDto,
} from './dto/speciesResponseDto';

@ApiTags('Species')
@Controller('api/species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all species with filtering, sorting, and pagination' })
  async findAll(
    @Query() filter: SpeciesFilterDto,
  ): Promise<PaginatedSpeciesDto> {
    return this.speciesService.findAll(filter);
  }

  @Get('metadata')
  @ApiOperation({ summary: 'Get available generations and types for filter options' })
  async getMetadata(): Promise<SpeciesMetadataDto> {
    return this.speciesService.getMetadata();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full species detail including evolutions, counters, and PvP rankings' })
  @ApiParam({ name: 'id', type: Number, description: 'Pokédex number' })
  async findById(@Param('id') id: string): Promise<SpeciesDetailDto> {
    return this.speciesService.findById(Number(id));
  }

  @Get(':id/evolutions')
  @ApiOperation({ summary: 'Get evolution family for a species' })
  @ApiParam({ name: 'id', type: Number, description: 'Pokédex number' })
  async getEvolutions(@Param('id') id: string) {
    return this.speciesService.getEvolutions(Number(id));
  }

  @Get(':id/counters')
  @ApiOperation({ summary: 'Get top type counters for a species' })
  @ApiParam({ name: 'id', type: Number, description: 'Pokédex number' })
  async getCounters(@Param('id') id: string) {
    return this.speciesService.getCounters(Number(id));
  }

  @Get(':id/pvp-rankings')
  @ApiOperation({ summary: 'Get PvP rankings across all leagues for a species' })
  @ApiParam({ name: 'id', type: Number, description: 'Pokédex number' })
  async getPvpRankings(@Param('id') id: string) {
    return this.speciesService.getPvpRankings(Number(id));
  }
}
