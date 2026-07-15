import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RaidsService, UnknownRaidBossError } from '../../use-cases/raids/raidsService';
import { RaidBossDto, RaidCounterDto } from './dto/raidsResponseDto';

@ApiTags('Raids')
@Controller('api/raids')
export class RaidsController {
  constructor(private readonly raidsService: RaidsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get the current raid boss rotation' })
  getCurrent(): RaidBossDto[] {
    return this.raidsService.getCurrentRaids();
  }

  @Get(':id/counters')
  @ApiOperation({ summary: 'Get the top 10 estimated counters for a raid boss' })
  @ApiParam({ name: 'id', type: String, description: 'Raid boss id, e.g. boss-150' })
  @ApiQuery({ name: 'weather', type: String, required: false, description: 'Current weather, e.g. Rain' })
  getCounters(@Param('id') id: string, @Query('weather') weather?: string): RaidCounterDto[] {
    try {
      return this.raidsService.getCounters(id, weather);
    } catch (error) {
      if (error instanceof UnknownRaidBossError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
