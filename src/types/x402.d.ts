import "express";

declare global {
  namespace Express {
    interface Request {
      paymentConfig?: {
        amount?: string;
        payTo?: string;
        asset?: string;
        network?: string;
      };

      /**
       * The facilitator-verified payment info (added by X402 middleware)
       */
      payment?: import("../../lib/x402-middleware").PaymentInfo;

      /**
       * Client-triggered wallet payment function
       * (added in /purchase route before redirect)
       */
      paymentHandler?: () => Promise<{
        signature: string;
      }>;
    }
  }
}
