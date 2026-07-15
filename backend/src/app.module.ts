import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeciesModule } from './presentation/species/speciesModule';
import { PrismaModule } from './presentation/prisma/prismaModule';
import { TypeChartModule } from './presentation/type-chart/typeChartModule';
import { PvpModule } from './presentation/pvp/pvpModule';
import { RaidsModule } from './presentation/raids/raidsModule';
import { CompanionModule } from './presentation/companion/companionModule';

@Module({
  imports: [SpeciesModule, PrismaModule, TypeChartModule, PvpModule, RaidsModule, CompanionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
