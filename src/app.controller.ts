import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('plans')
  async getPlans() {
    return this.appService.getPlans();
  }

  @Get('payment-methods')
  async getPaymentMethods(@Query('storeId') storeId?: string) {
    return this.appService.getPaymentMethods(storeId);
  }

  @Get('anti-fraud')
  async getAntiFraudInfo() {
    return this.appService.getAntiFraudInfo();
  }

  @Get('features')
  async getFeatures() {
    return this.appService.getFeatures();
  }
}
