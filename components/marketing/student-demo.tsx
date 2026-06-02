'use client';

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate,
  type Transition,
} from 'framer-motion';
import { CheckCircle2, Clock, Send, FileDown, Sparkles, ShieldCheck } from 'lucide-react';

// ── Motion presets ────────────────────────────────────────────────────────────
const SPRING: Transition = { type: 'spring', stiffness: 280, damping: 30 };
const SPRING_BOUNCE: Transition = { type: 'spring', stiffness: 400, damping: 22 };
const EASE_APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    id: 'log',
    label: 'Log your session',
    accent: '#3B82F6',
    description: 'Pick an activity. Add your hours. Done in 20 seconds.',
  },
  {
    id: 'verify',
    label: 'Supervisor verifies',
    accent: '#F59E0B',
    description: "They get an SMS. They reply YES. You're verified.",
  },
  {
    id: 'export',
    label: 'Export your PDF',
    accent: '#10B981',
    description: 'Signed, watermarked, QR-verified. Send it anywhere.',
  },
] as const;

const STEP_DURATION = 4500;

// ── Main demo ─────────────────────────────────────────────────────────────────
export function StudentDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient color wash — shifts with step */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[3rem] blur-3xl opacity-40 pointer-events-none"
        animate={{ backgroundColor: STEPS[step].accent + '20' }}
        transition={{ duration: 1.5, ease: EASE_APPLE }}
      />

      {/* Step indicators with continuous progress */}
      <div className="flex items-center justify-center gap-4 mb-12 max-w-md mx-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setStep(i);
              progress.set(0);
            }}
            className="group relative flex-1 py-2 text-left"
          >
            <p
              className={`text-xs font-semibold mb-2 transition-colors duration-500 ${
                i === step ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              0{i + 1}
            </p>
            <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
              {i < step ? (
                <div className="h-full w-full bg-gray-900" />
              ) : i === step ? (
                <motion.div
                  className="h-full bg-gray-900 origin-left"
                  style={{ scaleX: progress }}
                />
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {/* Stage */}
      <div className="relative flex items-center justify-center gap-8 md:gap-12">
        <PhoneMockup>
          <AnimatePresence mode="wait">
            {step === 0 && <LogScreen key="log" />}
            {step === 1 && <VerifyWaitingScreen key="wait" />}
            {step === 2 && <ExportScreen key="export" />}
          </AnimatePresence>
        </PhoneMockup>

        {/* Floating SMS card — step 1 */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              key="sms-card"
              initial={{ opacity: 0, scale: 0.9, x: -40, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={SPRING_BOUNCE}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20
                bg-white/80 backdrop-blur-xl border border-gray-200
                rounded-2xl shadow-2xl p-4 max-w-[240px]"
            >
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                    SMS to supervisor
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5 leading-snug">
                    Verify Sarah&apos;s 4 hours at the food bank? Reply YES to confirm.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating verification card — step 2 */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              key="verified-card"
              initial={{ opacity: 0, scale: 0.9, x: 40, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING_BOUNCE}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20
                bg-white/80 backdrop-blur-xl border border-gray-200
                rounded-2xl shadow-2xl p-4 gap-3 max-w-[240px]"
            >
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  PDF verified
                </p>
                <p className="text-sm text-gray-900 mt-0.5 font-medium">4 hours · Food Bank</p>
                <p className="text-xs text-gray-500 mt-0.5">QR-signed for institutions</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE_APPLE }}
          className="text-center mt-12 max-w-md mx-auto"
        >
          <p className="text-lg font-semibold text-gray-900 mb-1">{STEPS[step].label}</p>
          <p className="text-sm text-gray-500">{STEPS[step].description}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Phone mockup (light variant) ──────────────────────────────────────────────
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.2 }}
      className="relative"
    >
      <div className="relative w-[280px] h-[580px] rounded-[3rem] bg-gray-900 shadow-2xl border border-gray-800 overflow-hidden">
        <div className="absolute inset-2 rounded-[2.5rem] bg-white overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-30" />
          <div className="absolute top-1.5 left-6 right-6 flex items-center justify-between z-20 text-[10px] font-semibold text-gray-900">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 border border-gray-900 rounded-sm" />
              <span>100%</span>
            </div>
          </div>
          <div className="absolute inset-0 pt-10 px-4 pb-4 overflow-hidden">{children}</div>
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
    </motion.div>
  );
}

// ── Screen 1: Log session ─────────────────────────────────────────────────────
function LogScreen() {
  const [activity, setActivity] = useState('');
  const fullText = 'Sorted donations at food bank';

  useEffect(() => {
    if (activity.length < fullText.length) {
      const t = setTimeout(() => setActivity(fullText.slice(0, activity.length + 1)), 40);
      return () => clearTimeout(t);
    }
  }, [activity]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="text-xl font-bold text-gray-900 mb-4"
      >
        Log session
      </motion.h2>

      <div className="space-y-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.15 }}>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Organization</p>
          <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900">
            Vancouver Food Bank
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Activity</p>
          <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 min-h-[2.5rem] flex items-center">
            {activity}
            <span className="inline-block w-0.5 h-3.5 bg-gray-900 ml-0.5 animate-pulse" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.25 }} className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Date</p>
            <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900">Today</div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Hours</p>
            <div className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900">4.0</div>
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_BOUNCE, delay: 0.6 }}
        className="mt-auto w-full bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Submit for verification
      </motion.button>
    </motion.div>
  );
}

// ── Screen 2: Waiting ─────────────────────────────────────────────────────────
function VerifyWaitingScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="text-xl font-bold text-gray-900 mb-4">
        Sessions
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Sorted donations</p>
            <p className="text-xs text-gray-500">Vancouver Food Bank</p>
          </div>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING_BOUNCE, delay: 0.3 }}
            className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded-full"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-amber-500"
            />
            Pending
          </motion.div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Today · 4.0h</span>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          Waiting for supervisor SMS confirmation.
          <br />
          Usually takes under 2 minutes.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Screen 3: Export ──────────────────────────────────────────────────────────
function ExportScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="text-xl font-bold text-gray-900 mb-4">
        Sessions
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="bg-white border border-green-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Sorted donations</p>
            <p className="text-xs text-gray-500">Vancouver Food Bank</p>
          </div>
          <motion.div
            initial={{ scale: 0.8, backgroundColor: '#FEF3C7' }}
            animate={{ scale: [0.8, 1.1, 1], backgroundColor: '#D1FAE5' }}
            transition={{
              scale: { ...SPRING_BOUNCE, delay: 0.3 },
              backgroundColor: { duration: 0.6, delay: 0.3 },
            }}
            className="flex items-center gap-1 text-green-700 text-[10px] font-semibold px-2 py-1 rounded-full"
          >
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </motion.div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Today · 4.0h</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }} className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
        <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest mb-1">MERIT VERIFIED</p>
        <p className="text-sm font-bold text-gray-900">Service Hours Report</p>
        <p className="text-xs text-gray-500 mb-3">4.0 verified hours · 1 session</p>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <div className="w-8 h-8 bg-white border border-gray-300 rounded grid place-items-center text-[6px] text-gray-400 font-mono">
            QR
          </div>
          <p className="text-[9px] text-gray-500 leading-tight">
            Anyone can verify this report by
            <br />
            scanning the QR code
          </p>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_BOUNCE, delay: 0.7 }}
        className="mt-auto w-full bg-green-600 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        <FileDown className="w-3.5 h-3.5" />
        Download PDF
      </motion.button>
    </motion.div>
  );
}
