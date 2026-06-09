import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
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
    paddingBottom: 64,
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
  // Org section heading
  orgHeading: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1C1917' },
  orgHeadingMeta: { fontSize: 8, color: '#78716C' },
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
  colVerify:   { width: '8%',  fontSize: 9, textAlign: 'right' },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#78716C', textTransform: 'uppercase', letterSpacing: 0.3 },
  // Signature block
  sigSection: {
    marginTop: 0,
    marginBottom: 8,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FAFAF9',
    borderBottom: '1px solid #E7E5E4',
  },
  sigLabel: { fontSize: 7, color: '#A8A29E', fontFamily: 'Helvetica-Bold', letterSpacing: 0.8, marginBottom: 8 },
  sigRow: { flexDirection: 'row', gap: 16 },
  sigLeft: { flex: 6 },
  sigRight: { flex: 4 },
  sigField: { marginBottom: 10 },
  sigFieldLabel: { fontSize: 7, color: '#78716C', marginBottom: 2 },
  sigFieldValue: { fontSize: 8, color: '#1C1917', marginBottom: 2 },
  sigLine: { borderBottom: '0.75px solid #CBD5E1', marginTop: 2, height: 14 },
  qrBlock: { alignItems: 'center', marginTop: 4 },
  qrCaption: { fontSize: 6, color: '#94A3B8', textAlign: 'center', marginTop: 3 },
  qrUrl: { fontSize: 5, color: '#94A3B8', textAlign: 'center', marginTop: 1 },
  sigVerifyText: { fontSize: 6, color: '#94A3B8', textAlign: 'center', marginTop: 10 },
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

// ─── Signature Block ──────────────────────────────────────────────────────────

function SignatureBlock({
  verifyUrl,
  supervisorName,
  orgName,
  qrDataUrl,
}: {
  /** Display URL shown under the QR (the QR itself encodes the full link). */
  verifyUrl: string;
  supervisorName: string;
  orgName: string;
  qrDataUrl: string;
}) {
  return (
    <View style={s.sigSection}>
      <Text style={s.sigLabel}>SUPERVISOR VERIFICATION</Text>
      <View style={s.sigRow}>
        {/* Left column */}
        <View style={s.sigLeft}>
          <View style={s.sigField}>
            <Text style={s.sigFieldLabel}>Supervisor Name</Text>
            {supervisorName ? <Text style={s.sigFieldValue}>{supervisorName}</Text> : null}
            <View style={s.sigLine} />
          </View>
          <View style={s.sigField}>
            <Text style={s.sigFieldLabel}>Organization</Text>
            {orgName ? <Text style={s.sigFieldValue}>{orgName}</Text> : null}
            <View style={s.sigLine} />
          </View>
          <View style={s.sigField}>
            <Text style={s.sigFieldLabel}>Title / Role</Text>
            <View style={{ ...s.sigLine, marginTop: 10 }} />
          </View>
        </View>
        {/* Right column */}
        <View style={s.sigRight}>
          <View style={s.sigField}>
            <Text style={s.sigFieldLabel}>Signature</Text>
            <View style={{ ...s.sigLine, marginTop: 28 }} />
          </View>
          <View style={s.sigField}>
            <Text style={s.sigFieldLabel}>Date</Text>
            <View style={{ ...s.sigLine, marginTop: 10 }} />
          </View>
          {/* QR code */}
          <View style={s.qrBlock}>
            <Image src={qrDataUrl} style={{ width: 56, height: 56 }} />
            <Text style={s.qrCaption}>Scan to verify all hours</Text>
            <Text style={s.qrUrl}>{verifyUrl}</Text>
          </View>
        </View>
      </View>
      <Text style={s.sigVerifyText}>
        Scan the code to view every logged hour for this organization on {verifyUrl}
      </Text>
    </View>
  );
}

