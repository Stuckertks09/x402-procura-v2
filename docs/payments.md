# Payment Conversion (Dev Mode)

- Economic negotiation is always performed in USD.
- For dev/test settlement, USD is converted to SOL using:
  
      SOL = USD × DEV_USD_TO_SOL_RATE × PAYMENT_SCALE_FACTOR
  
- The result is converted to lamports for actual settlement.

| Variable | Example | Meaning |
|---------|---------|---------|
| DEV_USD_TO_SOL_RATE | 0.0000002 | $1 USD = 0.0000002 SOL (dev mode) |
| PAYMENT_SCALE_FACTOR | 1 | Allows further scaling up/down |
| total_cost | 7500 USD | Negotiated cost from agent pipeline |
| final SOL | 0.0015 SOL | Amount actually transferred |
