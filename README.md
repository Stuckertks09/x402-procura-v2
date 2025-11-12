<p align="center">
  <img src="https://storage.googleapis.com/my-ads-creatives/ads/28df43dd-1b58-49f6-93b6-e45ea3af4f02.png" width="100%" alt="x402-procura banner">
</p>

<h1 align="center">x402-procura</h1>
<h3 align="center">Autonomous Procurement Through Trustless Agent Economics</h3>

<p align="center">
  <strong>Agents negotiate. Cryptography enforces payment. Blockchain anchors reputation.</strong><br/>
  No central authority. No API middlemen. Just autonomous economic coordination.
</p>

<p align="center">
  <a href="#-demo-video">📹 Demo Video</a> •
  <a href="#-for-judges">⚡ Judge Evaluation</a> •
  <a href="#-quick-start">🚀 Run in 2 Min</a> •
  <a href="#-architecture">🏗 Architecture</a>
</p>

---

## ⚡ For Judges (60-Second Evaluation)

**What makes this different from other submissions:**

| Most x402 Demos | x402-procura |
|-----------------|--------------|
| Call hosted facilitator API | **Custom facilitator** with visible Ed25519 verification |
| Mock payments or trust external service | **Real devnet SOL** transfers + signature validation |
| Agent reputation in database | **On-chain Anchor program** (`5g5vVtid...kQEj`) |
| Single agent + payment = demo | **Four-agent economy** with competitive dynamics |
| Toy use case | **$10T procurement market** workflow |

