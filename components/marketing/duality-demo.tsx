'use client';

import { useState, useEffect, useId } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate,
  type Transition,
} from 'framer-motion';
import {
  CheckCircle2, Clock, Send, FileDown, Users, Sparkles, ArrowRight, BarChart3,
} from 'lucide-react';

// ── Physics presets ───────────────────────────────────────────────────────────
const SPRING: Transition = { type: 'spring', stiffness: 280, damping: 30 };
const SPRING_BOUNCE: Transition = { type: 'spring', stiffness: 400, damping: 22 };
const APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEP_DURATION = 4500;

type PulseDir = 'left-to-right' | 'right-to-left' | 'both';

const STEPS: {
  id: string;
  label: string;
  description: string;
  pulseDirection: PulseDir;
  pulseLabel: string;
}[] = [
  {
    id: 'submit',
    label: 'Student submits hours',
    description: 'Student logs "Food bank · 4h". It shows up instantly in the org dashboard as pending.',
    pulseDirection: 'left-to-right',
    pulseLabel: 'Session submitted',
  },
  {
    id: 'verify',
    label: 'Org verifies in one tap',
    description: "Coordinator taps Verify. A pulse travels back to the student's phone. Badge flips green instantly.",
    pulseDirection: 'right-to-left',
    pulseLabel: 'Verified ✓',
  },
  {
    id: 'impact',
    label: 'Stats update for both',
    description: "Student's verified hours tick up. Org's volunteer count and total hours rise simultaneously.",
    pulseDirection: 'both',
    pulseLabel: 'Live sync',
  },
  {
    id: 'report',
    label: 'Org reports. Student gets credit.',
    description: 'Org generates a professional grant impact PDF. Student receives their signed verification certificate.',
    pulseDirection: 'both',
    pulseLabel: 'Data synced',
  },
];

