import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getPlans(): Record<string, boolean> {
    // check for flag "freePlanEnabled"
    const freePlan = true;

    return {
      free: freePlan,
      startup: true,
      pro: true,
      enterprise: true,
    };
  }

  getPaymentMethods(storeId?: string): Record<string, boolean> {
    // check for flag "pixEnabled"
    const pixEnabled = true;

    return {
      pix: pixEnabled,
      creditCard: true,
      slip: true,
    };
  }

  getAntiFraudInfo(): Record<string, boolean | string[]> {
    // check for flag "antiFraudEnabled"
    const isEnabled = true;

    if (isEnabled) {
      return {
        enabled: false,
        engines: null,
      };
    }

    // check for flag/variant "antiFraudEngine" if possible
    const engines = ['clearsale', 'legiti', 'konduto'];

    return {
      enabled: true,
      engines,
    };
  }

  getFeatures() {
    const plans = this.getPlans();
    const paymentMethods = this.getPaymentMethods();
    const antiFraud = this.getAntiFraudInfo();

    return { plans, paymentMethods, antiFraud };
  }
}
