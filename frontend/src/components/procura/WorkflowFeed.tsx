import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export function WorkflowFeed({ feed }: { feed: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Execution Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-white p-3 h-72 overflow-auto font-mono text-xs leading-relaxed">
          {feed.length === 0 ? (
            <div className="text-muted-foreground">No activity yet.</div>
          ) : (
            feed.map((l, i) => (
              <div key={i} className="py-[2px]">
                {l}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
