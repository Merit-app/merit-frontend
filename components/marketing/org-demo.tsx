'use client';

import { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate,
  type Transition,
} from 'framer-motion';
import { CheckCircle2, Calendar, Send, FileDown, Bell, Sparkles } from 'lucide-react';

const SPRING: Transition = { type: 'spring', stiffness: 280, damping: 30 };
const SPRING_BOUNCE: Transition = { type: 'spring', stiffness: 400, damping: 22 };
const EASE_APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  { id: 'dashboard', label: 'Dashboard overview', description: '3 pending sessions waiting for verification.' },
  { id: 'verify', label: 'One-click verify', description: 'Tap verify. Student sees it instantly.' },
  { id: 'create-event', label: 'Create an event', description: 'Set up a volunteer shift in seconds.' },
  { id: 'notify', label: 'Auto-text volunteers', description: 'Everyone gets an SMS with the details.' },
  { id: 'checkin', label: 'Day-of check-in', description: 'Tap names as volunteers arrive.' },
  { id: 'auto-log', label: 'Hours auto-logged', description: 'Complete event. Hours appear for all attendees.' },
  { id: 'report', label: 'Grant report ready', description: 'Professional PDF in one click.' },
] as const;

const STEP_DURATION = 4000;

export function OrgDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const reducedMotion = useReducedMotion();

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
      className="relative w-full max-w-6xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[3rem] blur-3xl opacity-20 pointer-events-none bg-blue-500"
      />

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1.5 mb-12 max-w-3xl mx-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setStep(i);
              progress.set(0);
            }}
            className="group relative flex-1 py-2 max-w-[80px] text-left"
          >
            <p
              className={`text-[10px] font-semibold mb-2 transition-colors duration-500 ${
                i === step ? 'text-white' : 'text-gray-600'
              }`}
            >
              0{i + 1}
            </p>
            <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
              {i < step ? (
                <div className="h-full w-full bg-white" />
              ) : i === step ? (
                <motion.div className="h-full bg-white origin-left" style={{ scaleX: progress }} />
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {/* Stage */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-12 items-center">
        <LaptopMockup>
          <AnimatePresence mode="wait">
            {step === 0 && <DashboardScreen key="d" />}
            {step === 1 && <VerifyScreen key="v" />}
            {step === 2 && <CreateEventScreen key="c" />}
            {step === 3 && <PublishedEventScreen key="p" />}
            {step === 4 && <CheckinScreen key="ch" />}
            {step === 5 && <CompleteScreen key="co" />}
            {step === 6 && <ReportScreen key="r" />}
          </AnimatePresence>
        </LaptopMockup>

        <div className="flex justify-center">
          <PhoneMockupDark>
            <AnimatePresence mode="wait">
              {(step === 0 || step === 1) && <PhoneSessionScreen key="ps" verified={step === 1} />}
              {step === 2 && <PhoneIdleScreen key="pi" />}
              {step === 3 && <PhoneSMSScreen key="psms" />}
              {step === 4 && <PhoneEventDayScreen key="ped" />}
              {step === 5 && <PhoneHoursScreen key="ph" />}
              {step === 6 && <PhoneCertScreen key="pc" />}
            </AnimatePresence>
          </PhoneMockupDark>
        </div>
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
          <p className="text-lg font-semibold text-white mb-1">{STEPS[step].label}</p>
          <p className="text-sm text-gray-400">{STEPS[step].description}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Laptop mockup ─────────────────────────────────────────────────────────────
function LaptopMockup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.2 }}
      className="relative"
    >
      <div className="relative aspect-[16/10] rounded-t-xl bg-gradient-to-b from-gray-700 to-gray-900 p-2 shadow-2xl">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-600" />
        <div className="w-full h-full rounded-md bg-[#0A0A0A] overflow-hidden relative border border-gray-800">
          {children}
        </div>
      </div>
      <div className="h-2 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-2xl mx-[-1.5%]" />
      <div className="h-1 bg-gray-700 rounded-b-3xl mx-[-3%]" />
    </motion.div>
  );
}

// ── Phone mockup (dark frame, light screen) ───────────────────────────────────
function PhoneMockupDark({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.3 }}
      className="relative w-[240px] h-[500px] rounded-[2.5rem] bg-gray-900 shadow-2xl border border-gray-800 overflow-hidden"
    >
      <div className="absolute inset-2 rounded-[2rem] bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-30" />
        <div className="absolute top-1 left-5 right-5 flex items-center justify-between z-20 text-[9px] font-semibold text-gray-900">
          <span>9:41</span>
          <span>100%</span>
        </div>
        <div className="absolute inset-0 pt-8 px-3 pb-3 overflow-hidden">{children}</div>
      </div>
    </motion.div>
  );
}

