export type PaymentRequest = { cartId: string; amount: number; currency: string };
export type PaymentResult = { status: 'authorized' | 'cancelled' | 'failed'; transactionId?: string; message?: string };

export interface PaymentProvider {
  readonly id: string;
  initialize(): Promise<void> | void;
  authorize(request: PaymentRequest): Promise<PaymentResult>;
}
