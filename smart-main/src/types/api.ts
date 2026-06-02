export type Severity = "active" | "warning" | "critical";

export type Alert = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  source: string;
  location: string;
  createdAt: string;
};

export type UserRole = "Admin" | "Operator" | "Viewer";

export type PersonType = "student" | "professor" | "assistant" | "worker" | "vip";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Suspended";
  lastActiveAt: string;
};

export type Stats = {
  totalStudents: number;
  activeCameras: number;
  securityAlerts: number;
  systemStatus: "Nominal" | "Degraded" | "Critical";
  series: { time: string; alerts: number; accessEvents: number }[];
};

export type Camera = {
  id: string;
  name: string;
  zone: string;
  status: "Online" | "Offline" | "Degraded";
  lastSeenAt: string;
};

export type LogStatus = "authorized" | "denied";

export type Log = {
  id: string;
  name: string;
  studentId: string | null;
  timestamp: string;
  location: string;
  status: LogStatus;
  photoUrl: string;
  userId?: string | null;
  method?: string;
  reason?: string;
};

