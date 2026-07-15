import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeciesModule } from './presentation/species/speciesModule';
import { PrismaModule } from './presentation/prisma/prismaModule';
import { TypeChartModule } from './presentation/type-chart/typeChartModule';
import { PvpModule } from './presentation/pvp/pvpModule';
import { RaidsModule } from './presentation/raids/raidsModule';

@Module({
  imports: [SpeciesModule, PrismaModule, TypeChartModule, PvpModule, RaidsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
