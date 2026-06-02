import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item, Stagger } from "@/components/motion/stagger";

export default function AnalyticsDetailsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <Stagger className="grid gap-10">
        <Item className="space-y-3">
          <div className="text-xs text-muted-foreground">Feature</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Analytics</h1>
          <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
            <li>Answers “what’s happening over time?” and “where are problems concentrated?”</li>
            <li>Used for continuous improvement and reporting (not real-time triage).</li>
            <li>Focuses on trends, baselines, comparisons, and accountability.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/">
              <Button variant="secondary" className="bg-white/5 hover:bg-white/10">
                Back to site
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="neon-ring bg-primary text-primary-foreground hover:bg-primary/90">
                Get pricing / demo
              </Button>
            </Link>
          </div>
        </Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">KPIs (what they are and why they’re boring)</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Operational counters/rates: cameras online, alerts by severity, time-to-acknowledge, repeat incidents.</li>
                <li>KPIs are only useful if they change decisions (avoid vanity metrics).</li>
                <li>Define targets/thresholds so the UI can show nominal vs degraded, not only raw numbers.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Trends, baselines, and comparisons</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Trends show increase/decrease/stability over time.</li>
                <li>Baselines prevent misleading raw counts (time-of-day, season, events, maintenance).</li>
                <li>Comparisons (WoW / MoM) separate real change from normal variation.</li>
                <li>Segment by zone/device/source to target improvements.</li>
              </ul>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Item className="md:col-span-3">
            <Card className="glass rounded-2xl p-6">
              <div className="text-sm font-semibold">Boring questions analytics should answer</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Which zones generate the most critical alerts per day?</li>
                <li>Are alerts getting noisier without more confirmed incidents?</li>
                <li>Which cameras have the highest downtime or most degraded periods?</li>
                <li>What is the median time from alert creation to acknowledgement?</li>
                <li>Did configuration changes improve results (threshold tuning, repositioning)?</li>
              </ul>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Reporting and export</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Reports need consistent definitions, stable filters, and clear labeling.</li>
                <li>Exports should be usable (CSV, PDF summaries, API) and respect permissions.</li>
                <li>Analytics supports investment decisions: coverage changes, more cameras, process improvement.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Data quality (the truly boring part)</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Clear event definitions, reliable timestamps, deduplication, and sensible retention.</li>
                <li>Missing/inconsistent health data breaks uptime accuracy; sloppy classification breaks trends.</li>
                <li>A solid analytics module is mostly boring engineering done correctly.</li>
              </ul>
            </Card>
          </Item>
        </div>
      </Stagger>
    </div>
  );
}

