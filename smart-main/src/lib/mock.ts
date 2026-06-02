import type { Alert, Camera, Log, Severity, Stats, User, UserRole, LogStatus } from "@/types/api";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]) {
  return arr[rand(0, arr.length - 1)] as T;
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

const locations = [
  "North Gate",
  "Library Entrance",
  "Engineering Building",
  "Dormitory A",
  "Parking Lot C",
  "Sports Complex",
  "Admin Hall",
] as const;

const sources = ["Camera AI", "Access Control", "Patrol", "Sensor Grid"] as const;

export function makeAlerts(): Alert[] {
  const count = rand(4, 12);
  const severities: Severity[] = ["active", "warning", "critical"];
  const titles = [
    "Unauthorized door access attempt",
    "Suspicious loitering detected",
    "Camera feed degradation",
    "Perimeter breach signal",
    "After-hours access request",
    "Crowd density threshold exceeded",
  ] as const;

  return Array.from({ length: count }).map((_, i) => {
    const severity = pick(severities);
    const createdAt = new Date(Date.now() - rand(1, 55) * 60_000).toISOString();
    return {
      id: id(`alert${i}`),
      title: pick(titles),
      description:
        severity === "critical"
          ? "Immediate attention required. Escalate to on-call supervisor."
          : severity === "warning"
            ? "Review within the next few minutes and verify context."
            : "Informational signal. Continue monitoring for changes.",
      severity,
      source: pick(sources),
      location: pick(locations),
      createdAt,
    };
  });
}

export function makeUsers(): User[] {
  const roles: UserRole[] = ["Admin", "Operator", "Viewer"];
  const names = [
    "Amina Hassan",
    "Omar Khaled",
    "Laila Mostafa",
    "Youssef Adel",
    "Nour Ibrahim",
    "Sara Mohamed",
    "Karim Nabil",
  ] as const;

  return Array.from({ length: 10 }).map((_, i) => {
    const role = pick(roles);
    const name = pick(names);
    const email = `${name.toLowerCase().replace(" ", ".")}@campus.edu`;
    const status = Math.random() > 0.12 ? "Active" : "Suspended";
    const lastActiveAt = new Date(Date.now() - rand(2, 700) * 60_000).toISOString();
    return {
      id: id(`user${i}`),
      name,
      email,
      role,
      status,
      lastActiveAt,
    };
  });
}

export function makeCameras(): Camera[] {
  const zones = ["Gate", "Library", "Engineering", "Dorms", "Parking", "Stadium"] as const;
  return Array.from({ length: 18 }).map((_, i) => {
    const r = Math.random();
    const status = r > 0.12 ? (r > 0.86 ? "Degraded" : "Online") : "Offline";
    const lastSeenAt = new Date(Date.now() - rand(0, 12) * 60_000).toISOString();
    return {
      id: id(`cam${i}`),
      name: `CAM-${String(i + 1).padStart(3, "0")}`,
      zone: pick(zones),
      status,
      lastSeenAt,
    };
  });
}

export function makeStats(): Stats {
  const totalStudents = 18000 + rand(0, 900);
  const activeCameras = 210 + rand(-8, 14);
  const securityAlerts = 6 + rand(-2, 9);
  const systemStatus =
    securityAlerts > 16 ? "Critical" : securityAlerts > 11 ? "Degraded" : "Nominal";

  const now = Date.now();
  const series = Array.from({ length: 12 }).map((_, i) => {
    const t = new Date(now - (11 - i) * 5 * 60_000);
    const time = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return {
      time,
      alerts: Math.max(0, Math.round(securityAlerts + rand(-3, 4))),
      accessEvents: Math.max(0, Math.round(40 + rand(-12, 16))),
    };
  });

  return { totalStudents, activeCameras, securityAlerts, systemStatus, series };
}

export function makeLogs(): Log[] {
  const names = [
    "Ahmed Ali", "Fatma Said", "Mohamed Hassan", "Layla Karim", "Omar Nasser",
    "Sara Ahmed", "Youssef Mostafa", "Nour Salem", "Karim Reda", "Aisha Fouad"
  ] as const;
  const locations = [
    "North Gate", "Main Entrance", "Library", "Engineering Building", "Dorm A",
    "Parking Lot", "Sports Hall", "Admin Building"
  ] as const;

  const count = rand(25, 60);
  const recentMinutes = 120; // Last 2 hours

  return Array.from({ length: count }).map((_, i) => {
    const isAuthorized = Math.random() > 0.15; // 85% authorized
    const timestamp = new Date(Date.now() - rand(1, recentMinutes * 60) * 1000).toISOString();
    const status: LogStatus = isAuthorized ? "authorized" : "denied";
    return {
      id: id(`log${i}`),
      name: pick(names),
      studentId: `STU${String(1000 + rand(0, 8999)).padStart(4, '0')}`,
      timestamp,
      location: pick(locations),
      status,
      photoUrl: `https://i.pravatar.cc/60?u=${Math.random()}`,
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Most recent first
}