export function DualityDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const progress = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const svgId = useId();

  useEffect(() => {
    if (paused || reducedMotion) return;
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: STEP_DURATION / 1000,
      ease: 'linear',
      onComplete: () => setStep((s) => (s + 1) % STEPS.length),
    });
    return () => controls.stop();
  }, [step, paused, reducedMotion, progress]);

  // Trigger the connection pulse shortly after each step change
  useEffect(() => {
    setPulsing(false);
    const t = setTimeout(() => setPulsing(true), 600);
    return () => clearTimeout(t);
  }, [step]);

  const currentStep = STEPS[step];

  return (
    <div
      className="relative w-full max-w-6xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          How it works together
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          One action.
          <br />
          <span className="text-gray-500">Two perspectives.</span>
        </h2>
        <p className="text-gray-400 mt-4 max-w-lg mx-auto">
          Every session logged by a student appears instantly in the organization&apos;s dashboard.
          Every verification updates the student&apos;s record in real time.
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-start justify-center gap-1 mb-12 max-w-2xl mx-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setStep(i);
              progress.set(0);
            }}
            className="group flex-1 py-2 text-left"
          >
            <p
              className={`text-[10px] font-semibold mb-1.5 transition-colors duration-300 truncate ${
                i === step ? 'text-white' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {s.label}
            </p>
            <div className="h-px bg-white/10 overflow-hidden rounded-full">
              {i < step ? (
                <div className="h-full w-full bg-white/40" />
              ) : i === step ? (
                <motion.div className="h-full bg-white origin-left" style={{ scaleX: progress }} />
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {/* Stage */}
      <div className="relative grid grid-cols-[1fr,auto,1fr] items-center gap-4 md:gap-8">
        {/* Student phone */}
        <div className="flex justify-end">
          <div className="relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</span>
            </div>
            <StudentPhone step={step} />
          </div>
        </div>

        {/* Connection line */}
        <div className="relative flex flex-col items-center justify-center w-16 md:w-24 self-stretch">
          <ConnectionLine direction={currentStep.pulseDirection} pulsing={pulsing} label={currentStep.pulseLabel} svgId={svgId} />
        </div>

        {/* Org laptop */}
        <div className="flex justify-start">
          <div className="relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</span>
            </div>
            <OrgDashboard step={step} />
          </div>
        </div>
      </div>

      {/* Step description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: APPLE }}
          className="text-center mt-12 max-w-md mx-auto"
        >
          <p className="text-lg font-semibold text-white mb-1">{currentStep.label}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{currentStep.description}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Connection line ───────────────────────────────────────────────────────────
function ConnectionLine({
  direction,
  pulsing,
  label,
  svgId,
}: {
  direction: PulseDir;
  pulsing: boolean;
  label: string;
  svgId: string;
}) {
  const gradId = `grad-${svgId}`.replace(/:/g, '');

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 w-full">
      <svg width="24" height="120" viewBox="0 0 24 120" className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.05" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <line x1="12" y1="0" x2="12" y2="120" stroke={`url(#${gradId})`} strokeWidth="1" />

        {/* Downward pulse: student → org */}
        {pulsing && (direction === 'left-to-right' || direction === 'both') && (
          <motion.circle
            cx="12"
            r="4"
            fill="white"
            initial={{ cy: 0, opacity: 0 }}
            animate={{ cy: 120, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 0.8,
              ease: APPLE,
              delay: 0.2,
              opacity: { times: [0, 0.1, 0.8, 1], duration: 0.8 },
            }}
          />
        )}

        {/* Upward pulse: org → student */}
        {pulsing && (direction === 'right-to-left' || direction === 'both') && (
          <motion.circle
            cx="12"
            r="4"
            fill="#10B981"
            initial={{ cy: 120, opacity: 0 }}
            animate={{ cy: 0, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 0.8,
              ease: APPLE,
              delay: direction === 'both' ? 0.5 : 0.2,
              opacity: { times: [0, 0.1, 0.8, 1], duration: 0.8 },
            }}
          />
        )}
      </svg>

      <AnimatePresence mode="wait">
        <motion.span
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={SPRING}
          className="text-[9px] font-bold text-white/60 uppercase tracking-wider text-center leading-tight px-2"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ── Student phone ─────────────────────────────────────────────────────────────
function StudentPhone({ step }: { step: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="relative">
      <div className="relative w-[220px] md:w-[260px] h-[460px] md:h-[520px] rounded-[3rem] bg-gray-900 shadow-2xl border border-gray-800 overflow-hidden">
        <div className="absolute inset-2 rounded-[2.5rem] bg-white overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-30" />
          <div className="absolute top-2 left-6 right-6 flex items-center justify-between z-20">
            <span className="text-[10px] font-semibold text-gray-900">9:41</span>
            <span className="text-[10px] font-semibold text-gray-900">100%</span>
          </div>
          <div className="absolute inset-0 pt-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 0 && <StudentLogScreen key="log" />}
              {step === 1 && <StudentPendingScreen key="pending" />}
              {step === 2 && <StudentVerifiedScreen key="verified" />}
              {step === 3 && <StudentPDFScreen key="pdf" />}
            </AnimatePresence>
          </div>
        </div>
        <div aria-hidden className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Floating: submitted (step 0) */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            key="submit-notif"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={SPRING_BOUNCE}
            className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-3 w-44"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Send className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Submitted</p>
                <p className="text-[11px] text-gray-900 font-medium">Awaiting verification</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating: verified (step 1) */}
      <AnimatePresence>
        {step === 1 && (
          <motion.div
            key="verified-notif"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ ...SPRING_BOUNCE, delay: 0.8 }}
            className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-xl border border-green-200 rounded-2xl shadow-xl p-3 w-44"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ ...SPRING_BOUNCE, delay: 0.8 }}
                className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              </motion.div>
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Verified ✓</p>
                <p className="text-[11px] text-gray-900 font-medium">4 hours confirmed</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Student screens ───────────────────────────────────────────────────────────
function StudentLogScreen() {
  const [typed, setTyped] = useState('');
  const full = 'Sorted food bank donations';

  useEffect(() => {
    if (typed.length >= full.length) return;
    const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 38);
    return () => clearTimeout(t);
  }, [typed]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col px-5 pt-2 pb-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Log session</h2>
      <div className="space-y-3 flex-1">
        <Field label="Organization">
          <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900">Vancouver Food Bank</div>
        </Field>
        <Field label="Activity">
          <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 min-h-[2.5rem] flex items-center">
            {typed}
            {typed.length < full.length && <span className="inline-block w-0.5 h-3.5 bg-gray-900 ml-0.5 animate-pulse" />}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Date">
            <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900">Today</div>
          </Field>
          <Field label="Hours">
            <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900">4.0</div>
          </Field>
        </div>
        <Field label="Supervisor phone">
          <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-500">+1 (604) 555-0147</div>
        </Field>
      </div>
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_BOUNCE, delay: 0.8 }}
        className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Submit for verification
      </motion.button>
    </motion.div>
  );
}

function StudentPendingScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col px-5 pt-2">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Sessions</h2>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Sorted food bank donations</p>
            <p className="text-xs text-gray-500">Vancouver Food Bank</p>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING_BOUNCE, delay: 0.3 }}
            className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
          >
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </motion.div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>Today · 4.0h</span>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
        SMS sent to supervisor.
        <br />
        Waiting for their confirmation...
      </motion.p>
    </motion.div>
  );
}

function StudentVerifiedScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col px-5 pt-2">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Sessions</h2>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="bg-white border border-green-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Sorted food bank donations</p>
            <p className="text-xs text-gray-500">Vancouver Food Bank</p>
          </div>
          <motion.div
            initial={{ scale: 0, backgroundColor: '#FEF3C7' }}
            animate={{ scale: [0, 1.2, 1], backgroundColor: '#D1FAE5' }}
            transition={{ scale: { ...SPRING_BOUNCE, delay: 0.4 }, backgroundColor: { duration: 0.5, delay: 0.4 } }}
            className="flex items-center gap-1 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
          >
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </motion.div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>Today · 4.0h</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }} className="mt-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
        <p className="text-xs text-gray-500 mb-1">Total verified hours</p>
        <div className="flex items-baseline gap-1">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-3xl font-bold text-gray-900">28</motion.span>
          <span className="text-lg font-bold text-gray-400">h</span>
          <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="text-xs text-green-600 font-semibold ml-1">+4h</motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StudentPDFScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col px-5 pt-2 pb-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Export</h2>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING, delay: 0.1 }} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-1 flex flex-col">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Merit Verified Report</p>
        <p className="font-bold text-gray-900 text-sm">Sarah Kim</p>
        <p className="text-xs text-gray-500 mt-0.5 mb-4">28 verified hours · 7 sessions</p>
        <div className="space-y-1.5 flex-1">
          {[
            { org: 'Vancouver Food Bank', hrs: '4h' },
            { org: 'Animal Rescue BC', hrs: '8h' },
            { org: 'Youth Mentorship', hrs: '6h' },
          ].map((s) => (
            <div key={s.org} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              <span className="flex-1 text-gray-600 truncate">{s.org}</span>
              <span className="font-bold text-gray-900">{s.hrs}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <div className="w-8 h-8 bg-white border border-gray-300 rounded-lg grid place-items-center text-[6px] font-mono text-gray-400">QR</div>
          <p className="text-[9px] text-gray-500">
            Verify authenticity by
            <br />
            scanning the QR code
          </p>
        </div>
      </motion.div>
      <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_BOUNCE, delay: 0.6 }} className="w-full mt-3 bg-green-600 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
        <FileDown className="w-4 h-4" />
        Download PDF
      </motion.button>
    </motion.div>
  );
}

