import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IClient } from '@splitsoftware/splitio/types/splitio';
import { SPLIT_PROVIDER, SPLIT_DEFAULT_USER_KEY as KEY } from './constants';

@Injectable()
export class AppService {
  constructor(@Inject(SPLIT_PROVIDER) private readonly splitClient: IClient) {}

  getPlans(): Record<string, boolean> {
    const freePlan =
      this.splitClient.getTreatment(KEY, 'freePlanEnabled') === 'on';

    return {
      free: freePlan || undefined,
      startup: true,
      pro: true,
      enterprise: true,
    };
  }

  getPaymentMethods(storeId?: string): Record<string, boolean> {
    const pixEnabled =
      this.splitClient.getTreatment(storeId ?? KEY, 'pixEnabled') === 'on';

    return {
      pix: pixEnabled || undefined,
      creditCard: true,
      slip: true,
    };
  }

  getAntiFraudInfo(): Record<string, boolean | string[]> {
    if (this.splitClient.getTreatment(KEY, 'antiFraudEnabled') !== 'on') {
      return {
        enabled: false,
        engines: null,
      };
    }

    const { treatment, config } = this.splitClient.getTreatmentWithConfig(
      crypto.createHash('md5').update(Date.now().toString()).digest('hex'),
      'antiFraudEngine',
    );
    const enabled = treatment !== 'off';
    const { engines } = JSON.parse(config);

    return { enabled, engines };
  }

  getFeatures() {
    const plans = this.getPlans();
    const paymentMethods = this.getPaymentMethods();
    const antiFraud = this.getAntiFraudInfo();

    return { plans, paymentMethods, antiFraud };
  }
}
