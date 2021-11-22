import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { LDClient } from 'launchdarkly-node-server-sdk';
import {
  LAUNCHDARKLY_PROVIDER,
  LAUNCHDARKLY_DEFAULT_USER as USER,
} from './constants';

@Injectable()
export class AppService {
  constructor(
    @Inject(LAUNCHDARKLY_PROVIDER) private readonly ldClient: LDClient,
  ) {}

  async getPlans(): Promise<Record<string, boolean>> {
    const freePlan = await this.ldClient.variation(
      'freePlanEnabled',
      USER,
      false,
    );

    return {
      free: freePlan || undefined,
      startup: true,
      pro: true,
      enterprise: true,
    };
  }

  async getPaymentMethods(storeId?: string): Promise<Record<string, boolean>> {
    const user = storeId ? { key: storeId } : USER;
    const pixEnabled = await this.ldClient.variation('pixEnabled', user, false);

    return {
      pix: pixEnabled || undefined,
      creditCard: true,
      slip: true,
    };
  }

  async getAntiFraudInfo(): Promise<Record<string, boolean | string[]>> {
    const isEnabled = await this.ldClient.variation(
      'antiFraudEnabled',
      USER,
      false,
    );

    if (!isEnabled) {
      return {
        enabled: false,
        engines: null,
      };
    }

    const { engines } = await this.ldClient.variation(
      'antiFraudEngine',
      {
        key: crypto
          .createHash('md5')
          .update(Date.now().toString())
          .digest('hex'),
      },
      { engines: null },
    );

    return {
      enabled: !!engines,
      engines,
    };
  }

  async getFeatures() {
    const [plans, paymentMethods, antiFraud] = await Promise.all([
      this.getPlans(),
      this.getPaymentMethods(),
      this.getAntiFraudInfo(),
    ]);

    return { plans, paymentMethods, antiFraud };
  }
}