// ─── Per-organization section ───────────────────────────────────────────────
// Renders one org's heading + session table (with signature blocks). When
// `pageBreak` is set, the section starts on a fresh page — used so that each
// organization gets its own page in the combined "All organizations" export.

function OrgSection({
  orgKey,
  orgName,
  sessions,
  includeSupervisor,
  qrCodes,
  pageBreak,
}: {
  orgKey: string;
  orgName: string;
  sessions: Session[];
  includeSupervisor: boolean;
  qrCodes: Record<string, string>;
  pageBreak?: boolean;
}) {
  const orgVerified = sessions.filter((x) => x.status === 'verified');
  const orgHours = orgVerified.reduce((sum, x) => sum + x.hours, 0);
  const orgHoursStr = orgHours % 1 === 0 ? `${orgHours}` : orgHours.toFixed(1);

  // A single verification block per org. The QR (keyed by org) resolves to a page
  // showing ALL of this student's hours at the organization.
  const orgQr = qrCodes[orgKey];
  const showSig = includeSupervisor && !!orgQr;
  // Use a single supervisor name only if every verified session shares it;
  // otherwise leave it blank for a manual signature.
  const supNames = Array.from(new Set(orgVerified.map((x) => x.supervisor).filter(Boolean)));
  const repSupervisor = supNames.length === 1 ? supNames[0] : '';

  return (
    <View break={pageBreak}>
      {/* Org heading */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, marginTop: pageBreak ? 0 : 16 }}>
        <Text style={s.orgHeading}>{orgName}</Text>
        <Text style={s.orgHeadingMeta}>
          {orgHoursStr} verified {orgHours === 1 ? 'hour' : 'hours'} · {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </Text>
      </View>

      {/* Table header */}
      <View style={s.tableHeader}>
        <Text style={{ ...s.colDate,     ...s.tableHeaderText }}>Date</Text>
        <Text style={{ ...s.colOrg,      ...s.tableHeaderText }}>Organization</Text>
        <Text style={{ ...s.colActivity, ...s.tableHeaderText }}>Activity</Text>
        <Text style={{ ...s.colHours,    ...s.tableHeaderText }}>Hrs</Text>
        <Text style={{ ...s.colStatus,   ...s.tableHeaderText }}>Status</Text>
        {includeSupervisor && <Text style={{ ...s.colVerify, ...s.tableHeaderText }}>Verified by</Text>}
      </View>

      {/* Session rows — no per-session signature; one block follows below */}
      {sessions.map((session) => {
        const hrs = session.hours % 1 === 0 ? `${session.hours}` : session.hours.toFixed(1);
        return (
          <View key={session.id} style={s.tableRow} wrap={false}>
            <Text style={s.colDate}>{fmtShort(session.date)}</Text>
            <Text style={s.colOrg}>{session.org}</Text>
            <Text style={s.colActivity}>{session.activity}</Text>
            <Text style={s.colHours}>{hrs}</Text>
            <Text style={s.colStatus}>
              {session.status === 'verified' ? '✓' : session.status === 'pending' ? '…' : '✗'}
            </Text>
            {includeSupervisor && (
              <Text style={s.colVerify}>
                {session.tier === 'institution' ? 'Inst.' : session.supervisor.split(' ')[0]}
              </Text>
            )}
          </View>
        );
      })}

      {/* One verification + signature block for the whole organization */}
      {showSig && (
        <View wrap={false} style={{ marginTop: 12 }}>
          <SignatureBlock
            verifyUrl="meritco.app/verify"
            supervisorName={repSupervisor}
            orgName={orgName}
            qrDataUrl={orgQr}
          />
        </View>
      )}
    </View>
  );
}

