'use client';

import { useState, useEffect } from 'react';
import {
  motion, AnimatePresence, useReducedMotion, useMotionValue, animate,
  type Transition,
} from 'framer-motion';
import {
  CheckCircle2, Clock, Send, FileDown, Sparkles, ShieldCheck, MessageSquare,
} from 'lucide-react';

// ── Physics ───────────────────────────────────────────────────────────────────
const SP: Transition = { type: 'spring', stiffness: 280, damping: 30 };
const SPB: Transition = { type: 'spring', stiffness: 400, damping: 22 };
const APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STEP_MS = 4500;

type StudentScreen = 'log' | 'pending' | 'verified' | 'export';
type SupervisorScreen = 'idle' | 'sms' | 'replied' | 'done';

const STEPS: {
  id: string;
  label: string;
  sub: string;
  studentScreen: StudentScreen;
  supervisorScreen: SupervisorScreen;
}[] = [
  { id: 'log', label: 'Log your session', sub: 'Takes about 20 seconds.', studentScreen: 'log', supervisorScreen: 'idle' },
  { id: 'sms', label: 'Supervisor gets SMS', sub: 'They receive a text. No app required.', studentScreen: 'pending', supervisorScreen: 'sms' },
  { id: 'verify', label: 'They reply YES', sub: "One word. That's it. They're done.", studentScreen: 'verified', supervisorScreen: 'replied' },
  { id: 'export', label: 'You export your PDF', sub: 'Signed, QR-verified, accepted everywhere.', studentScreen: 'export', supervisorScreen: 'done' },
];

