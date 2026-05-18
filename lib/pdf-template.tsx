import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Session, User } from './types';
import { format, parseISO } from 'date-fns';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1C1917',
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: '1px solid #E7E5E4',
  },
  wordmark: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1C1917' },
  wordmarkDot: { color: '#2563EB' },
  headerMeta: { textAlign: 'right', color: '#78716C', fontSize: 9 },
  // Student block
  studentBlock: { marginBottom: 24 },
  studentName: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  studentMeta: { color: '#78716C', fontSize: 9 },
  // Summary row
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    border: '1px solid #E7E5E4',
    borderRadius: 6,
    padding: 12,
  },
  summaryLabel: { fontSize: 8, color: '#A8A29E', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  summarySub: { fontSize: 8, color: '#78716C', marginTop: 2 },
  // Section heading
  sectionHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A8A29E',
    marginBottom: 8,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F4',
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottom: '0.5px solid #E7E5E4',
  },
  colDate:     { width: '12%', fontSize: 9 },
  colOrg:      { width: '26%', fontSize: 9 },
  colActivity: { width: '32%', fontSize: 9 },
  colHours:    { width: '10%', fontSize: 9, textAlign: 'right' },
  colStatus:   { width: '12%', fontSize: 9, textAlign: 'center' },
  colTier:     { width: '8%',  fontSize: 9, textAlign: 'right' },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#78716C', textTransform: 'uppercase', letterSpacing: 0.3 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '0.5px solid #E7E5E4',
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: '#A8A29E' },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string) {
  try { return format(parseISO(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
}

function fmtShort(dateStr: string) {
  try { return format(parseISO(dateStr), 'MMM d'); } catch { return dateStr; }
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

interface Props {
  user: User;
  sessions: Session[];
  includeStats?: boolean;
  includeSupervisor?: boolean;
  dateRange?: string;
}

export function MeritPdfDocument({ user, sessions, includeStats = true, includeSupervisor = true, dateRange = 'All time' }: Props) {
  const verified = sessions.filter((s) => s.status === 'verified');
  const totalHours = verified.reduce((sum, s) => sum + s.hours, 0);
  const verifiedRate = sessions.length === 0 ? 0 : Math.round((verified.length / sessions.length) * 100);
  const orgsCount = new Set(sessions.map((s) => s.orgSlug)).size;

  const hoursStr = totalHours % 1 === 0 ? `${totalHours}` : totalHours.toFixed(1);
  const generatedDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.wordmark}>
              merit<Text style={s.wordmarkDot}>.</Text>
            </Text>
            <Text style={{ fontSize: 9, color: '#78716C', marginTop: 2 }}>Service hour record</Text>
          </View>
          <View style={s.headerMeta}>
            <Text>Generated {generatedDate}</Text>
            <Text style={{ marginTop: 2 }}>{dateRange}</Text>
          </View>
        </View>

        {/* Student */}
        <View style={s.studentBlock}>
          <Text style={s.studentName}>{user.firstName} {user.lastName}</Text>
          <Text style={s.studentMeta}>
            {user.school} · Grade {user.grade} · Class of {user.graduationYear}
          </Text>
          <Text style={{ ...s.studentMeta, marginTop: 2 }}>{user.email}</Text>
        </View>

        {/* Summary stats */}
        {includeStats && (
          <View style={s.summaryRow}>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Total verified hours</Text>
              <Text style={s.summaryValue}>{hoursStr}</Text>
              <Text style={s.summarySub}>of {user.nhsGoalHours} hr NHS goal</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Verified rate</Text>
              <Text style={s.summaryValue}>{verifiedRate}%</Text>
              <Text style={s.summarySub}>{verified.length} of {sessions.length} sessions</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Organizations</Text>
              <Text style={s.summaryValue}>{orgsCount}</Text>
              <Text style={s.summarySub}>unique placements</Text>
            </View>
          </View>
        )}

        {/* Session log */}
        <Text style={s.sectionHeading}>Session log</Text>

        {/* Table header */}
        <View style={s.tableHeader}>
          <Text style={{ ...s.colDate,     ...s.tableHeaderText }}>Date</Text>
          <Text style={{ ...s.colOrg,      ...s.tableHeaderText }}>Organization</Text>
          <Text style={{ ...s.colActivity, ...s.tableHeaderText }}>Activity</Text>
          <Text style={{ ...s.colHours,    ...s.tableHeaderText }}>Hrs</Text>
          <Text style={{ ...s.colStatus,   ...s.tableHeaderText }}>Status</Text>
          {includeSupervisor && <Text style={{ ...s.colTier, ...s.tableHeaderText }}>Verified by</Text>}
        </View>

        {/* Rows */}
        {sessions.map((session) => {
          const hoursStr = session.hours % 1 === 0 ? `${session.hours}` : session.hours.toFixed(1);
          return (
            <View key={session.id} style={s.tableRow}>
              <Text style={s.colDate}>{fmtShort(session.date)}</Text>
              <Text style={s.colOrg}>{session.org}</Text>
              <Text style={s.colActivity}>{session.activity}</Text>
              <Text style={s.colHours}>{hoursStr}</Text>
              <Text style={s.colStatus}>{session.status === 'verified' ? '✓' : session.status === 'pending' ? '…' : '✗'}</Text>
              {includeSupervisor && (
                <Text style={s.colTier}>
                  {session.tier === 'institution' ? 'Inst.' : session.supervisor.split(' ')[0]}
                </Text>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>merit. — Service hour record for {user.firstName} {user.lastName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
