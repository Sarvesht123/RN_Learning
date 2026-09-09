import type { PaymentProvider, PaymentRequest } from './PaymentProvider';

class PaymentService {
  private provider?: PaymentProvider;
  setProvider(provider: PaymentProvider) { this.provider = provider; }
  async authorize(request: PaymentRequest) {
    if (!this.provider) throw new Error('No native payment provider has been configured.');
    await this.provider.initialize();
    return this.provider.authorize(request);
  }
}

export const paymentService = new PaymentService();
export type { PaymentProvider, PaymentRequest, PaymentResult } from './PaymentProvider';
