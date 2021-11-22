import { Injectable } from '@nestjs/common';
import { UnleashService } from 'nestjs-unleash';

@Injectable()
export class AppService {
  constructor(private readonly unleashService: UnleashService) {}

  getPlans(): Record<string, boolean> {
    const freePlan = this.unleashService.isEnabled('freePlanEnabled', false);

    return {
      free: freePlan || undefined,
      startup: true,
      pro: true,
      enterprise: true,
    };
  }

  getPaymentMethods(storeId?: string): Record<string, boolean> {
    const pixEnabled = this.unleashService.isEnabled('pixEnabled', false, {
      userId: storeId,
    });

    return {
      pix: pixEnabled || undefined,
      creditCard: true,
      slip: true,
    };
  }

  getAntiFraudInfo(): Record<string, boolean | string[]> {
    /**
     * The use case for the "antiFraudEnabled" flag was already set at
     * controller level. In this PoC, the controller will return 404 and will
     * not even call this method if the aforementioned flag is off.
     *
     * As for variants, we cannot use this feature with this nestjs-unleash 😭
     * The variants for the flag "antiFraudEngine" can't be checked, so we'll
     * just return the list of available anti-fraud engines if "antiFraudEnabled"
     * is on, else null.
     */

    const enabled = this.unleashService.isEnabled('antiFraudEngine');
    const engines = ['clearsale', 'legiti', 'konduto'];

    return {
      enabled,
      engines: enabled ? engines : null,
    };
  }

  getFeatures() {
    const plans = this.getPlans();
    const paymentMethods = this.getPaymentMethods();
    const antiFraud = this.getAntiFraudInfo();

    return { plans, paymentMethods, antiFraud };
  }
}