// ─── Modern template styles ───────────────────────────────────────────────────
const modern = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    paddingBottom: 64,
  },
  // Full-bleed blue header band
  headerBand: {
    backgroundColor: '#1D4ED8',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 48,
    marginBottom: 32,
  },
  meritLabel: { fontSize: 11, color: '#93C5FD', fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 14 },
  studentName: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', marginBottom: 4 },
  studentMeta: { fontSize: 9, color: '#BFDBFE' },
  headerRight: { position: 'absolute', top: 36, right: 48, textAlign: 'right' },
  headerDate: { fontSize: 9, color: '#93C5FD' },
  // Stat strip
  statStrip: {
    flexDirection: 'row',
    gap: 0,
    marginHorizontal: 48,
    marginBottom: 28,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
  },
  statCell: { flex: 1, padding: 14, borderRight: '1px solid #E5E7EB' },
  statCellLast: { flex: 1, padding: 14 },
  statVal: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 2 },
  statLbl: { fontSize: 8, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  // Body
  body: { paddingHorizontal: 48 },
  orgBlock: { marginBottom: 20 },
  orgName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1D4ED8', marginBottom: 2 },
  orgMeta: { fontSize: 8, color: '#6B7280', marginBottom: 8 },
  // Table
  tableHead: { flexDirection: 'row', backgroundColor: '#1D4ED8', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 4, marginBottom: 1 },
  tableHeadTxt: { fontSize: 8, color: '#BFDBFE', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRowEven: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#F9FAFB' },
  tableRowOdd:  { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#FFFFFF' },
  colDate:     { width: '12%', fontSize: 9 },
  colOrg:      { width: '26%', fontSize: 9 },
  colActivity: { width: '32%', fontSize: 9 },
  colHours:    { width: '10%', fontSize: 9, textAlign: 'right' },
  colStatus:   { width: '12%', fontSize: 9, textAlign: 'center' },
  colVerify:   { width: '8%',  fontSize: 9, textAlign: 'right' },
  // Sig
  sigBox: { marginTop: 12, border: '1px solid #E5E7EB', borderRadius: 6, padding: 12, backgroundColor: '#F9FAFB' },
  sigLabel: { fontSize: 7, color: '#6B7280', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  sigRow: { flexDirection: 'row', gap: 16 },
  sigLeft: { flex: 6 },
  sigRight: { flex: 4 },
  sigField: { marginBottom: 10 },
  sigFieldLabel: { fontSize: 7, color: '#6B7280', marginBottom: 2 },
  sigFieldValue: { fontSize: 8, color: '#111827', marginBottom: 2 },
  sigLine: { borderBottom: '0.75px solid #CBD5E1', marginTop: 2, height: 14 },
  qrBlock: { alignItems: 'center', marginTop: 4 },
  qrCaption: { fontSize: 6, color: '#9CA3AF', textAlign: 'center', marginTop: 3 },
  qrUrl:     { fontSize: 5, color: '#9CA3AF', textAlign: 'center', marginTop: 1 },
  sigVerifyText: { fontSize: 6, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
  // Footer
  footer: { position: 'absolute', bottom: 28, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5px solid #E5E7EB', paddingTop: 8 },
  footerText: { fontSize: 8, color: '#9CA3AF' },
  footerBlueDot: { fontSize: 8, color: '#1D4ED8' },
});

// ─── Advanced template styles ─────────────────────────────────────────────────
const adv = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 72,
    paddingHorizontal: 48,
  },
  // Outer formal border
  outerBorder: {
    position: 'absolute',
    top: 20, bottom: 20, left: 20, right: 20,
    border: '1.5px solid #0F172A',
  },
  innerBorder: {
    position: 'absolute',
    top: 24, bottom: 24, left: 24, right: 24,
    border: '0.5px solid #CBD5E1',
  },
  // Header
  header: { alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #0F172A' },
  wordmark: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 9, color: '#64748B', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 },
  dateLine: { fontSize: 8, color: '#64748B', marginTop: 6 },
  // Student block — centred, formal
  studentBlock: { alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid #CBD5E1' },
  certifiedLabel: { fontSize: 8, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  studentName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 4 },
  studentMeta: { fontSize: 9, color: '#64748B' },
  // Stat row — horizontal band
  statRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid #CBD5E1' },
  statBlock: { alignItems: 'center' },
  statVal: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#0F172A' },
  statLbl: { fontSize: 8, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 0.5, backgroundColor: '#CBD5E1' },
  // Org section
  orgHeading: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 1 },
  orgMeta: { fontSize: 8, color: '#64748B', marginBottom: 6 },
  // Table — formal ruled
  tableHead: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottom: '1px solid #0F172A', borderTop: '1px solid #0F172A', marginBottom: 1 },
  tableHeadTxt: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderBottom: '0.5px solid #E2E8F0' },
  colDate:     { width: '12%', fontSize: 9 },
  colOrg:      { width: '26%', fontSize: 9 },
  colActivity: { width: '32%', fontSize: 9 },
  colHours:    { width: '10%', fontSize: 9, textAlign: 'right' },
  colStatus:   { width: '12%', fontSize: 9, textAlign: 'center' },
  colVerify:   { width: '8%',  fontSize: 9, textAlign: 'right' },
  // Sig block
  sigBox: { marginTop: 12, border: '0.5px solid #CBD5E1', padding: 10 },
  sigLabel: { fontSize: 7, color: '#64748B', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, textAlign: 'center', borderBottom: '0.5px solid #CBD5E1', paddingBottom: 4 },
  sigRow: { flexDirection: 'row', gap: 16 },
  sigLeft: { flex: 6 },
  sigRight: { flex: 4 },
  sigField: { marginBottom: 10 },
  sigFieldLabel: { fontSize: 7, color: '#64748B', marginBottom: 2 },
  sigFieldValue: { fontSize: 8, color: '#0F172A', marginBottom: 2 },
  sigLine: { borderBottom: '0.75px solid #CBD5E1', marginTop: 2, height: 14 },
  qrBlock: { alignItems: 'center', marginTop: 4 },
  qrCaption: { fontSize: 6, color: '#94A3B8', textAlign: 'center', marginTop: 3 },
  qrUrl:     { fontSize: 5, color: '#94A3B8', textAlign: 'center', marginTop: 1 },
  sigVerifyText: { fontSize: 6, color: '#94A3B8', textAlign: 'center', marginTop: 8 },
  // Footer
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5px solid #0F172A', paddingTop: 6 },
  footerText: { fontSize: 7, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
});

