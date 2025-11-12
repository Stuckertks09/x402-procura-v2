<p align="center">
  <img src="https://storage.googleapis.com/my-ads-creatives/ads/28df43dd-1b58-49f6-93b6-e45ea3af4f02.png" width="100%" alt="x402-procura banner">
</p>

# **x402-procura**

### *Autonomous procurement powered by trustless agent economics.*

Agents negotiate pricing, verify suppliers, and coordinate settlement — without any central controller.  
The **x402 protocol** ensures payments are authorized cryptographically, while a **Solana on-chain reputation system** ensures incentives remain aligned over time.

> **This is not a chatbot demo.**  
> This is a working *economic system.*

---

## 🌍 **Why It Matters**

Procurement is a **$10T global market** defined by inefficiency and middlemen.  
**x402-procura** demonstrates how **autonomous agent economies** can replace manual RFP workflows with transparent, cryptographically enforced collaboration — and pay contributors fairly, on-chain.

---

## 🏆 **Hackathon Prize Tracks**

This project directly targets three categories:

| Track                           | Why This Project Fits                                                            |
| ------------------------------- | -------------------------------------------------------------------------------- |
| **Best x402 Dev Tool**          | Custom local facilitator + verifiable payment routing + reusable middleware      |
| **Best Trustless Agent Build**  | Agents act independently with on-chain identity and performance-based reputation |
| **Best x402 Agent Application** | Real industry workflow (procurement) → not a toy simulation                      |

---

## 🚀 **One-Sentence Pitch**

**x402-procura turns procurement into an autonomous marketplace, where agents compete, earn, and maintain trust — enforced by cryptographic payments and on-chain reputation.**

---

## 🧠 System Overview

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT UI                        │
│   React + SSE live event stream + payment prompts    │
└───────────────────────┬──────────────────────────────┘
                        │ x402 Authorization (request → pay)
                        ↓
┌─────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                   │
│  Orchestrator (Node) ←→ Custom x402 Facilitator       │
│  • Coordinates workflow   • Verifies + settles pay    │
│  • Routes negotiation     • No external API needed    │
└───────────────────────┬──────────────────────────────┘
                        │ agent job pipelines
                        ↓
┌─────────────────────────────────────────────────────┐
│                      AGENT LAYER                     │
│   Scout → Evaluator → Negotiator → Supplier          │
│   • Find           • Score        • Finalize         │
│   • Filter         • Rank         • Price            │
└───────────────────────┬──────────────────────────────┘
                        │ micropayments (x402)
                        ↓
┌─────────────────────────────────────────────────────┐
│                 SOLANA BLOCKCHAIN                    │
│  Agent Reputation Program (Anchor / Rust)            │
│  • Job history                                        │
│  • Trust score (0–100)                                │
│  • Lifetime earned SOL / USDC                         │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Why a **Custom Facilitator** (Not a x402 API)

Most x402 demos call out to a hosted facilitator API.

We didn't.

We built **our own**, because:

| Hosted Facilitator         | Custom Facilitator (ours)                              |
| -------------------------- | ------------------------------------------------------ |
| Payments abstracted away   | Payments **visible** + explainable                     |
| No control over signatures | We validate **Ed25519 signatures** locally             |
| Black-box settlement       | Optional **REAL** on-chain transfers                   |
| Hard to extend             | We can add per-agent **micropay rules**                |

This demonstrates **true self-custody**, **wallet-aware agent workflows**, and **trust-minimized execution**.

---

## 🧩 **Smart Contract: On-Chain Agent Reputation**

**Deployed to Solana Devnet**

```
declare_id!("5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj");
```

The contract tracks:

| Field                        | Meaning                                 |
| ---------------------------- | --------------------------------------- |
| jobs_completed               | Work delivered successfully             |
| jobs_failed                  | Slashed trust if failure rate increases |
| trust_score                  | Dynamic (0-100), performance-driven     |
| total_earned                 | How much the agent has been paid        |
| (optional) staked collateral | Enables slashing for bad behavior       |

