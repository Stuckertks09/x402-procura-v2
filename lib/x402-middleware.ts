/**
 * x402 Express Middleware
 * Handles payment verification and routing for the x402 protocol
 * Uses native fetch instead of axios
 */

import type { Request, Response, NextFunction } from 'express';

export interface X402Options {
  facilitatorUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RouteConfig {
  amount?: string;
  payTo?: string;
  asset?: string;
  network?: string;
}

export interface PaymentInfo {
  verified: boolean;
  nonce: string;
  amount: string;
  recipient: string;
  resourceId: string;
  transactionSignature: string;
}

export interface VerificationResult {
  isValid: boolean;
  error?: string;
}

export interface SettlementResult {
  status: string;
  transactionSignature?: string;
  error?: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  facilitator?: string;
  timestamp?: string;
  error?: string;
}

export interface StatsResult {
  success: boolean;
  data?: {
    totalNonces: number;
    usedNonces: number;
    activeNonces: number;
    expiredNonces: number;
  };
  error?: string;
}

export interface PaymentRequestData {
  payload: {
    amount: string;
    recipient: string;
    resourceId: string;
    resourceUrl: string;
    nonce: string;
    timestamp: number;
    expiry: number;
  };
  signature: string;
  clientPublicKey: string;
}

// Extend Express Request to include payment info
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      payment?: PaymentInfo;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * x402 Middleware Class
 */
export class X402Middleware {
  private facilitatorUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private routeConfig: RouteConfig;

  constructor(options: X402Options = {}, routeConfig: RouteConfig = {}) {
    this.facilitatorUrl = options.facilitatorUrl || 'http://localhost:3001';
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.routeConfig = routeConfig;
  }

  /**
   * Main middleware function - implements x402 protocol
   */
  middleware() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // ✅ Dynamic config injection (now has access to req)
    const effectiveAmount = 
  this.routeConfig.amount === "dynamic" && req.paymentConfig?.amount
    ? req.paymentConfig.amount
    : this.routeConfig.amount;

const effectivePayTo =
  this.routeConfig.payTo === "dynamic" && req.paymentConfig?.payTo
    ? req.paymentConfig.payTo
    : this.routeConfig.payTo;

    try {
      // Extract payment request from X-PAYMENT header (x402 standard)
      const paymentHeader = req.headers["x-payment"] as string | undefined;

      if (!paymentHeader) {
        const { amount, payTo, asset, network } = this.routeConfig;

        res.status(402).json({
          request_id: req.body?.request_id || crypto.randomUUID(),
          accepts: [
            {
              scheme: "exact",
              network: network || "solana-mainnet",
              maxAmountRequired: effectiveAmount || "1000000",
              asset: asset || "USDC_SPL_MINT_ADDRESS",
              payTo: effectivePayTo || "MERCHANT_WALLET_ADDRESS",
              resource: req.originalUrl,
            },
          ],
          error: "Payment Required",
          message: "The X-PAYMENT header is missing or empty.",
        });
        return;
      }

        // Parse payment request
        let paymentRequest: PaymentRequestData;
        try {
          paymentRequest = JSON.parse(paymentHeader) as PaymentRequestData;
        } catch (error) {
          res.status(400).json({
            error: 'Invalid Payment Request',
            message: 'X-PAYMENT header must contain valid JSON',
            code: 'INVALID_PAYMENT_FORMAT',
          });
          return;
        }

        // Verify payment request with facilitator
        const verificationResult = await this.verifyPayment(paymentRequest, effectiveAmount);

        if (!verificationResult.isValid) {
          res.status(402).json({
            error: 'Payment Verification Failed',
            message: verificationResult.error,
            code: 'PAYMENT_VERIFICATION_FAILED',
          });
          return;
        }

        // Settle payment with facilitator
        const settlementResult = await this.settlePayment(paymentRequest, effectiveAmount || "");


        if (settlementResult.status !== 'settled') {
          res.status(402).json({
            error: 'Payment Settlement Failed',
            message: settlementResult.error,
            code: 'PAYMENT_SETTLEMENT_FAILED',
          });
          return;
        }

        // Add payment info to request object for use in route handlers
        req.payment = {
          verified: true,
          nonce: paymentRequest.payload.nonce,
          amount: paymentRequest.payload.amount,
          recipient: paymentRequest.payload.recipient,
          resourceId: paymentRequest.payload.resourceId,
          transactionSignature: settlementResult.transactionSignature || '',
        };

        // Continue to the next middleware/route handler
        next();
      } catch (error) {
        console.error('X402 Middleware Error:', error);

        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Payment processing failed',
          code: 'PAYMENT_PROCESSING_ERROR',
        });
      }
    };
  }

  /**
   * Verify payment request with facilitator
   */
  async verifyPayment(
  paymentRequest: PaymentRequestData,
  expectedAmount?: string
): Promise<VerificationResult> {
  try {
    expectedAmount = expectedAmount ?? paymentRequest.payload.amount;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const response = await fetch(`${this.facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentRequest: JSON.stringify(paymentRequest),
        expectedAmount,
        asset: this.routeConfig.asset,      // ✅ Add this
        network: this.routeConfig.network,  // ✅ And this
}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const raw = await response.json();

    const isValid =
      (raw?.isValid ?? raw?.valid ?? raw?.success ?? false) === true;

    return {
      isValid,
      error: raw?.error,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification request failed',
    };
  }
}



  /**
   * Settle payment with facilitator
   */
  async settlePayment(paymentRequest: PaymentRequestData, expectedAmount?: string): Promise<SettlementResult> {
  try {
    expectedAmount = expectedAmount ?? paymentRequest.payload.amount;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const response = await fetch(`${this.facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentRequest: JSON.stringify(paymentRequest),
        expectedAmount,
        asset: this.routeConfig.asset,      // ✅ Add this
        network: this.routeConfig.network,  // ✅ And this
}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return (await response.json()) as SettlementResult;
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Settlement request failed',
    };
  }
}


  /**
   * Retry mechanism for failed requests
   */
  async retryRequest<T>(requestFn: () => Promise<T>, attempts: number = this.retryAttempts): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === attempts - 1) {
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
    throw new Error('All retry attempts failed');
  }

  /**
   * Health check for facilitator connection
   */
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.facilitatorUrl}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = (await response.json()) as {
        success?: boolean;
        data?: { facilitator?: string; timestamp?: string };
      };
      return {
        healthy: true,
        facilitator: data.data?.facilitator,
        timestamp: data.data?.timestamp,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get facilitator statistics
   */
  async getStats(): Promise<StatsResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.facilitatorUrl}/stats`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      return data as StatsResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Factory function to create middleware instance
 */
export function createX402Middleware(routeConfig: RouteConfig = {}, options: X402Options = {}) {
  const middleware = new X402Middleware(options, routeConfig);
  return middleware.middleware();
}

/**
 * Create middleware with additional utility methods
 */
export function createX402MiddlewareWithUtils(routeConfig: RouteConfig = {}, options: X402Options = {}) {
  const middleware = new X402Middleware(options, routeConfig);

  return {
    middleware: middleware.middleware(),
    healthCheck: () => middleware.healthCheck(),
    getStats: () => middleware.getStats(),
    verifyPayment: (paymentRequest: PaymentRequestData) => middleware.verifyPayment(paymentRequest),
    settlePayment: (paymentRequest: PaymentRequestData) => middleware.settlePayment(paymentRequest),
  };
}
