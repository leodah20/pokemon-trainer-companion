import { Module } from '@nestjs/common';
import { TypeChartController } from './typeChartController';
import { TypeChartService } from '../../use-cases/type-effectiveness/typeChartService';

@Module({
  controllers: [TypeChartController],
  providers: [TypeChartService],
  exports: [TypeChartService],
})
export class TypeChartModule {}
