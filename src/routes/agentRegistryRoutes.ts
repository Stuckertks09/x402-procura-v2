// src/agents/agentRegistry.routes.ts
import express from "express";
import { listAgents } from "../controllers/agentRegistry";

export const agentRegistryRouter = express.Router();

// GET /api/agents → list registered agents + reputations
agentRegistryRouter.get("/", async (req, res) => {
  try {
    const agents = await listAgents();
    res.json(agents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