// ── Laptop screen wrap ────────────────────────────────────────────────────────
function ScreenWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col text-white text-xs"
    >
      <div className="flex items-center justify-between p-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center font-bold text-[8px]">
            VR
          </div>
          <span className="font-semibold text-[10px]">Vancouver Rotary Foundation</span>
        </div>
        <div className="text-[9px] text-gray-500">Org Dashboard</div>
      </div>
      {children}
    </motion.div>
  );
}

// ── Laptop screens ────────────────────────────────────────────────────────────
function DashboardScreen() {
  return (
    <ScreenWrap>
      <div className="p-3 flex-1 overflow-hidden">
        <p className="text-[10px] text-gray-500 mb-2">OVERVIEW</p>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { v: '47', l: 'Volunteers' },
            { v: '312h', l: 'Verified hrs' },
            { v: '89', l: 'Sessions' },
            { v: '3', l: 'Pending', highlight: true },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.1 + i * 0.05 }}
              className={`rounded p-1.5 ${
                s.highlight ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-white/5'
              }`}
            >
              <p className="font-bold text-[11px]">{s.v}</p>
              <p className="text-[8px] text-gray-500">{s.l}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-[10px] text-gray-500 mb-2">PENDING SESSIONS</p>
        <div className="space-y-1">
          {['Sarah Kim', 'Jordan Lee', 'Alex Park'].map((n, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-2 bg-white/5 rounded p-1.5"
            >
              <div className="w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[8px] font-bold">
                {n[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium truncate">{n}</p>
                <p className="text-[8px] text-gray-500">Food bank · 4h</p>
              </div>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">
                Verify
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}

function VerifyScreen() {
  return (
    <ScreenWrap>
      <div className="p-3 flex-1 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING_BOUNCE}
            className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3"
          >
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </motion.div>
          <p className="font-bold text-sm">Session verified</p>
          <p className="text-[10px] text-gray-500 mt-1">Sarah Kim · 4 hours · Food bank</p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-[9px] text-gray-600 mt-3">
            Sarah has been notified.
          </motion.p>
        </div>
      </div>
    </ScreenWrap>
  );
}

function CreateEventScreen() {
  return (
    <ScreenWrap>
      <div className="p-3 flex-1">
        <p className="text-[11px] font-semibold mb-3">Create event</p>
        <div className="space-y-2">
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }} className="bg-white/5 rounded p-2">
            <p className="text-[8px] text-gray-500">TITLE</p>
            <p className="text-[10px] font-medium">Saturday Food Bank</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }} className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded p-2">
              <p className="text-[8px] text-gray-500">WHEN</p>
              <p className="text-[10px] font-medium">Sat 9–12pm</p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="text-[8px] text-gray-500">SPOTS</p>
              <p className="text-[10px] font-medium">15</p>
            </div>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_BOUNCE, delay: 0.4 }}
            className="w-full bg-white text-black font-semibold py-2 rounded text-[10px] flex items-center justify-center gap-1 mt-2"
          >
            <Send className="w-3 h-3" />
            Publish + notify volunteers
          </motion.button>
        </div>
      </div>
    </ScreenWrap>
  );
}

function PublishedEventScreen() {
  return (
    <ScreenWrap>
      <div className="p-3 flex-1 flex items-center justify-center">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_BOUNCE} className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-8 h-8 text-blue-400" />
          </motion.div>
          <p className="font-bold text-sm">Event published</p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[10px] text-gray-500 mt-1">
            SMS sent to 47 volunteers
          </motion.p>
        </div>
      </div>
    </ScreenWrap>
  );
}

