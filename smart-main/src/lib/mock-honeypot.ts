import type { HoneypotAlert } from "@/types/honeypot";

const honeypotAlerts: HoneypotAlert[] = [
  {
    id: "hp_1",
    ip: "192.168.1.10",
    attack: "Brute Force",
    severity: "critical",
    time: "2026-05-02 14:32",
    status: "new",
  },
  {
    id: "hp_2",
    ip: "10.0.0.55",
    attack: "Scan",
    severity: "medium",
    time: "2026-05-02 13:15",
    status: "new",
  },
  {
    id: "hp_3",
    ip: "172.16.0.20",
    attack: "SSH",
    severity: "high",
    time: "2026-05-02 12:48",
    status: "reviewed",
  },
  {
    id: "hp_4",
    ip: "192.168.5.100",
    attack: "Brute Force",
    severity: "critical",
    time: "2026-05-02 11:20",
    status: "new",
  },
  {
    id: "hp_5",
    ip: "10.10.10.1",
    attack: "Scan",
    severity: "low",
    time: "2026-05-02 10:05",
    status: "reviewed",
  },
];

export function makeHoneypotAlerts(): HoneypotAlert[] {
  return honeypotAlerts;
}
