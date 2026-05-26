interface OrgEntry {
  orgId: string;
  orgName: string;
  totalHours: number;
  sessionCount: number;
}

interface Props {
  orgs: OrgEntry[];
}

export function OrgsSection({ orgs }: Props) {
  if (orgs.length === 0) {
    return (
      <section>
        <h2 className="text-[15px] font-semibold text-ink-900 mb-3">Organizations</h2>
        <p className="text-sm text-ink-400">No volunteer hours logged yet.</p>
      </section>
    );
  }

  const maxHours = Math.max(...orgs.map((o) => o.totalHours), 1);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-ink-900">
          Organizations
          <span className="ml-2 text-[12px] font-medium text-ink-400">{orgs.length}</span>
        </h2>
      </div>
      <div className="space-y-2">
        {orgs.map((org) => {
          const pct = Math.round((org.totalHours / maxHours) * 100);
          const hoursDisplay =
            org.totalHours % 1 === 0
              ? String(org.totalHours)
              : org.totalHours.toFixed(1);

          return (
            <div key={org.orgId} className="bg-white rounded-xl border border-ink-200 px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[13px] font-semibold text-ink-900 truncate">{org.orgName}</p>
                <span className="text-[12px] font-medium text-ink-500 shrink-0 ml-3">
                  {hoursDisplay} hr{org.totalHours !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-merit-blue-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-ink-400 shrink-0">
                  {org.sessionCount} session{org.sessionCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
