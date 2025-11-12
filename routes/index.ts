/**
 * Main routes module
 * Ensures all route handlers are exported with consistent names
 */

export { healthCheckRoute } from "./health.js";
export { verifyPaymentRoute } from "./verify.js";
export { settlePaymentRoute } from "./settle.js";
export { getNonceRoute } from "./nonce.js";
export { getStatsRoute } from "./stats.js";
export { cleanupNoncesRoute } from "./stats.js";