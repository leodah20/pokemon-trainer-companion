import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TypeChartService, UnknownTypeError } from '../../use-cases/type-effectiveness/typeChartService';
import { TypeChartEntryDto, WeatherBoostDto } from './dto/typeChartResponseDto';

@ApiTags('Type Chart')
@Controller('type-chart')
export class TypeChartController {
  constructor(private readonly typeChartService: TypeChartService) {}

  @Get()
  @ApiOperation({ summary: 'Get the full 18x18 type effectiveness matrix (attacker -> defender -> multiplier)' })
  getFullChart(): Record<string, Record<string, number>> {
    return this.typeChartService.getFullChart();
  }

  @Get('weather/boosts')
  @ApiOperation({ summary: 'Get which types are boosted by each weather condition' })
  getWeatherBoosts(): WeatherBoostDto[] {
    return this.typeChartService.getWeatherBoosts();
  }

  @Get(':type')
  @ApiOperation({ summary: 'Get weaknesses, resistances, immunities, and strong matchups for a single type' })
  @ApiParam({ name: 'type', type: String, description: 'Pokemon type name, e.g. Fire' })
  getTypeEntry(@Param('type') type: string): TypeChartEntryDto {
    try {
      return this.typeChartService.getTypeEntry(type);
    } catch (error) {
      if (error instanceof UnknownTypeError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