export function StudentDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const rm = useReducedMotion();

  useEffect(() => {
    if (paused || rm) return;
    progress.set(0);
    const c = animate(progress, 1, {
      duration: STEP_MS / 1000,
      ease: 'linear',
      onComplete: () => setStep((s) => (s + 1) % STEPS.length),
    });
    return () => c.stop();
  }, [step, paused, rm, progress]);

  const s = STEPS[step];

  return (
    <div
      className="relative w-full max-w-5xl mx-auto select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Step progress tabs */}
      <div className="flex gap-1 mb-12 max-w-xl mx-auto">
        {STEPS.map((st, i) => (
          <button key={st.id} onClick={() => { setStep(i); progress.set(0); }} className="flex-1 py-2 text-left group">
            <p className={`text-[11px] font-semibold mb-2 transition-colors ${i === step ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {st.label}
            </p>
            <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
              {i < step ? (
                <div className="h-full w-full bg-gray-900" />
              ) : i === step ? (
                <motion.div className="h-full bg-gray-900 origin-left" style={{ scaleX: progress }} />
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {/* Two phones */}
      <div className="flex items-center justify-center gap-6 md:gap-10 lg:gap-16">
        {/* Student phone */}
        <div className="relative flex flex-col items-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Student</p>
          <Phone>
            <AnimatePresence mode="wait">
              {s.studentScreen === 'log' && <SLogScreen key="log" />}
              {s.studentScreen === 'pending' && <SPendingScreen key="pend" />}
              {s.studentScreen === 'verified' && <SVerifiedScreen key="ver" />}
              {s.studentScreen === 'export' && <SExportScreen key="exp" />}
            </AnimatePresence>
          </Phone>

          {/* Floating: awaiting (step 1) */}
          <AnimatePresence>
            {step === 1 && (
              <motion.div key="await" initial={{ opacity: 0, x: -20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={SPB} className="absolute -bottom-2 -left-4 md:-left-12 bg-white/85 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-3 w-44 z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Pending</p>
                    <p className="text-[11px] text-gray-900 font-semibold">Awaiting reply...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating: verified (step 2) */}
          <AnimatePresence>
            {step === 2 && (
              <motion.div key="ver-card" initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ ...SPB, delay: 0.5 }} className="absolute -bottom-2 -left-4 md:-left-12 bg-white/85 backdrop-blur-xl border border-green-200 rounded-2xl shadow-xl p-3 w-44 z-20">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ scale: [0, 1.3, 1] }} transition={{ ...SPB, delay: 0.6 }} className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </motion.div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Verified ✓</p>
                    <p className="text-[11px] text-gray-900 font-semibold">4 hours confirmed</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating: PDF (step 3) */}
          <AnimatePresence>
            {step === 3 && (
              <motion.div key="pdf-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={SPB} className="absolute -bottom-2 -right-4 md:-right-10 bg-white/85 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-3 w-44 z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">PDF verified</p>
                    <p className="text-[11px] text-gray-900 font-semibold">QR-signed · Food Bank</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center gap-3 shrink-0">
          <div className="w-px h-16 bg-gray-200" />
          <div className="w-8 h-8 rounded-full bg-gray-100 grid place-items-center">
            <Send className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="w-px h-16 bg-gray-200" />
        </div>

        {/* Supervisor phone */}
        <div className="relative flex flex-col items-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Supervisor</p>
          <Phone>
            <AnimatePresence mode="wait">
              {s.supervisorScreen === 'idle' && <SupIdleScreen key="idle" />}
              {s.supervisorScreen === 'sms' && <SupSMSScreen key="sms" />}
              {s.supervisorScreen === 'replied' && <SupRepliedScreen key="replied" />}
              {s.supervisorScreen === 'done' && <SupDoneScreen key="done" />}
            </AnimatePresence>
          </Phone>

          {/* Floating: SMS incoming (step 1) */}
          <AnimatePresence>
            {step === 1 && (
              <motion.div key="sms-notif" initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={SPB} className="absolute -top-4 -right-4 md:-right-10 bg-white/85 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-3 w-52 z-20">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 grid place-items-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Messages · now</p>
                    <p className="text-[11px] text-gray-900 font-semibold leading-snug mt-0.5">
                      Merit: Verify Sarah&apos;s 4h at Vancouver Food Bank? Reply YES
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step description */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: APPLE }} className="text-center mt-12 max-w-md mx-auto">
          <p className="text-xl font-bold text-gray-900 mb-1">{s.label}</p>
          <p className="text-sm text-gray-500">{s.sub}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Phone shell ───────────────────────────────────────────────────────────────
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[230px] h-[480px] rounded-[3rem] shadow-2xl border overflow-hidden bg-gray-900 border-gray-800">
      <div className="absolute inset-[8px] rounded-[2.5rem] overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-2xl z-30 bg-gray-900" />
        <div className="absolute top-2 left-6 right-6 flex items-center justify-between z-20">
          <span className="text-[10px] font-bold text-gray-900">9:41</span>
          <span className="text-[10px] font-bold text-gray-900">100%</span>
        </div>
        <div className="absolute inset-0 pt-10 overflow-hidden">{children}</div>
      </div>
      <div aria-hidden className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}

// ── Student screens ───────────────────────────────────────────────────────────
function SLogScreen() {
  const [typed, setTyped] = useState('');
  const full = 'Sorted food donations';
  useEffect(() => {
    if (typed.length >= full.length) return;
    const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 45);
    return () => clearTimeout(t);
  }, [typed]);

  return (
    <ScreenFade>
      <div className="px-5 pt-2 pb-4 flex flex-col h-full">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Log session</h2>
        <div className="space-y-3 flex-1">
          <InputRow label="Organization">Vancouver Food Bank</InputRow>
          <InputRow label="Activity">
            <span>{typed}</span>
            {typed.length < full.length && <span className="inline-block w-0.5 h-3.5 bg-gray-900 ml-0.5 animate-pulse" />}
          </InputRow>
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Date">Today</InputRow>
            <InputRow label="Hours"><span className="font-bold">4.0</span></InputRow>
          </div>
          <InputRow label="Supervisor phone"><span className="text-gray-400 text-sm">+1 (604) 555-0147</span></InputRow>
        </div>
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPB, delay: 0.9 }} className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Submit for verification
        </motion.button>
      </div>
    </ScreenFade>
  );
}

function SPendingScreen() {
  return (
    <ScreenFade>
      <div className="px-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Sessions</h2>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Sorted food donations</p>
              <p className="text-xs text-gray-500 mt-0.5">Vancouver Food Bank</p>
            </div>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPB, delay: 0.3 }} className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full shrink-0">
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Pending
            </motion.div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Today · 4.0h</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          SMS sent to your supervisor.
          <br />
          Waiting for their reply...
        </motion.p>
      </div>
    </ScreenFade>
  );
}

function SVerifiedScreen() {
  return (
    <ScreenFade>
      <div className="px-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Sessions</h2>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }} className="bg-white border border-green-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Sorted food donations</p>
              <p className="text-xs text-gray-500 mt-0.5">Vancouver Food Bank</p>
            </div>
            <motion.div initial={{ scale: 0, backgroundColor: '#FEF3C7' }} animate={{ scale: [0, 1.2, 1], backgroundColor: '#D1FAE5' }} transition={{ scale: { ...SPB, delay: 0.4 }, backgroundColor: { duration: 0.5, delay: 0.4 } }} className="flex items-center gap-1 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </motion.div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Today · 4.0h</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.6 }} className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-xs text-gray-500">Total verified hours</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-gray-900">28</span>
            <span className="text-lg font-bold text-gray-400">h</span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-xs text-green-600 font-bold ml-1">+4h today</motion.span>
          </div>
        </motion.div>
      </div>
    </ScreenFade>
  );
}

function SExportScreen() {
  return (
    <ScreenFade>
      <div className="px-5 pt-2 pb-4 flex flex-col h-full">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Export PDF</h2>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SP, delay: 0.1 }} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-1 flex flex-col">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Merit Verified Report</p>
          <p className="font-bold text-gray-900 mt-1">Sarah Kim</p>
          <p className="text-xs text-gray-500">28 verified hours · 7 sessions</p>
          <div className="mt-4 space-y-2 flex-1">
            {[
              { org: 'Vancouver Food Bank', hrs: '4h' },
              { org: 'Animal Rescue BC', hrs: '8h' },
              { org: 'Youth Mentorship', hrs: '6h' },
              { org: '+ 4 more sessions', hrs: '10h' },
            ].map((s) => (
              <div key={s.org} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                <span className="flex-1 text-gray-600 truncate">{s.org}</span>
                <span className="font-bold text-gray-900">{s.hrs}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
            <div className="w-8 h-8 bg-white border border-gray-300 rounded-lg grid place-items-center text-[6px] font-mono text-gray-400">QR</div>
            <p className="text-[9px] text-gray-500">
              Anyone can verify by
              <br />
              scanning the QR code
            </p>
          </div>
        </motion.div>
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPB, delay: 0.6 }} className="w-full mt-3 bg-green-600 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          <FileDown className="w-4 h-4" />
          Download PDF
        </motion.button>
      </div>
    </ScreenFade>
  );
}

// ── Supervisor screens ────────────────────────────────────────────────────────
function SupIdleScreen() {
  return (
    <ScreenFade>
      <div className="px-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
        <div className="space-y-3">
          {['Mom', 'Work Team', 'Sarah K.'].map((n, i) => (
            <motion.div key={n} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.1 + i * 0.05 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 grid place-items-center text-sm font-bold text-gray-600 shrink-0">{n[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{n}</p>
                <p className="text-xs text-gray-400 truncate">{i === 0 ? 'Sounds good!' : i === 1 ? 'Meeting moved to 3pm' : 'Thanks!'}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{i === 0 ? '2m' : i === 1 ? '1h' : 'Tue'}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </ScreenFade>
  );
}

function SupSMSScreen() {
  return (
    <ScreenFade>
      <div className="px-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={SPB} className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-500 grid place-items-center shrink-0 shadow-md">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-gray-900">Merit</p>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPB} className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</motion.span>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPB, delay: 0.2 }} className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[200px]">
              <p className="text-sm text-gray-900 leading-snug">
                Verify Sarah Kim&apos;s 4 hours at Vancouver Food Bank? Reply <span className="font-bold">YES</span> to confirm or <span className="font-bold">NO</span> to decline.
              </p>
            </motion.div>
            <p className="text-[10px] text-gray-400 mt-1">Merit · now</p>
          </div>
        </motion.div>
        {['Mom', 'Work Team'].map((n) => (
          <div key={n} className="flex items-center gap-3 mb-3 opacity-50">
            <div className="w-10 h-10 rounded-full bg-gray-200 grid place-items-center text-sm font-bold text-gray-600 shrink-0">{n[0]}</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{n}</p>
              <p className="text-xs text-gray-400">...</p>
            </div>
          </div>
        ))}
      </div>
    </ScreenFade>
  );
}

function SupRepliedScreen() {
  return (
    <ScreenFade>
      <div className="px-5 pt-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-green-500 grid place-items-center shrink-0">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Merit</p>
            <p className="text-[10px] text-gray-400">Verification</p>
          </div>
        </div>
        <div className="flex justify-start mb-3">
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[75%]">
            <p className="text-sm text-gray-900 leading-snug">Verify Sarah Kim&apos;s 4 hours at Vancouver Food Bank? Reply YES to confirm.</p>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPB, delay: 0.4 }} className="flex justify-end mb-3">
          <div className="bg-green-500 rounded-2xl rounded-tr-sm px-4 py-2.5">
            <p className="text-white font-bold text-sm">YES</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPB, delay: 0.9 }} className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[75%]">
            <p className="text-sm text-gray-900 leading-snug">✓ Confirmed. Sarah Kim has been notified.</p>
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-center text-xs text-gray-400 mt-6">
          That&apos;s all they have to do.
        </motion.p>
      </div>
    </ScreenFade>
  );
}

function SupDoneScreen() {
  return (
    <ScreenFade>
      <div className="px-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
        <div className="space-y-3">
          {[
            { n: 'Merit', sub: '✓ Sarah Kim verified · 4h' },
            { n: 'Mom', sub: 'Sounds good!' },
            { n: 'Work Team', sub: 'Meeting moved to 3pm' },
          ].map(({ n, sub }) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full grid place-items-center text-sm font-bold shrink-0 ${n === 'Merit' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{n[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{n}</p>
                <p className={`text-xs truncate ${n === 'Merit' ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenFade>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ScreenFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="h-full">
      {children}
    </motion.div>
  );
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1.5">{label}</p>
      <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 min-h-[2.5rem] flex items-center">{children}</div>
    </div>
  );
}
