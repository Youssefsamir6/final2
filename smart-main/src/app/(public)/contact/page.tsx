"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">Contact</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Talk to the security platform team.
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Send a message and we’ll respond with a demo flow, rollout plan, and dashboard
            customization options for your campus.
          </p>
        </div>

        <Card className="glass rounded-2xl p-6">
          {sent ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold">Message sent</div>
              <div className="text-sm text-muted-foreground">
                Thanks—our team will reach out shortly.
              </div>
              <Button
                variant="secondary"
                className="mt-4 bg-white/5 hover:bg-white/10"
                onClick={() => setSent(false)}
              >
                Send another
              </Button>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-white/5"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  className="bg-white/5"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  className="bg-white/5"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  required
                  placeholder="How can we help?"
                  className="min-h-28 w-full resize-none rounded-md border border-border/60 bg-white/5 px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                />
              </div>
              <Button className="neon-ring bg-primary text-primary-foreground hover:bg-primary/90">
                Send message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

