import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export type AgentRow = {
  agent: "scout" | "evaluator" | "negotiator" | "supplier";
  pubkey: string;
  jobs_completed: number;
  jobs_failed: number;
  trust_score: number;
  total_earned_sol: number;
  explorer: string;
};

export function AgentsPanel({ agents, loading }: { agents: AgentRow[]; loading: boolean }) {
  return (
    <Card className="md:col-span-2">
      <CardHeader><CardTitle>Agent Reputation</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {agents.map((a) => (
            <div key={a.agent} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{a.agent}</span>
                <Badge variant={a.trust_score >= 70 ? "default" : a.trust_score >= 40 ? "secondary" : "destructive"}>
                  {a.trust_score}/100
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Pubkey: <span className="font-mono">{a.pubkey.slice(0, 8)}…</span></div>
                <div>Completed: <strong>{a.jobs_completed}</strong></div>
                <div>Failed: <strong>{a.jobs_failed}</strong></div>
                <div>Total Earned: {a.total_earned_sol.toFixed(6)} SOL</div>
                <a className="underline" href={a.explorer} target="_blank" rel="noreferrer">Explorer</a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
