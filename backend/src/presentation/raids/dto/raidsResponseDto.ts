import { ApiProperty } from '@nestjs/swagger';

export class RaidBossDto {
  @ApiProperty() id: string;
  @ApiProperty() speciesId: number;
  @ApiProperty() speciesName: string;
  @ApiProperty() tier: number;
  @ApiProperty({ type: [String] }) types: string[];
}

export class RaidCounterDto {
  @ApiProperty() speciesId: number;
  @ApiProperty() speciesName: string;
  @ApiProperty({ type: [String] }) types: string[];
  @ApiProperty({ description: 'Relative DPS estimate, not a full battle simulation — see RaidsService docs' })
  estimatedDps: number;
  @ApiProperty() weatherBoosted: boolean;
}
