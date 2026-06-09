'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion';
import {
  Users, Calendar, MessageSquare, BarChart3, Award, CheckCircle2, Send, Bell, FileDown, Clock,
  type LucideIcon,
} from 'lucide-react';

const SP: Transition = { type: 'spring', stiffness: 280, damping: 30 };
const SPB: Transition = { type: 'spring', stiffness: 400, damping: 22 };
const APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const TAB_MS = 5000;

interface Feature {
  id: string;
  icon: LucideIcon;
  label: string;
  tagline: string;
  description: string;
  screen: () => React.JSX.Element;
}

const FEATURES: Feature[] = [
  {
    id: 'volunteers',
    icon: Users,
    label: 'Volunteer roster',
    tagline: 'See every volunteer, every hour.',
    description:
      "Your full volunteer database. Who's active, total hours per person, last session date, school and grade. Searchable, sortable, exportable.",
    screen: VolunteerScreen,
  },
  {
    id: 'events',
    icon: Calendar,
    label: 'Events & shifts',
    tagline: 'Create a shift in 30 seconds.',
    description:
      "Set a date, max capacity, and program. Publish it. Merit texts every volunteer automatically. Check them in on the day — hours auto-log when you're done.",
    screen: EventScreen,
  },
  {
    id: 'sms',
    icon: MessageSquare,
    label: 'Bulk SMS',
    tagline: 'Reach 47 volunteers in one tap.',
    description:
      'Send an SMS to all volunteers, everyone signed up for a specific event, or anyone active in the last 30 days. No app needed on their end. Just a text.',
    screen: SMSScreen,
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Grant reports',
    tagline: 'What used to take 3 hours: 30 seconds.',
    description:
      'Pick a date range. Click generate. A professional impact PDF downloads instantly — total volunteers, hours by program, top contributors. Ready for any grant committee.',
    screen: ReportScreen,
  },
  {
    id: 'certificates',
    icon: Award,
    label: 'Certificates',
    tagline: 'Students love you for this.',
    description:
      'Generate personalized volunteer recognition letters for any student with one click. They use these for NHS, IB, scholarship and college apps. Your signature. Their credentials.',
    screen: CertScreen,
  },
];

