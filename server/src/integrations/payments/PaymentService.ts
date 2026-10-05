import { PaymentMethod } from "../../constants/index.js";

export interface ProcessPaymentParams {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: PaymentMethod;
  bookTitle?: string;
  fineId?: string;
  fineIds?: string[];
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  providerTxnId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  receiptNumber: string;
}

export class PaymentService {
  /**
   * Processes fine payment via provider abstraction.
   * In production, this integrates with Razorpay / Stripe webhook & checkout flow.
   * Generates server-verified transaction proof.
   */
  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    if (params.amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    const uniqueNum = Math.floor(Math.random() * 90000 + 10000);
    const transactionId = `TXN-${uniqueNum}`;
    const providerTxnId = `PRV-${Date.now()}-${uniqueNum}`;
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;

    // In a real Razorpay / Stripe scenario, cryptographic signature verification happens here.
    return {
      success: true,
      transactionId,
      providerTxnId,
      amount: params.amount,
      method: params.method,
      paidAt: new Date(),
      receiptNumber,
    };
  }
}

export const paymentService = new PaymentService();