**Tech judges want to see:**
- ✅ Custom x402 facilitator (not API wrapper) → [code](./facilitator/index.ts)
- ✅ Solana smart contract deployed → [`5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj`](https://explorer.solana.com/address/5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj?cluster=devnet)
- ✅ Multi-agent coordination → [agent pipeline](./src/agents/)
- ✅ Real cryptographic payment flow → [video @ 0:45](https://storage.googleapis.com/my-ads-creatives/ads/x402Procura.mp4)

**One-line summary:**  
*This isn't a chatbot that can pay APIs—it's an autonomous marketplace where agents compete for work and get paid based on performance.*

---

## 🏆 Hackathon Prize Tracks

We're competing in **three categories** because the system spans infrastructure, trustless coordination, AND real-world application:

### 🔧 Best x402 Dev Tool → **Custom Facilitator**
- Built our own x402 payment verifier (no external API dependency)
- Local Ed25519 signature validation
- Reusable middleware for per-agent micropayment rules
- **Why it matters:** Other devs can fork this to build wallet-native agent systems

### 🤝 Best Trustless Agent Build → **On-Chain Reputation**
- Agents have Solana wallet identities
- Performance tracked in Anchor smart contract
- Dynamic trust scores (0-100) based on job completion
- Optional staking/slashing (implemented but disabled for demo)
- **Why it matters:** Agents have skin in the game without central authority

### 🏢 Best x402 Agent Application → **Procurement Automation**
- Real industry workflow (not toy example)
- $10 trillion global market
- Replaces manual RFP processes with autonomous negotiation
- **Why it matters:** Demonstrates agent economies can handle enterprise complexity

---

## 📹 Demo Video

🎬 **Watch the 90-second walkthrough:**  
👉 **[VIEW DEMO VIDEO](https://storage.googleapis.com/my-ads-creatives/ads/x402Procura.mp4)**

**Key timestamps:**
- `0:15` - User submits procurement request
- `0:45` - x402 signature authorization (no wallet connect)
- `1:10` - Live agent negotiation via SSE stream
- `1:45` - Supplier settlement + on-chain reputation update
- `2:20` - Explorer view of Anchor program state

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: "Find 5 video editing laptops, budget $2,500"            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓ x402 request authorization
┌─────────────────────────────────────────────────────────────────┐
│  CUSTOM x402 FACILITATOR (Our Implementation)                   │
│  • Validates Ed25519 signatures locally                          │
│  • Routes payment to correct agent wallet                        │
│  • No external API = full transparency                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓ dispatches job to agent pipeline
┌─────────────────────────────────────────────────────────────────┐
│  AGENT ECONOMY (Competitive Multi-Agent Coordination)           │
│                                                                  │
│  Scout Agent          Evaluator Agent       Negotiator Agent    │
│  • Finds suppliers    • Scores quality      • Finalizes price   │
│  • Filters by specs   • Ranks options       • Handles supplier  │
│                                                                  │
│         Each agent has own wallet + reputation score            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓ micropayments per task completed
┌─────────────────────────────────────────────────────────────────┐
│  SOLANA BLOCKCHAIN (Devnet)                                     │
│                                                                  │
│  Program ID: 5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj       │
│                                                                  │
│  Agent Reputation State:                                         │
│  • jobs_completed: u64                                           │
│  • jobs_failed: u64                                              │
│  • trust_score: u8 (0-100, performance-driven)                   │
│  • total_earned: u64 (lamports)                                  │
│  • optional_stake: u64 (for slashing bad actors)                 │
└─────────────────────────────────────────────────────────────────┘
```

**Flow in plain English:**
1. User describes what they need
2. Facilitator validates payment authorization cryptographically
3. Agents compete to fulfill request (scout → evaluate → negotiate)
4. Each successful task = micropayment + reputation boost
5. All reputation changes anchored on Solana (no database trust required)

---

## 🚀 Why This Matters

**Procurement is broken:**
- $10 trillion global market
- 60% of enterprise spend goes through manual RFP processes
- Middlemen extract 15-40% margins
- No transparent audit trail

**x402-procura demonstrates:**
- Autonomous agents can coordinate economically without central control
- Cryptographic payment authorization (not "please trust our API")
- On-chain reputation creates accountability without intermediaries
- Real-world complexity (not chatbot + payment = submission)

**This is not a demo. It's a functional economic protocol.**

---

## 🧑‍💻 Quick Start

### Prerequisites
```bash
node --version   # v18+ or v20+
solana --version # 1.18+ recommended
```

### Run in 3 terminals

**Terminal 1:** Backend orchestrator
```bash
git clone https://github.com/stuckertks09/x402-procura
cd x402-procura
npm install
npm run dev
```

**Terminal 2:** x402 facilitator
```bash
nvm use 20
npx tsx facilitator/index.ts
```

**Terminal 3:** Frontend UI
```bash
cd frontend
npm install
npm run dev
```
Add OpenAPI Key to .env
Open [`http://localhost:5173`](http://localhost:5173) and submit a procurement request.

---

## 🔐 Security Note

This demo includes **example agent wallets** for out-of-the-box functionality:
- ✅ Devnet only (zero real value)
- ✅ Fully functional payment flows
- ✅ Real on-chain reputation tracking

To regenerate keys:
```bash
solana-keygen new -o ./keys/scout.json
solana airdrop 2 <pubkey> --url devnet
```

---

## 🧩 Smart Contract Deep Dive

**Program ID:** `5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj`  
**Network:** Solana Devnet  
**Framework:** Anchor (Rust)

### What's Tracked On-Chain

```rust
pub struct AgentReputation {
    pub agent: Pubkey,           // Wallet identity
    pub jobs_completed: u64,     // Successful deliveries
    pub jobs_failed: u64,        // Failed attempts
    pub trust_score: u8,         // 0-100, dynamic
    pub total_earned: u64,       // Lifetime earnings (lamports)
    pub stake_amount: u64,       // Optional collateral
}
```

### Why On-Chain?

| Off-Chain Database | On-Chain Program |
|--------------------|------------------|
| Single point of failure | Cryptographically anchored |
| Admin can manipulate | Transparent state transitions |
| Trust the database owner | Trust the math |
| No audit trail | Every update logged permanently |

Even if every human participant disappears, **the reputation state remains verifiable.**

### Staking & Slashing (Implemented, Not Enabled)

The contract includes full staking logic:
- Agents can deposit collateral
- Bad performance = trust score penalty
- Below threshold = stake slashed

**Intentionally disabled for hackathon demo** to focus on coordination mechanics, not punitive systems. But the code is deployed and ready to activate.

---

## 🎮 Demo Experience

**What judges will see when they run this:**

1. User types: *"Video editing laptops, qty 5, max budget $2,500"*
2. System prompts x402 signature authorization (no wallet extension needed)
3. Scout agent searches suppliers → streams results live via SSE
4. Evaluator agent scores quality/price tradeoffs
5. Negotiator agent finalizes best offer
6. Second x402 payment prompt for supplier settlement
7. On-chain reputation updates in real-time

**It feels like hiring a procurement team that works autonomously and gets paid per task.**

---

## 🔬 Technical Differentiation

### Why We Built Our Own Facilitator

Most x402 demos use the hosted facilitator API. We didn't.

**Reasoning:**

| Hosted Facilitator API | Custom Implementation |
|------------------------|----------------------|
| Payments abstracted away | **Visible Ed25519 verification** |
| Trust external service | **Local signature validation** |
| Black-box settlement | **Optional real on-chain transfers** |
| Hard to customize | **Per-agent micropayment rules** |

This demonstrates **true self-custody** and **trust-minimized execution**.

### Tech Stack

| Layer | Tools |
|-------|-------|
| Smart Contract | Solana + Anchor (Rust) |
| Payment Verification | Ed25519, bs58, tweetnacl |
| Backend | Node.js, Express, TypeScript |
| Agent Coordination | Modular pipeline orchestration |
| Real-Time Updates | Server-Sent Events (SSE) |
| UI | React + Tailwind + shadcn/ui |

---

## 🌱 Post-Hackathon Roadmap

**Already working:**
- ✅ Multi-agent coordination
- ✅ Cryptographic payment authorization
- ✅ On-chain reputation
- ✅ Real procurement workflow

**Next steps:**
- On-chain order book for supplier price discovery
- Public agent marketplace (anyone can register as Scout/Evaluator)
- Bonded staking for agent credibility
- zk-attested off-chain resource verification
- Cross-cluster settlement netting

**Vision:** A decentralized procurement network where agents compete on reputation, not marketing budgets.

---

## 🧠 Philosophy

**Most x402 demos show:**  
*"My chatbot can pay for API calls"*

**x402-procura shows:**  
*"Autonomous agents can form economic networks with cryptographic enforcement and on-chain accountability"*

This is the difference between a **feature** and a **protocol**.

We're not building a tool that uses x402.  
We're building an economy that runs on it.

---

## 📊 Comparison to Other Approaches

| Approach | Payment | Agent Coordination | Reputation | Real Use Case |
|----------|---------|-------------------|------------|---------------|
| Chatbot + API key | Subscription | Single agent | None | Generic queries |
| Agent + wallet connect | Manual approval | Single agent | Off-chain | Demos |
| Agent + hosted facilitator | Abstracted | Single agent | Database | Toy examples |
| **x402-procura** | **Cryptographic** | **Multi-agent economy** | **On-chain** | **$10T market** |

---

## 🎯 What Judges Get From This Submission

**For infrastructure track judges:**
- Reusable facilitator implementation (not just API wrapper)
- Clear separation of concerns (payment verification ≠ business logic)
- Production-ready patterns for wallet-native agent systems

**For trustless coordination judges:**
- Proof that agents can have economic identities without central authority
- On-chain reputation as alternative to platform lock-in
- Staking/slashing mechanics (deployed but optional)

**For application track judges:**
- Real industry workflow (procurement, not toy example)
- Demonstrates agent economies can handle enterprise complexity
- Clear path from hackathon demo → market-ready product

---

## 🙏 Acknowledgments

Built for the **Solana x402 Hackathon** (November 2025)

Special thanks to the x402 team for creating a protocol that makes autonomous agent economies possible.

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

<p align="center">
  <strong>This is not a chatbot demo.</strong><br/>
  <strong>This is a working economic system.</strong>
</p>

<p align="center">
  <a href="https://storage.googleapis.com/my-ads-creatives/ads/x402Procura.mp4">📹 Watch Demo</a> •
  <a href="https://explorer.solana.com/address/5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj?cluster=devnet">🔗 View Contract</a> •
  <a href="https://github.com/stuckertks09/x402-procura-v2">💻 View Source</a>
</p>