export function OrgShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const rm = useReducedMotion();

  useEffect(() => {
    if (paused || rm) return;
    const t = setInterval(() => setActive((a) => (a + 1) % FEATURES.length), TAB_MS);
    return () => clearInterval(t);
  }, [paused, rm]);

  const feature = FEATURES[active];
  const ScreenComponent = feature.screen;

  return (
    <div className="relative w-full max-w-6xl mx-auto" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">For organizations</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Your entire volunteer operation.
          <br />
          <span className="text-muted-foreground">One dashboard.</span>
        </h2>
      </div>

      {/* Tabs left, laptop right */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6 lg:gap-16 items-center">
        {/* Feature tabs */}
        <div className="space-y-1">
          {FEATURES.map((f, i) => {
            const isActive = i === active;
            return (
              <button
                key={f.id}
                onClick={() => setActive(i)}
                className={`w-full text-left rounded-2xl p-4 transition-all duration-300 group ${
                  isActive ? 'bg-card/10 border border-white/10' : 'hover:bg-card/5 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-card' : 'bg-card/10'}`}>
                    <f.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm transition-colors ${isActive ? 'text-white' : 'text-muted-foreground'}`}>{f.label}</p>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: APPLE }}>
                          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{f.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-3 h-px bg-card/20 rounded-full overflow-hidden">
                    <motion.div
                      key={`${active}-progress`}
                      className="h-full bg-card origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: rm ? 0 : 1 }}
                      transition={{ duration: TAB_MS / 1000, ease: 'linear' }}
                    />
                  </div>
                )}
              </button>
            );
          })}
          {/* Mobile-only: show feature description below tabs (no laptop on small screens) */}
          <div className="lg:hidden mt-2 px-1">
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        </div>

        {/* Laptop — hidden on mobile, visible lg+ */}
        <div className="hidden lg:block relative">
          <div className="relative aspect-[16/10] rounded-xl bg-gradient-to-b from-gray-600 to-gray-800 p-[6px] shadow-2xl">
            <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-500" />
            <div className="w-full h-full rounded-lg bg-[#0A0A0A] overflow-hidden border border-border">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 shrink-0 bg-[#111]">
                <div className="w-6 h-6 rounded bg-card/10 flex items-center justify-center text-[9px] font-bold text-white">VR</div>
                <span className="text-white text-[11px] font-semibold">Vancouver Rotary Foundation</span>
                <span className="ml-auto text-muted-foreground text-[9px]">Org Dashboard</span>
              </div>
              <div className="p-4 h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: APPLE }} className="h-full">
                    <ScreenComponent />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="h-3 bg-gradient-to-b from-gray-500 to-gray-600 rounded-b-xl mx-[-1.5%]" />
          <div className="h-1 bg-gray-500 rounded-b-2xl mx-[-3%] opacity-60" />
          <div aria-hidden className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-blue-500 rounded-full scale-90 translate-y-8" />
        </div>
      </div>
    </div>
  );
}

// ── Dashboard screens ─────────────────────────────────────────────────────────
function VolunteerScreen() {
  const volunteers = [
    { name: 'Sarah Kim', school: 'Eric Hamber · Gr 12', hrs: 28, sessions: 7, active: true },
    { name: 'Jordan Lee', school: 'Burnaby North · Gr 11', hrs: 19, sessions: 5, active: true },
    { name: 'Alex Park', school: 'Lord Byng · Gr 12', hrs: 14, sessions: 4, active: false },
    { name: 'Maya Chen', school: 'Kitsilano · Gr 10', hrs: 22, sessions: 6, active: true },
    { name: 'Tomas R.', school: 'Point Grey · Gr 11', hrs: 9, sessions: 3, active: true },
    { name: 'Priya S.', school: 'Eric Hamber · Gr 12', hrs: 31, sessions: 8, active: false },
  ];

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold text-white">All volunteers</p>
          <p className="text-[9px] text-muted-foreground">47 total · 38 active in last 90 days</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-card/5 rounded-lg px-2 py-1 text-[9px] text-muted-foreground">Search...</div>
          <div className="bg-card/10 rounded-lg px-2 py-1 text-[9px] text-white font-medium">↓ Export CSV</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { v: '47', l: 'Volunteers', icon: Users, c: 'text-blue-400' },
          { v: '316h', l: 'Verified hrs', icon: Clock, c: 'text-green-400' },
          { v: '90', l: 'Sessions', icon: CheckCircle2, c: 'text-muted-foreground' },
        ].map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.05 + i * 0.04 }} className="bg-card/5 rounded-xl p-3">
            <s.icon className={`w-3.5 h-3.5 ${s.c} mb-1`} />
            <p className="font-bold text-sm text-white">{s.v}</p>
            <p className="text-[9px] text-muted-foreground">{s.l}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-1">
        {volunteers.map((v, i) => (
          <motion.div key={v.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.1 + i * 0.04 }} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-card/5 transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-card/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0">{v.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-semibold text-white truncate">{v.name}</p>
                {v.active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
              </div>
              <p className="text-[9px] text-muted-foreground truncate">{v.school}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-bold text-white">{v.hrs}h</p>
              <p className="text-[9px] text-muted-foreground">{v.sessions} sessions</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EventScreen() {
  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-white">Events</p>
        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={SPB} className="bg-card text-foreground text-[9px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
          + Create event
        </motion.button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }} className="bg-card/5 border border-white/10 rounded-xl p-4 mb-3">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-3">Saturday Food Bank Shift</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { l: 'Date', v: 'June 7' },
            { l: 'Time', v: '9am–12pm' },
            { l: 'Spots', v: '15' },
          ].map((f) => (
            <div key={f.l} className="bg-card/5 rounded-lg p-2">
              <p className="text-[8px] text-muted-foreground">{f.l}</p>
              <p className="text-[11px] font-semibold text-white">{f.v}</p>
            </div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <Bell className="w-3 h-3 text-green-400 shrink-0" />
          <p className="text-[10px] text-green-400 font-medium">SMS sent to 47 volunteers</p>
        </motion.div>
      </motion.div>

      <div className="space-y-1.5">
        {[
          { name: 'Saturday Food Bank', date: 'Jun 7', count: '12/15', status: 'published' },
          { name: 'Youth Mentorship Day', date: 'Jun 14', count: '8/20', status: 'published' },
          { name: 'Animal Shelter Visit', date: 'Jun 21', count: '3/10', status: 'draft' },
        ].map((e, i) => (
          <motion.div key={e.name} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.2 + i * 0.06 }} className="flex items-center gap-3 bg-card/5 rounded-lg px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-card/10 flex flex-col items-center justify-center shrink-0">
              <span className="text-[7px] text-muted-foreground">{e.date.split(' ')[0]}</span>
              <span className="text-[11px] font-bold text-white">{e.date.split(' ')[1]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{e.name}</p>
              <p className="text-[9px] text-muted-foreground">{e.count} signed up</p>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${e.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-muted-foreground'}`}>{e.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SMSScreen() {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSent(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="text-white">
      <p className="text-[11px] font-bold text-white mb-4">Bulk announcement</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { v: 'all', l: 'All volunteers (47)', active: true },
          { v: '30d', l: 'Active 30 days', active: false },
          { v: 'event', l: 'This event', active: false },
        ].map((opt) => (
          <span key={opt.v} className={`text-[10px] px-3 py-1.5 rounded-lg font-medium ${opt.active ? 'bg-card text-foreground' : 'bg-card/10 text-muted-foreground'}`}>{opt.l}</span>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card/5 border border-white/10 rounded-xl p-3 mb-3">
        <p className="text-[10px] text-muted-foreground mb-2">Message</p>
        <p className="text-[12px] text-white leading-relaxed">
          Reminder: our Saturday Food Bank shift is June 7th at 9am, 123 Main St. Looking forward to seeing you there! 🙌
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <p className="text-[9px] text-muted-foreground">Sending to 47 volunteers via SMS</p>
          <p className="text-[9px] text-muted-foreground">142 / 300 chars</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.button key="send" exit={{ opacity: 0, scale: 0.95 }} className="w-full bg-card text-foreground font-bold py-2.5 rounded-xl text-[12px] flex items-center justify-center gap-2">
            <Send className="w-3.5 h-3.5" />
            Send to 47 volunteers
          </motion.button>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={SPB} className="w-full bg-green-500/10 border border-green-500/20 rounded-xl py-2.5 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <p className="text-[12px] text-green-400 font-bold">Sent to 47 volunteers</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 space-y-1.5">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">Recent messages</p>
        {[
          { msg: 'Food bank shift reminder — tomorrow 9am', n: 47, ago: 'Just now' },
          { msg: 'Thank you for 300 hours of service this year!', n: 43, ago: '2 weeks ago' },
        ].map((m) => (
          <div key={m.msg} className="bg-card/5 rounded-lg px-3 py-2">
            <p className="text-[10px] text-white truncate">{m.msg}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">{m.n} recipients · {m.ago}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportScreen() {
  const [generated, setGenerated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGenerated(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="text-white">
      <p className="text-[11px] font-bold text-white mb-4">Grant impact report</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-card/5 rounded-lg p-2">
          <p className="text-[8px] text-muted-foreground">FROM</p>
          <p className="text-[11px] font-semibold">Jan 1, 2026</p>
        </div>
        <div className="bg-card/5 rounded-lg p-2">
          <p className="text-[8px] text-muted-foreground">TO</p>
          <p className="text-[11px] font-semibold">May 31, 2026</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!generated ? (
          <motion.div key="gen" exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-[11px] text-muted-foreground">Generating report...</p>
          </motion.div>
        ) : (
          <motion.div key="pdf" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={SP}>
            <div className="bg-card rounded-xl p-4 mb-3 shadow-lg">
              <p className="text-[7px] text-muted-foreground tracking-widest font-bold">MERIT · VOLUNTEER IMPACT REPORT</p>
              <p className="text-[12px] font-bold text-foreground mt-1">Vancouver Rotary Foundation</p>
              <p className="text-[9px] text-muted-foreground">January – May 2026</p>
              <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                {[
                  { v: '47', l: 'Volunteers' },
                  { v: '316h', l: 'Total hours' },
                  { v: '3', l: 'Programs' },
                ].map((s) => (
                  <div key={s.l} className="text-center bg-muted rounded-lg py-2">
                    <p className="font-bold text-foreground text-sm">{s.v}</p>
                    <p className="text-muted-foreground text-[8px]">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                {[
                  { p: 'Food Bank Operations', pct: 42, hrs: '132h' },
                  { p: 'Youth Mentorship', pct: 31, hrs: '98h' },
                  { p: 'Animal Welfare', pct: 27, hrs: '86h' },
                ].map((p) => (
                  <div key={p.p}>
                    <div className="flex justify-between text-[8px] text-muted-foreground mb-0.5">
                      <span>{p.p}</span>
                      <span className="font-bold">{p.hrs}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ ...SP, delay: 0.3 }} className="h-full bg-muted rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full bg-card text-foreground font-bold py-2 rounded-lg text-[11px] flex items-center justify-center gap-1.5">
              <FileDown className="w-3.5 h-3.5" />
              Download PDF for grant submission
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CertScreen() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);

  const vols = [
    { name: 'Sarah Kim', hrs: 28, school: 'Eric Hamber' },
    { name: 'Jordan Lee', hrs: 19, school: 'Burnaby North' },
    { name: 'Maya Chen', hrs: 22, school: 'Kitsilano' },
    { name: 'Priya S.', hrs: 31, school: 'Eric Hamber' },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      setGenerating('Sarah Kim');
      setTimeout(() => {
        setGenerating(null);
        setGenerated(['Sarah Kim']);
      }, 1200);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-white">Volunteer certificates</p>
        <p className="text-[9px] text-muted-foreground">47 ready to generate</p>
      </div>

      <AnimatePresence>
        {generated.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95, height: 0 }} animate={{ opacity: 1, scale: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={SP} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-4 overflow-hidden">
            <p className="text-[8px] text-amber-700 font-bold uppercase tracking-widest text-center">Certificate of Recognition</p>
            <p className="text-center font-bold text-foreground mt-1 text-[13px]">Sarah Kim</p>
            <p className="text-center text-[9px] text-muted-foreground mt-0.5">28 verified hours · Vancouver Rotary Foundation</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200 text-[8px] text-amber-700">
              <span>Jane Smith · Coordinator</span>
              <span>June 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {vols.map((v, i) => {
          const isGenerating = generating === v.name;
          const isDone = generated.includes(v.name);
          return (
            <motion.div key={v.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.05 + i * 0.04 }} className="flex items-center gap-3 bg-card/5 rounded-xl px-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-card/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{v.name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">{v.name}</p>
                <p className="text-[9px] text-muted-foreground">{v.hrs}h · {v.school}</p>
              </div>
              {isDone ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPB} className="text-[9px] text-green-400 font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Sent
                </motion.span>
              ) : isGenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white shrink-0" />
              ) : (
                <span className="text-[9px] px-2.5 py-1 rounded-lg bg-card/10 text-muted-foreground font-medium cursor-pointer hover:bg-card/20 hover:text-white transition-colors shrink-0">Generate</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
