import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('plans')
  getPlans() {
    return this.appService.getPlans();
  }

  @Get('payment-methods')
  getPaymentMethods(@Query('storeId') storeId?: string) {
    return this.appService.getPaymentMethods(storeId);
  }

  @Get('anti-fraud')
  getAntiFraudInfo() {
    return this.appService.getAntiFraudInfo();
  }

  @Get('features')
  getFeatures() {
    return this.appService.getFeatures();
  }
}
