import { Controller, Get, Query } from '@nestjs/common';
import { IfEnabled } from 'nestjs-unleash';
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

  /**
   * The `@IfEnabled` decorator will intercept the request and return 404
   * if the flag "antiFraudEnabled" is off.
   */
  @IfEnabled('antiFraudEnabled')
  @Get('anti-fraud')
  getAntiFraudInfo() {
    return this.appService.getAntiFraudInfo();
  }

  @Get('features')
  getFeatures() {
    return this.appService.getFeatures();
  }
}
