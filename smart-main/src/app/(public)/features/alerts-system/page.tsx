import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item, Stagger } from "@/components/motion/stagger";

export default function AlertsSystemDetailsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <Stagger className="grid gap-10">
        <Item className="space-y-3">
          <div className="text-xs text-muted-foreground">Feature</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Alerts System</h1>
          <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
            <li>Alerts are the backbone of the monitoring workflow (not just notifications).</li>
            <li>Designed to reduce noise, preserve context, and make next actions obvious.</li>
            <li>Optimized for scanning, triage, escalation, and auditability.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/">
              <Button variant="secondary" className="bg-white/5 hover:bg-white/10">
                Back to site
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="neon-ring bg-primary text-primary-foreground hover:bg-primary/90">
                Contact us
              </Button>
            </Link>
          </div>
        </Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Alert shape and minimum required fields</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Required fields: id, title, severity, timestamp, source, location.</li>
                <li>Description is optional but should explain “why”, not raw sensor dumps.</li>
                <li>Grouping (by zone/source) prevents floods of identical alerts.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Severity levels and boring rules</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Severity must map to operational meaning (info / review soon / immediate attention).</li>
                <li>Consistent visual language enables fast scanning.</li>
                <li>Don’t overuse “critical” or it becomes meaningless.</li>
              </ul>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Item className="md:col-span-3">
            <Card className="glass rounded-2xl p-6">
              <div className="text-sm font-semibold">Triage flow (step-by-step)</div>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Check severity, location, and source.</li>
                <li>Check recency + duplication (repeating/escalating/already handled).</li>
                <li>Verify context: related cameras, nearby signals, and camera health reliability.</li>
                <li>Choose action: acknowledge, escalate, dispatch response, or mark false positive.</li>
                <li>Document outcome for audit and tuning.</li>
              </ol>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Noise control (unexciting, necessary)</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Guardrails: deduplication, per-source rate limits, cooldown windows.</li>
                <li>Correlation: combine weak signals into fewer stronger alerts.</li>
                <li>Focus UX: sort by severity then recency; highlight only what changed.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Data retention and audit</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Audit trail: created at, acknowledged by, actions taken, closed at.</li>
                <li>Retention: store enough for review, compliance, and tuning.</li>
                <li>Success metric: decision speed and clarity, not alert volume.</li>
              </ul>
            </Card>
          </Item>
        </div>
      </Stagger>
    </div>
  );
}

