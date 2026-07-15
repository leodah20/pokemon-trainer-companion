import { ApiProperty } from '@nestjs/swagger';
import { COMPANION_CONTEXTS } from '../../../domain/companion/types';
import type { CompanionContext } from '../../../domain/companion/types';

// No class-validator pipeline is wired up in this project yet (see SpeciesFilterDto) — validated
// manually in the controller instead, same pattern as TypeChartController/RaidsController.
export class CompanionSuggestRequestDto {
  @ApiProperty({ description: 'Pokedex number' })
  speciesId: number;

  @ApiProperty({ enum: COMPANION_CONTEXTS })
  context: CompanionContext;

  @ApiProperty({ required: false, description: "Extra text from the trainer's screen (e.g. OCR'd CP/appraisal)" })
  extra?: string;
}

export class CompanionSuggestResponseDto {
  @ApiProperty() suggestion: string;
}
