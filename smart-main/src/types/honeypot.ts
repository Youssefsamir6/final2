export type HoneypotSeverity = "low" | "medium" | "high" | "critical";
export type HoneypotStatus = "new" | "reviewed";
export type HoneypotAlert = {
  id: string;
  ip: string;
  attack: "SSH" | "Scan" | "Brute Force";
  severity: HoneypotSeverity;
  time: string;
  status: HoneypotStatus;
};
