"use client";

import Link from "next/link";
import { ArrowRight, BellRing, Camera, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Item, Stagger } from "@/components/motion/stagger";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import BorderGlow from "@/components/BorderGlow";
import Radar from "@/components/Radar";

const features = [
  {
    icon: Camera,
    title: "Live Monitoring",
    desc: "A real-time security view designed for fast scanning and confident decisions.",
    href: "/features/live-monitoring",
  },
  {
    icon: BellRing,
    title: "Alerts System",
    desc: "Priority-driven alerts with clear severity badges and noise-resistant UX.",
    href: "/features/alerts-system",
  },
  {
    icon: LockKeyhole,
    title: "Access Control",
    desc: "Role-based visibility and access event visualization across campus zones.",
    href: "/features/access-control",
  },
  {
    icon: Sparkles,
    title: "Analytics",
    desc: "Trends, KPIs, and incident patterns—beautifully presented and actionable.",
    href: "/features/analytics",
  },
];

export default function LandingPage() {
  const { isAuthed } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-55">
            <Radar
              color="#60a5fa"
              backgroundColor="#000000"
            scale={0.62}
            ringCount={10}
            spokeCount={14}
            ringThickness={0.04}
            spokeThickness={0.008}
            sweepSpeed={0.95}
            sweepWidth={2.2}
            brightness={0.78}
            falloff={2.1}
              enableMouseInteraction={false}
            />
          </div>
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/35 to-background/70" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <Stagger className="grid gap-14">
          <section className="grid items-center gap-10 rounded-[28px] md:grid-cols-2">
          <Item className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_theme(colors.primary/0.45)]" />
              Premium security ops dashboard
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Smart, secure, real-time campus protection—built for speed.
            </h1>
            <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
              Smart Secure Campus brings monitoring, alerts, access control, and analytics into one
              futuristic command center. Dark. Clean. Smooth. Operator-first.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {isAuthed ? (
                <Link href="/dashboard">
                  <Button className="neon-ring h-11 bg-primary px-5 text-primary-foreground hover:bg-primary/90">
                    Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : null}
              <Link href="/about">
                <Button
                  variant="secondary"
                  className="h-11 bg-white/5 px-5 text-foreground hover:bg-white/10"
                >
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
              {[
                { k: "99.99%", v: "Uptime target" },
                { k: "< 3s", v: "Alert triage" },
                { k: "24/7", v: "Monitoring" },
                { k: "SOC", v: "Operator UX" },
              ].map((s) => (
                <div key={s.v} className="glass rounded-2xl px-4 py-3">
                  <div className="text-lg font-semibold text-foreground">{s.k}</div>
                  <div className="text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </Item>

          <Item className="relative">
            <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-tr from-primary/20 via-transparent to-cyan-400/10 blur-2xl" />
            <Card className="glass relative overflow-hidden rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Operations Preview</div>
                  <div className="text-xs text-muted-foreground">Live status + alerts</div>
                </div>
                <div className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  Real-time
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Students", value: "18,240" },
                    { label: "Cameras", value: "214" },
                    { label: "Alerts", value: "7" },
                  ].map((x) => (
                    <div key={x.label} className="glass rounded-2xl p-4">
                      <div className="text-xs text-muted-foreground">{x.label}</div>
                      <div className="mt-1 text-xl font-semibold">{x.value}</div>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">System Health</div>
                    <div className="text-xs text-primary">Nominal</div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-primary/60 to-cyan-400/50" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div>Network: Stable</div>
                    <div>Sensors: Online</div>
                    <div>Latency: Low</div>
                  </div>
                </div>
              </div>
            </Card>
          </Item>
        </section>

        <section className="grid gap-6">
          <Item className="flex items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Everything security teams need. In one view.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Designed like a high-end SaaS product: glass cards, soft shadows, neon focus, and
                fast navigation for real operators.
              </p>
            </div>
          </Item>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Item key={f.title}>
                <Link href={f.href} className="block">
                  <BorderGlow
                    className="group h-full rounded-2xl transition-transform duration-300 hover:-translate-y-0.5"
                    glowColor={isLight ? "215 95 55" : "210 100 70"}
                    backgroundColor={isLight ? "rgba(255, 255, 255, 0.86)" : "rgba(14, 20, 36, 0.9)"}
                    borderRadius={16}
                    glowRadius={24}
                    glowIntensity={isLight ? 0.5 : 0.75}
                    fillOpacity={isLight ? 0.1 : 0.2}
                    colors={isLight ? ["#60a5fa", "#93c5fd", "#c4b5fd"] : ["#60a5fa", "#38bdf8", "#a78bfa"]}
                  >
                    <div className="h-full p-5">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
                        <f.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="mt-4 text-sm font-semibold">{f.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
                      <div className="mt-4 text-xs text-primary/90 opacity-0 transition-opacity group-hover:opacity-100">
                        Read details →
                      </div>
                    </div>
                  </BorderGlow>
                </Link>
              </Item>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-white/5 p-8 md:p-10">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <Item className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Ready to operate?</div>
              <div className="text-2xl font-semibold tracking-tight">
                Launch the Smart Secure Campus dashboard.
              </div>
              <div className="max-w-xl text-sm text-muted-foreground">
                Includes live monitoring mock UI, alert polling, access visualization, analytics,
                and admin controls—production-grade frontend architecture.
              </div>
            </div>
            <Link href={isAuthed ? "/dashboard" : "/contact"}>
              <Button className="neon-ring h-11 bg-primary px-5 text-primary-foreground hover:bg-primary/90">
                Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Item>
        </section>
        </Stagger>
      </div>
    </div>
  );
}

