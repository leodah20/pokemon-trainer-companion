import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PvpService, UnknownLeagueError } from '../../use-cases/pvp/pvpService';
import { PvpRankingDto } from '../species/dto/speciesResponseDto';
import { PvpLeague } from '../../data/pvp/pvpRankingsRepository';

@ApiTags('PvP')
@Controller('api/pvp')
export class PvpController {
  constructor(private readonly pvpService: PvpService) {}

  @Get('leagues')
  @ApiOperation({ summary: 'Get the list of available PvP leagues' })
  getLeagues(): PvpLeague[] {
    return this.pvpService.getLeagues();
  }

  @Get('top/:league')
  @ApiOperation({ summary: 'Get the top-ranked species for a PvP league' })
  @ApiParam({ name: 'league', type: String, description: 'great | ultra | master' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Defaults to 20' })
  getTopByLeague(@Param('league') league: string, @Query('limit') limit?: string): PvpRankingDto[] {
    try {
      return this.pvpService.getTopByLeague(league, limit ? Number(limit) : 20);
    } catch (error) {
      if (error instanceof UnknownLeagueError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
