import { Card } from "@/components/ui/card";
import { Item, Stagger } from "@/components/motion/stagger";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <Stagger className="grid gap-10">
        <Item className="space-y-3">
          <div className="text-xs text-muted-foreground">About</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Built for smart security cameras and live monitoring.
          </h1>
          <ul className="max-w-2xl list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
            <li>Unified command center for camera fleets, live monitoring, and alert workflows.</li>
            <li>Optimized for reliable visibility, rapid triage, and clear incident context.</li>
            <li>Designed to stay calm under load: minimal noise, high signal.</li>
          </ul>
        </Item>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Live monitoring",
              d: "A camera-first view built for scanning: status, health, and what needs attention right now.",
            },
            {
              t: "Alerts that matter",
              d: "Clear severity, source, and location context—so you can triage quickly and escalate confidently.",
            },
            {
              t: "Analytics & audit trail",
              d: "Trends, KPIs, and activity history that help you explain what happened and improve response time.",
            },
          ].map((x) => (
            <Item key={x.t}>
              <Card className="glass h-full rounded-2xl p-6">
                <div className="text-sm font-semibold">{x.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{x.d}</div>
              </Card>
            </Item>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">What “smart monitoring” means here</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>A single dashboard for cameras, alerts, and incident signals.</li>
                <li>Fast “what changed?” visibility: degraded feeds, offline devices, alert spikes.</li>
                <li>Operator-friendly UX: prioritization, quick drill-down, low cognitive load.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Designed for camera deployments</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Multi-zone coverage with clear locations and sources per alert.</li>
                <li>Health and availability signals alongside security events.</li>
                <li>Built to scale from a few cameras to large fleets.</li>
              </ul>
            </Card>
          </Item>
        </div>
      </Stagger>
    </div>
  );
}

