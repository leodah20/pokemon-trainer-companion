import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeciesModule } from './presentation/species/speciesModule';
import { PrismaModule } from './presentation/prisma/prismaModule';

@Module({
  imports: [SpeciesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
