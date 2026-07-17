import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DATA_VERSION } from './data/dataVersion';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('system/version')
  getVersion() {
    return DATA_VERSION;
  }
}
