import { ApiProperty } from '@nestjs/swagger';

export class TypeMatchupDto {
  @ApiProperty() type: string;
  @ApiProperty() multiplier: number;
}

export class TypeChartEntryDto {
  @ApiProperty() type: string;
  @ApiProperty({ type: [TypeMatchupDto] }) weaknesses: TypeMatchupDto[];
  @ApiProperty({ type: [TypeMatchupDto] }) resistances: TypeMatchupDto[];
  @ApiProperty({ type: [TypeMatchupDto] }) immunities: TypeMatchupDto[];
  @ApiProperty({ type: [TypeMatchupDto] }) strongAgainst: TypeMatchupDto[];
}

export class WeatherBoostDto {
  @ApiProperty() weather: string;
  @ApiProperty({ type: [String] }) boostedTypes: string[];
}