// ── Org laptop ────────────────────────────────────────────────────────────────
function OrgDashboard({ step }: { step: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.15 }} className="relative">
      <div className="relative">
        <div className="relative w-[320px] md:w-[400px] aspect-[16/10] rounded-xl bg-gradient-to-b from-gray-700 to-gray-900 p-[7px] shadow-2xl">
          <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-600" />
          <div className="w-full h-full rounded-lg bg-[#0A0A0A] overflow-hidden border border-gray-800">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-white/10 grid place-items-center text-[8px] font-bold text-white">VR</div>
                <span className="text-white text-[10px] font-semibold">Vancouver Rotary Foundation</span>
              </div>
              <span className="text-gray-500 text-[8px]">Org Dashboard</span>
            </div>
            <div className="p-3 overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 0 && <OrgNewSessionScreen key="new" />}
                {step === 1 && <OrgVerifyScreen key="verify" />}
                {step === 2 && <OrgStatsScreen key="stats" />}
                {step === 3 && <OrgReportScreen key="report" />}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="h-2.5 bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-xl mx-[-2%]" />
        <div className="h-1 bg-gray-600 rounded-b-2xl mx-[-4%] opacity-70" />
      </div>

      {/* Floating: new session ping (step 0) */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            key="ping"
            initial={{ opacity: 0, scale: 0.7, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={SPRING_BOUNCE}
            className="absolute -top-4 -right-4 bg-blue-500/10 border border-blue-500/30 backdrop-blur-xl rounded-2xl p-3 shadow-xl w-48"
          >
            <div className="flex items-center gap-2">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: 3 }} className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <p className="text-blue-300 text-[11px] font-semibold">New pending session</p>
            </div>
            <p className="text-gray-400 text-[10px] mt-1">Sarah Kim · Food bank · 4h</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating: verified confirm (step 1) */}
      <AnimatePresence>
        {step === 1 && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ ...SPRING_BOUNCE, delay: 0.6 }}
            className="absolute -bottom-4 -right-4 bg-green-500/10 border border-green-500/30 backdrop-blur-xl rounded-2xl p-3 shadow-xl w-44"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 text-[11px] font-bold">Verified</p>
                <p className="text-gray-500 text-[9px]">Sarah notified via app</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Org screens ───────────────────────────────────────────────────────────────
function OrgNewSessionScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Pending sessions</p>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_BOUNCE} className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">3 pending</motion.span>
      </div>
      <div className="space-y-1.5">
        {[
          { name: 'Sarah Kim', act: 'Food bank sorting', hrs: '4h', isNew: true },
          { name: 'Jordan Lee', act: 'Youth mentorship', hrs: '3h', isNew: false },
          { name: 'Alex Park', act: 'Animal rescue', hrs: '2.5h', isNew: false },
        ].map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.1 + i * 0.06 }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${s.isNew ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'}`}
          >
            {s.isNew && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.2, repeat: 2 }} className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
            <div className="w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[8px] font-bold text-white shrink-0">{s.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-medium truncate">{s.name}</p>
              <p className="text-gray-500 text-[9px] truncate">{s.act}</p>
            </div>
            <span className="text-white font-bold text-[11px] shrink-0">{s.hrs}</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold shrink-0">Verify</span>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {[
          { v: '47', l: 'Volunteers', color: 'text-blue-400' },
          { v: '312h', l: 'Verified hrs', color: 'text-green-400' },
          { v: '89', l: 'Sessions', color: 'text-gray-400' },
        ].map((s) => (
          <div key={s.l} className="bg-white/5 rounded-lg p-2 text-center">
            <p className={`font-bold text-sm ${s.color}`}>{s.v}</p>
            <p className="text-gray-600 text-[8px]">{s.l}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OrgVerifyScreen() {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVerified(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white">
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">Pending sessions</p>
      <div className={`rounded-xl border p-3 mb-2 transition-all duration-500 ${verified ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[9px] font-bold text-white">S</div>
          <div className="flex-1">
            <p className="text-white text-[11px] font-semibold">Sarah Kim</p>
            <p className="text-gray-500 text-[9px]">Sorted food bank donations · 4h</p>
          </div>
          {!verified ? (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setVerified(true)} className="text-[9px] px-2.5 py-1 rounded-lg bg-green-500 text-white font-bold">
              ✓ Verify
            </motion.button>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_BOUNCE} className="text-[9px] px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </motion.div>
          )}
        </div>
        {verified && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ ...SPRING, delay: 0.2 }} className="text-[9px] text-green-400 font-medium border-t border-green-500/20 pt-2">
            ✓ Sarah Kim notified — session added to her record
          </motion.p>
        )}
      </div>
      {[
        { name: 'Jordan Lee', act: 'Youth mentorship', hrs: '3h' },
        { name: 'Alex Park', act: 'Animal rescue', hrs: '2.5h' },
      ].map((s) => (
        <div key={s.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[8px] font-bold text-white">{s.name[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[10px] font-medium">{s.name}</p>
            <p className="text-gray-500 text-[8px]">{s.act}</p>
          </div>
          <span className="text-white font-bold text-[10px]">{s.hrs}</span>
          <span className="text-[8px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">Verify</span>
        </div>
      ))}
    </motion.div>
  );
}

function OrgStatsScreen() {
  const [count, setCount] = useState(312);
  const [volunteers, setVolunteers] = useState(47);

  useEffect(() => {
    const t1 = setTimeout(() => setCount(316), 800);
    const t2 = setTimeout(() => setVolunteers(48), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white">
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">Impact overview</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { value: volunteers.toString(), label: 'Volunteers', icon: Users, color: 'text-blue-400', updated: volunteers === 48 },
          { value: `${count}h`, label: 'Verified hrs', icon: Clock, color: 'text-green-400', updated: count === 316 },
          { value: '90', label: 'Sessions', icon: CheckCircle2, color: 'text-gray-400', updated: false },
        ].map((s) => (
          <motion.div
            key={s.label}
            animate={s.updated ? { backgroundColor: ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)'] } : {}}
            transition={{ duration: 1.5 }}
            className="bg-white/5 rounded-xl p-2.5 text-center"
          >
            <s.icon className={`w-3.5 h-3.5 ${s.color} mx-auto mb-1`} />
            <motion.p key={s.value} initial={{ scale: s.updated ? 1.2 : 1 }} animate={{ scale: 1 }} transition={SPRING} className="font-bold text-sm text-white">
              {s.value}
            </motion.p>
            <p className="text-gray-600 text-[8px]">{s.label}</p>
            {s.updated && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[8px] text-green-400 font-bold mt-0.5">+1 ↑</motion.p>}
          </motion.div>
        ))}
      </div>
      <div className="bg-white/5 rounded-xl p-2.5">
        <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-2">By program</p>
        {[
          { name: 'Food Bank', pct: 42, hrs: '132h' },
          { name: 'Youth Mentorship', pct: 31, hrs: '97h' },
          { name: 'Animal Rescue', pct: 27, hrs: '83h' },
        ].map((p) => (
          <div key={p.name} className="mb-2 last:mb-0">
            <div className="flex justify-between text-[9px] mb-1">
              <span className="text-gray-400">{p.name}</span>
              <span className="text-white font-bold">{p.hrs}</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ ...SPRING, delay: 0.3 }} className="h-full bg-white/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OrgReportScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white flex flex-col h-full">
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">Reports</p>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING, delay: 0.1 }} className="bg-white rounded-xl p-3 shadow-lg mb-3">
        <p className="text-[7px] text-gray-400 tracking-widest font-bold">MERIT · VOLUNTEER IMPACT REPORT</p>
        <p className="text-[11px] font-bold text-gray-900 mt-0.5">Vancouver Rotary Foundation</p>
        <p className="text-[9px] text-gray-500">January – May 2026</p>
        <div className="grid grid-cols-3 gap-2 mt-2 mb-3">
          {[
            { v: '48', l: 'Volunteers' },
            { v: '316h', l: 'Total hours' },
            { v: '90', l: 'Sessions' },
          ].map((s) => (
            <div key={s.l} className="text-center bg-gray-50 rounded-lg py-1.5">
              <p className="font-bold text-gray-900 text-sm">{s.v}</p>
              <p className="text-gray-400 text-[7px]">{s.l}</p>
            </div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full bg-gray-900 text-white text-[9px] font-bold py-2 rounded-lg text-center flex items-center justify-center gap-1">
          <FileDown className="w-3 h-3" />
          Download Grant Report PDF
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 grid place-items-center shrink-0">
          <BarChart3 className="w-3 h-3 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-white">Volunteer certificates</p>
          <p className="text-[8px] text-gray-500">48 ready to generate</p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
      </motion.div>
    </motion.div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  );
}