function CheckinScreen() {
  const checkedIn = [true, true, false, true, false];
  return (
    <ScreenWrap>
      <div className="p-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold">Day-of check-in</p>
          <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">LIVE</span>
        </div>
        <div className="space-y-1">
          {['Sarah Kim', 'Jordan Lee', 'Alex Park', 'Maya Chen', 'Tomas R.'].map((n, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.1 + i * 0.04 }}
              className="flex items-center gap-2 bg-white/5 rounded p-1.5"
            >
              <div className="w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[8px] font-bold">{n[0]}</div>
              <p className="text-[10px] flex-1">{n}</p>
              {checkedIn[i] ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...SPRING_BOUNCE, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-1 text-[8px] text-green-400 font-bold"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Here
                </motion.span>
              ) : (
                <span className="text-[8px] text-gray-600">Pending</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}

function CompleteScreen() {
  return (
    <ScreenWrap>
      <div className="p-3 flex-1 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={SPRING_BOUNCE}
            className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3"
          >
            <Sparkles className="w-8 h-8 text-green-400" />
          </motion.div>
          <p className="font-bold text-sm">Event complete</p>
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2">
            <p className="text-[10px] text-gray-500">8 sessions auto-logged</p>
            <p className="text-[9px] text-gray-600 mt-1">24 hours added to volunteer profiles</p>
          </motion.div>
        </div>
      </div>
    </ScreenWrap>
  );
}

function ReportScreen() {
  return (
    <ScreenWrap>
      <div className="p-3 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          className="bg-white text-gray-900 rounded-lg p-3 w-44 shadow-2xl"
        >
          <p className="text-[6px] text-gray-500 tracking-widest font-bold">MERIT IMPACT REPORT</p>
          <p className="text-[10px] font-bold mt-0.5">Vancouver Rotary Foundation</p>
          <p className="text-[8px] text-gray-500">Jan – May 2026</p>
          <div className="grid grid-cols-3 gap-1 mt-2">
            {[
              { v: '47', l: 'Volunteers' },
              { v: '312h', l: 'Hours' },
              { v: '89', l: 'Sessions' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="font-bold text-[11px]">{s.v}</p>
                <p className="text-[6px] text-gray-500">{s.l}</p>
              </div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-green-500 text-white text-[8px] font-bold py-1 rounded text-center mt-2">
            ↓ Download PDF
          </motion.div>
        </motion.div>
      </div>
    </ScreenWrap>
  );
}

// ── Phone screens ─────────────────────────────────────────────────────────────
function PhoneSessionScreen({ verified }: { verified: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
      <p className="text-sm font-bold text-gray-900 mb-3">My sessions</p>
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <p className="font-semibold text-gray-900 text-[11px]">Food bank sorting</p>
            <p className="text-[9px] text-gray-500">VR Foundation</p>
          </div>
          <motion.div
            animate={{
              backgroundColor: verified ? '#D1FAE5' : '#FEF3C7',
              color: verified ? '#047857' : '#92400E',
              scale: verified ? [1, 1.15, 1] : 1,
            }}
            transition={{
              backgroundColor: { duration: 0.5 },
              scale: { ...SPRING_BOUNCE, delay: 0.1 },
            }}
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
          >
            {verified ? (
              <>
                <CheckCircle2 className="w-2.5 h-2.5" />
                Verified
              </>
            ) : (
              'Pending'
            )}
          </motion.div>
        </div>
        <p className="text-[9px] text-gray-500 border-t border-gray-100 pt-2 mt-2">Today · 4.0h</p>
      </div>
    </motion.div>
  );
}

function PhoneIdleScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
      <p className="text-sm font-bold text-gray-900 mb-3">Discover</p>
      <div className="space-y-2">
        {['Food Bank', 'Animal Rescue', 'Youth Mentorship'].map((o) => (
          <div key={o} className="bg-gray-100 rounded-lg p-2">
            <p className="text-[10px] font-medium text-gray-900">{o}</p>
            <p className="text-[8px] text-gray-500">Volunteer opportunities</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PhoneSMSScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING_BOUNCE}
        className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-3 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-green-500 grid place-items-center">
            <Bell className="w-3 h-3 text-white" />
          </div>
          <span className="text-[9px] font-bold text-gray-900">MERIT</span>
          <span className="text-[8px] text-gray-500 ml-auto">now</span>
        </div>
        <p className="text-[10px] text-gray-900 leading-snug">
          New volunteer shift: Saturday Food Bank 9am–12pm. Reply YES to sign up.
        </p>
      </motion.div>
    </motion.div>
  );
}

function PhoneEventDayScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
      <p className="text-sm font-bold text-gray-900 mb-3">Today</p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <Calendar className="w-4 h-4 text-blue-600 mb-1.5" />
        <p className="text-[11px] font-bold text-gray-900">Food Bank Shift</p>
        <p className="text-[9px] text-gray-600 mt-0.5">9:00 AM · Started</p>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1 mt-2 text-[8px] text-green-600 font-bold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          You&apos;re checked in
        </motion.div>
      </div>
    </motion.div>
  );
}

function PhoneHoursScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
      <p className="text-sm font-bold text-gray-900 mb-3">Total hours</p>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={SPRING}
        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white"
      >
        <p className="text-[10px] opacity-80">VERIFIED</p>
        <p className="text-3xl font-bold mt-1">28h</p>
        <p className="text-[9px] opacity-80 mt-1">+3h from Food Bank shift</p>
      </motion.div>
    </motion.div>
  );
}

function PhoneCertScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
      <p className="text-sm font-bold text-gray-900 mb-3">Recognition</p>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3">
        <p className="text-[7px] text-center tracking-widest text-amber-700 font-bold">
          CERTIFICATE OF RECOGNITION
        </p>
        <p className="text-center font-bold text-gray-900 text-[11px] mt-1">Sarah Kim</p>
        <p className="text-center text-[8px] text-gray-500 mt-0.5">28h · VR Foundation</p>
        <FileDown className="w-3 h-3 text-amber-600 mx-auto mt-2" />
      </div>
    </motion.div>
  );
}
