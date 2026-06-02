import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item, Stagger } from "@/components/motion/stagger";

export default function AccessControlDetailsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <Stagger className="grid gap-10">
        <Item className="space-y-3">
          <div className="text-xs text-muted-foreground">Feature</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Access Control</h1>
          <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
            <li>Explains access events in a camera monitoring product.</li>
            <li>Shows how door events add context to camera alerts and verification.</li>
            <li>Covers the usual data model and the operator-facing view.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/">
              <Button variant="secondary" className="bg-white/5 hover:bg-white/10">
                Back to site
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="neon-ring bg-primary text-primary-foreground hover:bg-primary/90">
                Talk to sales
              </Button>
            </Link>
          </div>
        </Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">What “access control visibility” means</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Show entry/exit events with time, door/device, zone, and (when allowed) a subject identifier.</li>
                <li>Primary purpose: operational context for incident review (not personal data exposure).</li>
                <li>Answer fast questions: door opened? forced? after-hours? camera nearby to verify?</li>
                <li>UX needs filters (zone/door) and correlation with nearby cameras and alerts.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Events, policies, and boring state</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Common event types: granted, denied, forced open, held open, tamper.</li>
                <li>Each event type maps to different priority and response expectations.</li>
                <li>Policies explain “why suspicious” (schedule, role, restricted zone) and should be summarized.</li>
                <li>Timestamps/time zones must be handled consistently across sites.</li>
              </ul>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Item className="md:col-span-3">
            <Card className="glass rounded-2xl p-6">
              <div className="text-sm font-semibold">Correlation with cameras</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Most valuable capability: link door events to nearby cameras/zones for verification.</li>
                <li>Configuration via zone mapping or proximity rules (requires maintenance over time).</li>
                <li>UX should expose correlation as simple actions, not complex graphs.</li>
              </ul>
            </Card>
          </Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Role-based visibility (RBAC)</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Some access data is sensitive (identities, full logs, restricted zones).</li>
                <li>RBAC ensures only approved roles can see sensitive fields.</li>
                <li>Simple model: Admin (configure/view all), Operator (triage), Viewer (read-only).</li>
                <li>Apply RBAC consistently across UI, APIs, and exports.</li>
              </ul>
            </Card>
          </Item>
          <Item>
            <Card className="glass h-full rounded-2xl p-6">
              <div className="text-sm font-semibold">Auditing and reporting</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Access logs are used for post-incident review and investigations.</li>
                <li>Exports/retention need consistent formats for compliance.</li>
                <li>Good reports focus on what/where/when/outcome.</li>
                <li>Pair access events with camera context to reduce false alarms.</li>
              </ul>
            </Card>
          </Item>
        </div>
      </Stagger>
    </div>
  );
}

