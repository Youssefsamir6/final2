import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item, Stagger } from "@/components/motion/stagger";

export default function LiveMonitoringDetailsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <Stagger className="grid gap-10">
        <Item className="space-y-3">
          <div className="text-xs text-muted-foreground">Feature</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Live Monitoring</h1>
          <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
            <li>Explains what “live monitoring” means in a camera-first product.</li>
            <li>Covers what is shown, how it updates, and how operators use it.</li>
            <li>Lists the signals that matter when a large camera fleet runs 24/7.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/">
              <Button variant="secondary" className="bg-white/5 hover:bg-white/10">
                Back to site
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="neon-ring bg-primary text-primary-foreground hover:bg-primary/90">
                Request a demo
              </Button>
            </Link>
          </div>
        </Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">What you see in a live monitoring view</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  A continuous status surface for cameras and signals (not only a video wall).
                </li>
                <li>
                  Health and trust signals: feed integrity, recent changes, and what needs action.
                </li>
                <li>
                  Typical UI elements: camera tiles/list, connection state, last seen, online/degraded/offline,
                  and shortcuts to related alerts.
                </li>
                <li>
                  Primary goal at scale: help an operator find the one relevant item fast.
                </li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Update behavior and refresh cadence</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Updates should not require manual refresh.</li>
                <li>Implementation options: polling or streaming (WebSockets/SSE) for health and alert signals.</li>
                <li>Typical cadence: 2–10s for operational indicators; longer for summaries.</li>
                <li>UI behavior: calm deltas (badge changes, brief highlights), avoid disruptive reflow.</li>
              </ul>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Item className="md:col-span-3">
            <Card className="glass rounded-2xl p-6">
              <div className="text-sm font-semibold">Operator workflow (boring version)</div>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Scan global status: cameras online, degraded feeds, active warnings.</li>
                <li>Find outliers: recent state changes or zones with alert spikes.</li>
                <li>Drill down: verify context and sensor trust (health, timestamps, related signals).</li>
                <li>Act: escalate/document confirmed incidents, or open maintenance for unhealthy cameras.</li>
              </ol>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Reliability signals that matter</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Connection status (online/degraded/offline) + last seen + recent changes.</li>
                <li>Health metrics when available: jitter/latency, frame drops, interruptions.</li>
                <li>Location + zone mapping for instant physical context.</li>
                <li>Alert linkage: related alerts and recency.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">What this feature is not</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Not only a “wall of video”: it must surface silent failures and operational risk.</li>
                <li>Not analytics: monitoring is time-sensitive; analytics is retrospective and trend-based.</li>
                <li>Not just emergencies: it reduces blind spots and catches failures early.</li>
              </ul>
            </Card>
          </Item>
        </div>
      </Stagger>
    </div>
  );
}