// ─── Shared helpers ───────────────────────────────────────────────────────────

function fmtShortHrs(n: number) { return n % 1 === 0 ? `${n}` : n.toFixed(1); }

// ─── Modern template ──────────────────────────────────────────────────────────

function ModernSignatureBlock({ supervisorName, orgName, qrDataUrl }: { supervisorName: string; orgName: string; qrDataUrl: string }) {
  return (
    <View style={modern.sigBox} wrap={false}>
      <Text style={modern.sigLabel}>SUPERVISOR VERIFICATION</Text>
      <View style={modern.sigRow}>
        <View style={modern.sigLeft}>
          <View style={modern.sigField}>
            <Text style={modern.sigFieldLabel}>Supervisor Name</Text>
            {supervisorName ? <Text style={modern.sigFieldValue}>{supervisorName}</Text> : null}
            <View style={modern.sigLine} />
          </View>
          <View style={modern.sigField}>
            <Text style={modern.sigFieldLabel}>Organization</Text>
            {orgName ? <Text style={modern.sigFieldValue}>{orgName}</Text> : null}
            <View style={modern.sigLine} />
          </View>
          <View style={modern.sigField}>
            <Text style={modern.sigFieldLabel}>Title / Role</Text>
            <View style={{ ...modern.sigLine, marginTop: 10 }} />
          </View>
        </View>
        <View style={modern.sigRight}>
          <View style={modern.sigField}>
            <Text style={modern.sigFieldLabel}>Signature</Text>
            <View style={{ ...modern.sigLine, marginTop: 28 }} />
          </View>
          <View style={modern.sigField}>
            <Text style={modern.sigFieldLabel}>Date</Text>
            <View style={{ ...modern.sigLine, marginTop: 10 }} />
          </View>
          <View style={modern.qrBlock}>
            <Image src={qrDataUrl} style={{ width: 52, height: 52 }} />
            <Text style={modern.qrCaption}>Scan to verify</Text>
            <Text style={modern.qrUrl}>meritco.app/verify</Text>
          </View>
        </View>
      </View>
      <Text style={modern.sigVerifyText}>Independently verifiable at meritco.app/verify</Text>
    </View>
  );
}