Even if stakeholders disappear, **the reputation state remains cryptographically anchored.**

### 🪙 **Staking System (Included but Optional for Demo)**

Stake vaults & slashing are implemented but not turned on in the default run.

**This is intentional.**  
The hackathon demo focuses on **economic coordination**, not punitive mechanics — but the logic is fully deployed on-chain and ready to activate.

---

## 🎮 Live Demo Experience (What the judges will see)

1. User describes a procurement job (e.g., *"Video editing laptops, qty 5, $2,500 budget"*)
2. Orchestrator sends job to agents
3. Agents discover suppliers, evaluate quality, negotiate price
4. x402 prompts the user to authorize the request fee
5. Once paid, the negotiation runs live (SSE updates stream continuously)
6. Supplier price is finalized → second x402 payment prompt → settlement
7. Agent reputations update on-chain

**Feels like:**
A decentralized procurement team working *for you*, paid per job.

---

## 🧑‍💻 Quick Start (Mac)

> All commands are correct & match how your project runs now.

### Prerequisites

```bash
node --version   # should be v18+ or v20+
nvm --version    
solana --version # recommended 1.18+
anchor --version # optional unless redeploying
```

### 1️⃣ Install dependencies

```bash
git clone https://github.com/[your-username]/x402-procura
cd x402-procura
npm install
```

### 2️⃣ Start backend orchestrator (Terminal 1)

```bash
npm run dev
```

### 3️⃣ Start x402 facilitator (Terminal 2)

```bash
nvm use 20
npx tsx facilitator/index.ts
```

### 4️⃣ Start frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

Then open:

```
http://localhost:5173
```

---

## 🔑 About the Keys

This demo includes **example agent wallets** (scout, evaluator, negotiator, supplier, orchestrator). (All keys in .env.example)

They are:

* 🔓 **devnet only**
* 💰 safe (zero real value)
* ✅ included to make the system *run out-of-the-box*

To regenerate:

```bash
solana-keygen new -o ./keys/scout.json
# repeat for all roles
```

Fund with:

```bash
solana airdrop 2 <pubkey> --url devnet
```

---

## 📦 Tech Stack

| Layer                | Tools                          |
| -------------------- | ------------------------------ |
| Smart Contract       | Solana + Anchor (Rust)         |
| Backend              | Node.js, Express, TypeScript   |
| Payment Verification | Ed25519, bs58, tweetnacl       |
| Agent Runtime        | Modular pipeline orchestration |
| Messaging            | SSE (Server-Sent Events)       |
| UI                   | React + Tailwind + shadcn/ui   |

---

## 🔗 **Program ID (Devnet)**

```
5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj
```

**Deployed via Anchor to Solana Devnet**  
Includes staking, slashing, and on-chain reputation logic.

---

## 🌱 **What's Next (Post-Hackathon Path)**

* On-chain order book for supplier price discovery
* Marketplace for public agent registration
* Bonded staking for agent credibility
* zk-attested off-chain resource verification
* Cross-cluster multi-agent settlement netting

---

## 🧠 Closing Remark

This project is **not** a proof-of-concept UI.
It is a **functional economic protocol** demonstrating:

* Autonomous multi-agent cooperation
* Cryptographically enforced payment authorization
* On-chain reputation reinforcement
* Realistic enterprise workflow application

**x402 is the coordination standard.
Procura is the agent economy running on top of it.**

---

## 📹 **Demo Video**

🎬 **Watch the full demo here:**  
👉 [View Demo Video](https://storage.googleapis.com/my-ads-creatives/ads/x402Procura.mp4)

**Video demonstrates:**
* x402 signature-based authorization (no wallet connect required)
* Request fee → live negotiation stream → supplier settlement
* Facilitator verifying signatures + payments
* On-chain agent reputation updates in real-time

---

## 🙏 Acknowledgments

Built for the Solana x402 Hackathon (November 2025)

---

## 📄 License

MIT License - See LICENSE file for details
