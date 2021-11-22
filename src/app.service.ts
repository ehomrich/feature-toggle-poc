import { Inject, Injectable } from '@nestjs/common';
import { Unleash } from 'unleash-client';
import { UNLEASH_PROVIDER } from './constants';

@Injectable()
export class AppService {
  constructor(
    @Inject(UNLEASH_PROVIDER) private readonly unleashClient: Unleash,
  ) {}

  getPlans(): Record<string, boolean> {
    const freePlan =
      this.unleashClient.isEnabled('freePlanEnabled') || undefined;

    return {
      free: freePlan,
      startup: true,
      pro: true,
      enterprise: true,
    };
  }

  getPaymentMethods(storeId?: string): Record<string, boolean> {
    const pixEnabled = this.unleashClient.isEnabled('pixEnabled', {
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
     * First, we check for the global anti-fraud toggle.
     * If this toggle is off, we don't even check for "antiFraudEngine" variations.
     */
    if (!this.unleashClient.isEnabled('antiFraudEnabled')) {
      return {
        enabled: false,
        engines: null,
      };
    }

    /**
     * If we've come this far, it's time to check for variants of the
     * "antiFraudEngine" toggle.
     * As we are not passing any context, variations are distributed according
     * to the weight assigned to each in the Unleash dashboard.
     *
     * If the "antiFraudEngine" toggle is off, all variants are considered
     * unavailable, and Unleash returns a static variant indicating the toggle
     * is disabled. In this case, there is no payload and the `enabled` property
     * is `false`.
     * In this scenario, the response will be identical to the scenario of the
     * "antiFraudEnabled" toggle turned off.
     */
    const { enabled, payload } =
      this.unleashClient.getVariant('antiFraudEngine');
    const engines = payload?.value ? JSON.parse(payload.value) : null;

    return {
      enabled: enabled,
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
