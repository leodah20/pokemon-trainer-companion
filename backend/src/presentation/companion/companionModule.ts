import { Module } from '@nestjs/common';
import { CompanionController } from './companionController';
import { CompanionService } from '../../use-cases/companion/companionService';
import { SpeciesModule } from '../species/speciesModule';

@Module({
  imports: [SpeciesModule],
  controllers: [CompanionController],
  providers: [CompanionService],
})
export class CompanionModule {}