export function ModernPdfDocument({ user, sessions, includeStats = true, includeSupervisor = true, dateRange = 'All time', qrCodes = {} }: Props) {
  const verified = sessions.filter((s) => s.status === 'verified');
  const totalHours = verified.reduce((sum, s) => sum + s.hours, 0);
  const verifiedRate = sessions.length === 0 ? 0 : Math.round((verified.length / sessions.length) * 100);
  const orgsCount = new Set(sessions.map((s) => s.orgSlug)).size;
  const generatedDate = format(new Date(), 'MMMM d, yyyy');

  const groupMap = new Map<string, { key: string; orgName: string; sessions: Session[] }>();
  for (const sess of sessions) {
    const key = sess.orgSlug || sess.org || 'unknown';
    if (!groupMap.has(key)) groupMap.set(key, { key, orgName: sess.org || 'Unknown', sessions: [] });
    groupMap.get(key)!.sessions.push(sess);
  }
  const orgGroups = Array.from(groupMap.values()).map((g) => ({ ...g, sessions: [...g.sessions].sort((a, b) => (a.date < b.date ? 1 : -1)) }));

  return (
    <Document>
      <Page size="LETTER" style={modern.page}>
        {/* Blue header band */}
        <View style={modern.headerBand}>
          <Text style={modern.meritLabel}>MERIT · SERVICE HOUR RECORD</Text>
          <Text style={modern.studentName}>{user.firstName} {user.lastName}</Text>
          <Text style={modern.studentMeta}>{user.school} · Grade {user.grade} · Class of {user.graduationYear} · {user.email}</Text>
          <View style={modern.headerRight}>
            <Text style={modern.headerDate}>Generated {generatedDate}</Text>
            <Text style={{ ...modern.headerDate, marginTop: 2 }}>{dateRange}</Text>
          </View>
        </View>

        {/* Stat strip */}
        {includeStats && (
          <View style={modern.statStrip}>
            <View style={modern.statCell}>
              <Text style={modern.statVal}>{fmtShortHrs(totalHours)}</Text>
              <Text style={modern.statLbl}>Verified hours</Text>
            </View>
            <View style={modern.statCell}>
              <Text style={modern.statVal}>{verifiedRate}%</Text>
              <Text style={modern.statLbl}>Verified rate</Text>
            </View>
            <View style={modern.statCellLast}>
              <Text style={modern.statVal}>{orgsCount}</Text>
              <Text style={modern.statLbl}>Organizations</Text>
            </View>
          </View>
        )}

        {/* Session log grouped by org */}
        <View style={modern.body}>
          {orgGroups.map((group, gi) => {
            const orgVerified = group.sessions.filter((x) => x.status === 'verified');
            const orgHours = orgVerified.reduce((sum, x) => sum + x.hours, 0);
            const supNames = Array.from(new Set(orgVerified.map((x) => x.supervisor).filter(Boolean)));
            const repSupervisor = supNames.length === 1 ? supNames[0] : '';
            const orgQr = qrCodes[group.key];

            return (
              <View key={group.key} break={gi > 0} style={modern.orgBlock}>
                <Text style={modern.orgName}>{group.orgName}</Text>
                <Text style={modern.orgMeta}>{fmtShortHrs(orgHours)} verified hours · {group.sessions.length} sessions</Text>
                <View style={modern.tableHead}>
                  <Text style={{ ...modern.colDate, ...modern.tableHeadTxt }}>Date</Text>
                  <Text style={{ ...modern.colOrg, ...modern.tableHeadTxt }}>Organization</Text>
                  <Text style={{ ...modern.colActivity, ...modern.tableHeadTxt }}>Activity</Text>
                  <Text style={{ ...modern.colHours, ...modern.tableHeadTxt }}>Hrs</Text>
                  <Text style={{ ...modern.colStatus, ...modern.tableHeadTxt }}>Status</Text>
                  {includeSupervisor && <Text style={{ ...modern.colVerify, ...modern.tableHeadTxt }}>By</Text>}
                </View>
                {group.sessions.map((sess, ri) => {
                  const rowStyle = ri % 2 === 0 ? modern.tableRowEven : modern.tableRowOdd;
                  return (
                    <View key={sess.id} style={rowStyle} wrap={false}>
                      <Text style={modern.colDate}>{fmtShort(sess.date)}</Text>
                      <Text style={modern.colOrg}>{sess.org}</Text>
                      <Text style={modern.colActivity}>{sess.activity}</Text>
                      <Text style={modern.colHours}>{fmtShortHrs(sess.hours)}</Text>
                      <Text style={modern.colStatus}>{sess.status === 'verified' ? '✓' : sess.status === 'pending' ? '…' : '✗'}</Text>
                      {includeSupervisor && <Text style={modern.colVerify}>{sess.tier === 'institution' ? 'Inst.' : sess.supervisor.split(' ')[0]}</Text>}
                    </View>
                  );
                })}
                {includeSupervisor && orgQr && (
                  <ModernSignatureBlock supervisorName={repSupervisor} orgName={group.orgName} qrDataUrl={orgQr} />
                )}
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={modern.footer} fixed>
          <Text style={modern.footerText}>merit. — {user.firstName} {user.lastName}</Text>
          <Text style={modern.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── Advanced template ────────────────────────────────────────────────────────

function AdvSignatureBlock({ supervisorName, orgName, qrDataUrl }: { supervisorName: string; orgName: string; qrDataUrl: string }) {
  return (
    <View style={adv.sigBox} wrap={false}>
      <Text style={adv.sigLabel}>SUPERVISOR VERIFICATION</Text>
      <View style={adv.sigRow}>
        <View style={adv.sigLeft}>
          <View style={adv.sigField}>
            <Text style={adv.sigFieldLabel}>Supervisor Name</Text>
            {supervisorName ? <Text style={adv.sigFieldValue}>{supervisorName}</Text> : null}
            <View style={adv.sigLine} />
          </View>
          <View style={adv.sigField}>
            <Text style={adv.sigFieldLabel}>Organization</Text>
            {orgName ? <Text style={adv.sigFieldValue}>{orgName}</Text> : null}
            <View style={adv.sigLine} />
          </View>
          <View style={adv.sigField}>
            <Text style={adv.sigFieldLabel}>Title / Role</Text>
            <View style={{ ...adv.sigLine, marginTop: 10 }} />
          </View>
        </View>
        <View style={adv.sigRight}>
          <View style={adv.sigField}>
            <Text style={adv.sigFieldLabel}>Signature</Text>
            <View style={{ ...adv.sigLine, marginTop: 28 }} />
          </View>
          <View style={adv.sigField}>
            <Text style={adv.sigFieldLabel}>Date</Text>
            <View style={{ ...adv.sigLine, marginTop: 10 }} />
          </View>
          <View style={adv.qrBlock}>
            <Image src={qrDataUrl} style={{ width: 52, height: 52 }} />
            <Text style={adv.qrCaption}>Scan to verify</Text>
            <Text style={adv.qrUrl}>meritco.app/verify</Text>
          </View>
        </View>
      </View>
      <Text style={adv.sigVerifyText}>Independently verifiable at meritco.app/verify</Text>
    </View>
  );
}

export function AdvancedPdfDocument({ user, sessions, includeStats = true, includeSupervisor = true, dateRange = 'All time', qrCodes = {} }: Props) {
  const verified = sessions.filter((s) => s.status === 'verified');
  const totalHours = verified.reduce((sum, s) => sum + s.hours, 0);
  const verifiedRate = sessions.length === 0 ? 0 : Math.round((verified.length / sessions.length) * 100);
  const orgsCount = new Set(sessions.map((s) => s.orgSlug)).size;
  const generatedDate = format(new Date(), 'MMMM d, yyyy');

  const groupMap = new Map<string, { key: string; orgName: string; sessions: Session[] }>();
  for (const sess of sessions) {
    const key = sess.orgSlug || sess.org || 'unknown';
    if (!groupMap.has(key)) groupMap.set(key, { key, orgName: sess.org || 'Unknown', sessions: [] });
    groupMap.get(key)!.sessions.push(sess);
  }
  const orgGroups = Array.from(groupMap.values()).map((g) => ({ ...g, sessions: [...g.sessions].sort((a, b) => (a.date < b.date ? 1 : -1)) }));

  return (
    <Document>
      <Page size="LETTER" style={adv.page}>
        {/* Formal border frame (fixed so it appears on every page) */}
        <View style={adv.outerBorder} fixed />
        <View style={adv.innerBorder} fixed />

        {/* Centred header */}
        <View style={adv.header}>
          <Text style={adv.wordmark}>merit.</Text>
          <Text style={adv.subtitle}>Certificate of Volunteer Service</Text>
          <Text style={adv.dateLine}>Generated {generatedDate} · {dateRange}</Text>
        </View>

        {/* Student — centred, formal */}
        <View style={adv.studentBlock}>
          <Text style={adv.certifiedLabel}>This certifies the volunteer service of</Text>
          <Text style={adv.studentName}>{user.firstName} {user.lastName}</Text>
          <Text style={adv.studentMeta}>{user.school} · Grade {user.grade} · Class of {user.graduationYear}</Text>
          <Text style={{ ...adv.studentMeta, marginTop: 2 }}>{user.email}</Text>
        </View>

        {/* Stats — centred horizontal */}
        {includeStats && (
          <View style={adv.statRow}>
            <View style={adv.statBlock}>
              <Text style={adv.statVal}>{fmtShortHrs(totalHours)}</Text>
              <Text style={adv.statLbl}>Verified Hours</Text>
            </View>
            <View style={adv.statDivider} />
            <View style={adv.statBlock}>
              <Text style={adv.statVal}>{verifiedRate}%</Text>
              <Text style={adv.statLbl}>Verified Rate</Text>
            </View>
            <View style={adv.statDivider} />
            <View style={adv.statBlock}>
              <Text style={adv.statVal}>{orgsCount}</Text>
              <Text style={adv.statLbl}>Organizations</Text>
            </View>
          </View>
        )}

        {/* Org sections */}
        {orgGroups.map((group, gi) => {
          const orgVerified = group.sessions.filter((x) => x.status === 'verified');
          const orgHours = orgVerified.reduce((sum, x) => sum + x.hours, 0);
          const supNames = Array.from(new Set(orgVerified.map((x) => x.supervisor).filter(Boolean)));
          const repSupervisor = supNames.length === 1 ? supNames[0] : '';
          const orgQr = qrCodes[group.key];

          return (
            <View key={group.key} break={gi > 0} style={{ marginBottom: 20 }}>
              <Text style={adv.orgHeading}>{group.orgName}</Text>
              <Text style={adv.orgMeta}>{fmtShortHrs(orgHours)} verified hours · {group.sessions.length} sessions</Text>
              <View style={adv.tableHead}>
                <Text style={{ ...adv.colDate, ...adv.tableHeadTxt }}>Date</Text>
                <Text style={{ ...adv.colOrg, ...adv.tableHeadTxt }}>Organization</Text>
                <Text style={{ ...adv.colActivity, ...adv.tableHeadTxt }}>Activity</Text>
                <Text style={{ ...adv.colHours, ...adv.tableHeadTxt }}>Hrs</Text>
                <Text style={{ ...adv.colStatus, ...adv.tableHeadTxt }}>Status</Text>
                {includeSupervisor && <Text style={{ ...adv.colVerify, ...adv.tableHeadTxt }}>By</Text>}
              </View>
              {group.sessions.map((sess) => (
                <View key={sess.id} style={adv.tableRow} wrap={false}>
                  <Text style={adv.colDate}>{fmtShort(sess.date)}</Text>
                  <Text style={adv.colOrg}>{sess.org}</Text>
                  <Text style={adv.colActivity}>{sess.activity}</Text>
                  <Text style={adv.colHours}>{fmtShortHrs(sess.hours)}</Text>
                  <Text style={adv.colStatus}>{sess.status === 'verified' ? '✓' : sess.status === 'pending' ? '…' : '✗'}</Text>
                  {includeSupervisor && <Text style={adv.colVerify}>{sess.tier === 'institution' ? 'Inst.' : sess.supervisor.split(' ')[0]}</Text>}
                </View>
              ))}
              {includeSupervisor && orgQr && (
                <AdvSignatureBlock supervisorName={repSupervisor} orgName={group.orgName} qrDataUrl={orgQr} />
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={adv.footer} fixed>
          <Text style={adv.footerText}>merit. · meritco.app</Text>
          <Text style={adv.footerText}>{user.firstName} {user.lastName}</Text>
          <Text style={adv.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

interface Props {
  user: User;
  sessions: Session[];
  includeStats?: boolean;
  includeSupervisor?: boolean;
  dateRange?: string;
  /** Pre-generated QR data URLs keyed by session id */
  qrCodes?: Record<string, string>;
}

export function MeritPdfDocument({
  user,
  sessions,
  includeStats = true,
  includeSupervisor = true,
  dateRange = 'All time',
  qrCodes = {},
}: Props) {
  const verified = sessions.filter((s) => s.status === 'verified');
  const totalHours = verified.reduce((sum, s) => sum + s.hours, 0);
  const verifiedRate = sessions.length === 0 ? 0 : Math.round((verified.length / sessions.length) * 100);
  const orgsCount = new Set(sessions.map((s) => s.orgSlug)).size;

  const hoursStr = totalHours % 1 === 0 ? `${totalHours}` : totalHours.toFixed(1);
  const generatedDate = format(new Date(), 'MMMM d, yyyy');

  // Group sessions by organization, preserving first-seen order. Sessions within
  // a group are sorted newest-first so each org reads as its own clean record.
  const groupMap = new Map<string, { key: string; orgName: string; sessions: Session[] }>();
  for (const sess of sessions) {
    const key = sess.orgSlug || sess.org || 'unknown';
    if (!groupMap.has(key)) groupMap.set(key, { key, orgName: sess.org || 'Unknown organization', sessions: [] });
    groupMap.get(key)!.sessions.push(sess);
  }
  const orgGroups = Array.from(groupMap.values()).map((g) => ({
    ...g,
    sessions: [...g.sessions].sort((a, b) => (a.date < b.date ? 1 : -1)),
  }));

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
              <Text style={s.summarySub}>of {user.nhsGoalHours} hr goal</Text>
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

        {/* Session log — grouped by organization. In the combined export each
            org starts on its own page; a single-org export is just one section. */}
        <Text style={s.sectionHeading}>Session log</Text>

        {orgGroups.map((group, i) => (
          <OrgSection
            key={group.key}
            orgKey={group.key}
            orgName={group.orgName}
            sessions={group.sessions}
            includeSupervisor={includeSupervisor}
            qrCodes={qrCodes}
            pageBreak={i > 0}
          />
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>merit. — Service hour record for {user.firstName} {user.lastName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
