export type OccupancyResult = {
  peopleInside: number;
  entries: number;
  exits: number;
};

/**
 * Simplified occupancy estimator from access logs.
 *
 * Assumptions:
 * - If the log has `entry_exit` ("entry"|"exit"), we use it.
 * - Otherwise, we approximate:
 *   - authorized => entry
 *   - denied => exit (keeps demo occupancy changing)
 */
export function estimateOccupancyFromLogs(logs: any[]): OccupancyResult {
  if (!Array.isArray(logs) || logs.length === 0) {
    return { peopleInside: 0, entries: 0, exits: 0 };
  }

  let entries = 0;
  let exits = 0;

  for (const l of logs) {
    const action = l?.entry_exit;
    if (action === 'entry') entries++;
    else if (action === 'exit') exits++;
    else {
      // fallback approximation for demo
      if (l?.status === 'authorized' || l?.status === 'Authorized') entries++;
      else exits++;
    }
  }

  const peopleInside = Math.max(0, entries - exits);
  return { peopleInside, entries, exits };
}

