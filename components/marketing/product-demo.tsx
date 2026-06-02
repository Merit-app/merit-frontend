'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, Send, FileText,
  ChevronRight, Wifi, Battery, Signal, MessageSquare,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  id: number;
  label: string;
  duration: number;
  leftPhone: React.ReactNode;
  rightPhone: React.ReactNode;
  caption: string;
}

// ─── Phone wrapper ────────────────────────────────────────────────────────────

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="w-[220px] bg-gray-950 rounded-[36px] p-[10px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative">
        <div className="bg-white rounded-[28px] overflow-hidden h-[420px] relative flex flex-col">
          {/* Status bar */}
          <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-gray-900">9:41</span>
            <div className="w-20 h-5 bg-gray-950 rounded-full absolute left-1/2 -translate-x-1/2 top-0" />
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3 text-gray-900" />
              <Wifi className="w-3 h-3 text-gray-900" />
              <Battery className="w-3 h-3 text-gray-900" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
          <div className="flex justify-center pb-2 pt-1 shrink-0">
            <div className="w-24 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
      <div className="absolute left-[-3px] top-20 w-[3px] h-8 bg-gray-700 rounded-l-sm" />
      <div className="absolute left-[-3px] top-32 w-[3px] h-12 bg-gray-700 rounded-l-sm" />
      <div className="absolute left-[-3px] top-48 w-[3px] h-12 bg-gray-700 rounded-l-sm" />
      <div className="absolute right-[-3px] top-28 w-[3px] h-16 bg-gray-700 rounded-r-sm" />
    </div>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function StudentAppHome() {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
        <p className="font-bold text-gray-900">merit.</p>
        <p className="text-[10px] text-gray-400">SERVICE HOURS · 2024–25</p>
      </div>
      <div className="flex-1 px-4 pt-4 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
        >
          <p className="text-[10px] text-gray-400">THIS WEEK</p>
          <p className="text-2xl font-bold text-gray-900">4 hrs</p>
          <p className="text-[9px] text-green-600 font-medium">+4 hrs vs last week</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-600 rounded-xl p-3 text-white"
        >
          <p className="text-[10px] text-blue-200">+ LOG HOURS</p>
          <p className="text-sm font-semibold">Record a session</p>
        </motion.div>
      </div>
    </div>
  );
}

function SupervisorIdle() {
  return (
    <div className="h-full bg-gray-100 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
        <MessageSquare className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-[10px] text-gray-400 text-center px-6">
        Supervisor&apos;s phone — waiting
      </p>
    </div>
  );
}

function LogFormFilling({ progress }: { progress: number }) {
  const fields = [
    { label: 'Organization', value: 'Vancouver Rotary Foundation' },
    { label: 'Date', value: 'May 28, 2026' },
    { label: 'Hours', value: '4 hours' },
    { label: 'Activity', value: 'Food bank sorting & distribution' },
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-2">
        <ChevronRight className="w-3 h-3 text-gray-400 rotate-180" />
        <p className="text-xs font-semibold text-gray-900">Log hours</p>
      </div>
      <div className="flex-1 px-4 pt-3 space-y-2.5 overflow-hidden">
        {fields.map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > i * 0.2 ? 1 : 0.2 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[9px] text-gray-400 font-medium mb-0.5">
              {field.label.toUpperCase()}
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 relative overflow-hidden">
              <p className="text-[10px] text-gray-700">{field.value}</p>
              {progress > i * 0.2 && progress < (i + 1) * 0.2 + 0.1 && (
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-px h-3 bg-blue-500"
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
              )}
            </div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0.7 ? 1 : 0.2 }}
        >
          <p className="text-[9px] text-gray-400 font-medium mb-0.5">SUPERVISOR PHONE</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <p className="text-[10px] text-gray-700">+1 604 555 0142</p>
          </div>
        </motion.div>
      </div>
      <div className="px-4 pb-3">
        <motion.div
          animate={{ backgroundColor: progress > 0.85 ? '#2563EB' : '#D1D5DB' }}
          className="rounded-xl py-2.5 text-center"
        >
          <p className="text-[11px] font-semibold text-white">
            {progress > 0.85 ? 'Send for verification →' : 'Fill all fields'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function StudentWaiting() {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-900">Session logged</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center"
        >
          <Clock className="w-6 h-6 text-amber-500" />
        </motion.div>
        <p className="text-xs font-semibold text-gray-900 text-center">
          Waiting for supervisor
        </p>
        <p className="text-[10px] text-gray-400 text-center">
          John Smith will receive an SMS to verify your 4 hours at Vancouver Rotary Foundation
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 w-full">
          <p className="text-[9px] text-amber-700 font-medium">PENDING VERIFICATION</p>
          <p className="text-[10px] text-amber-800 mt-0.5">Vancouver Rotary · 4h · May 28</p>
        </div>
      </div>
    </div>
  );
}

function SupervisorSMSArriving() {
  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <p className="text-[10px] text-gray-500 font-medium">9:41 AM</p>
        <p className="text-2xl font-semibold text-gray-900">Tuesday</p>
        <p className="text-[10px] text-gray-400">May 28, 2026</p>
      </div>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', damping: 20 }}
        className="mx-3 mb-4"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-900">Merit · Text Message</p>
              <p className="text-[9px] text-gray-400">now</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-700 leading-relaxed">
            <span className="font-medium">Sarah</span> logged 4 volunteer hours at
            Vancouver Rotary on May 28. Reply{' '}
            <span className="font-bold text-green-600">YES</span> to verify.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SupervisorReplying() {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">
          JS
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-900">Merit Verification</p>
          <p className="text-[9px] text-gray-400">+1 778 555 0100</p>
        </div>
      </div>
      <div className="flex-1 px-4 pt-4 space-y-2">
        <div className="max-w-[85%]">
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
            <p className="text-[10px] text-gray-700 leading-relaxed">
              Sarah logged 4 volunteer hours at Vancouver Rotary on May 28. Reply{' '}
              <span className="font-bold text-green-600">YES</span> to verify.
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-end"
        >
          <div className="bg-blue-500 rounded-2xl rounded-tr-sm px-4 py-2">
            <p className="text-[11px] text-white font-semibold">YES</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="max-w-[85%]"
        >
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
            <p className="text-[10px] text-gray-700">
              ✓ Verified! Sarah&apos;s 4 hours at Vancouver Rotary are confirmed. Thank you!
            </p>
          </div>
        </motion.div>
      </div>
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full px-3 py-2">
          <p className="text-[10px] text-gray-400">iMessage</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
          <Send className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}

function SessionVerified() {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-900">All sessions</p>
      </div>
      <div className="flex-1 px-4 pt-3 space-y-2">
        <motion.div
          initial={{ backgroundColor: '#FEF3C7' }}
          animate={{ backgroundColor: '#F0FDF4' }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="rounded-xl p-3 border border-green-200"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold text-gray-900">
              Vancouver Rotary Foundation
            </p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </motion.div>
          </div>
          <p className="text-[9px] text-gray-400">Food bank sorting · May 28</p>
          <div className="flex items-center justify-between mt-1.5">
            <motion.span
              initial={{ color: '#F59E0B' }}
              animate={{ color: '#16A34A' }}
              transition={{ delay: 0.7 }}
              className="text-[9px] font-semibold"
            >
              ✓ Verified
            </motion.span>
            <span className="text-[10px] font-bold text-gray-900">4h</span>
          </div>
        </motion.div>
        {[
          { org: 'BC Youth Council', hrs: '3h', status: 'verified' },
          { org: 'Red Cross', hrs: '6h', status: 'verified' },
          { org: 'Vancouver Lake Crew', hrs: '2h', status: 'pending' },
        ].map((s, i) => (
          <motion.div
            key={s.org}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="rounded-xl p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium text-gray-700">{s.org}</p>
              <span className="text-[10px] font-bold text-gray-900">{s.hrs}</span>
            </div>
            <span
              className={`text-[9px] font-medium ${
                s.status === 'verified' ? 'text-green-600' : 'text-amber-600'
              }`}
            >
              {s.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PDFGenerating() {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-900">Export</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: 1, duration: 1.5, ease: 'linear' }}
          className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center"
        >
          <FileText className="w-5 h-5 text-blue-600" />
        </motion.div>
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-900">Generating PDF</p>
          <p className="text-[10px] text-gray-400 mt-1">
            15 verified hours · 4 organizations
          </p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

function PDFPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="h-full bg-gray-50 flex flex-col p-3"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex-1 flex flex-col">
        <div className="bg-gray-900 px-4 py-3">
          <p className="text-[8px] text-gray-400 tracking-widest">MERIT · VERIFIED RECORD</p>
          <p className="text-sm font-bold text-white mt-0.5">Sarah Kim</p>
          <p className="text-[9px] text-gray-400">
            Burnaby North · Grade 11 · Class of 2027
          </p>
        </div>
        <div className="flex-1 px-3 py-2 space-y-1.5">
          {[
            { org: 'Vancouver Rotary', date: 'May 28', hrs: '4h' },
            { org: 'Red Cross', date: 'May 1', hrs: '6h' },
            { org: 'BC Youth Council', date: 'Apr 15', hrs: '3h' },
            { org: 'Van. Lake Crew', date: 'Apr 2', hrs: '2h' },
          ].map((row) => (
            <div
              key={row.org}
              className="flex items-center text-[9px] py-1 border-b border-gray-100 gap-2"
            >
              <span className="text-green-600 font-bold">✓</span>
              <span className="flex-1 text-gray-700 truncate">{row.org}</span>
              <span className="text-gray-400">{row.date}</span>
              <span className="font-bold text-gray-900">{row.hrs}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1">
            <span className="text-[9px] font-bold text-gray-700">Total verified</span>
            <span className="text-[10px] font-bold text-gray-900">15h</span>
          </div>
          <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100">
            <div className="w-8 h-8 border border-gray-300 rounded grid grid-cols-3 gap-px p-0.5">
              {[1, 1, 0, 1, 0, 1, 0, 1, 1].map((v, i) => (
                <div key={i} className={`rounded-sm ${v ? 'bg-gray-800' : ''}`} />
              ))}
            </div>
            <p className="text-[8px] text-gray-400 leading-tight">
              Scan to verify
              <br />
              meritco.app/verify/...
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SharingPDF() {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-900">Share</p>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-[10px] font-semibold text-gray-700">merit-record-sarah.pdf</p>
            <p className="text-[9px] text-gray-400">287 KB · 1 page</p>
          </div>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          <p className="text-[9px] text-gray-400 font-medium">SHARE TO</p>
          {[
            { icon: '📧', label: 'Email to Ms. Thompson', sub: 'School counsellor' },
            { icon: '📋', label: 'Copy PDF link', sub: 'Shareable URL' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${
                i === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-[10px] font-semibold text-gray-900">{item.label}</p>
                <p className="text-[9px] text-gray-400">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CounsellorEmail() {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-900">Mail</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring' }}
        className="mx-3 mt-4"
      >
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              SK
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-900">Sarah Kim</p>
              <p className="text-[9px] text-gray-400">To: ms.thompson@school.ca</p>
            </div>
          </div>
          <p className="text-[10px] font-semibold text-gray-900 mb-1">
            My verified service hours — Merit PDF
          </p>
          <p className="text-[9px] text-gray-500 leading-relaxed">
            Hi Ms. Thompson, please find my verified volunteer hour record attached.
            All 15 hours are supervisor-verified and include a QR code for independent
            verification.
          </p>
          <div className="mt-3 flex items-center gap-2 bg-red-50 rounded-xl p-2.5 border border-red-100">
            <FileText className="w-4 h-4 text-red-500 shrink-0" />
            <div>
              <p className="text-[9px] font-semibold text-gray-800">
                merit-record-sarah.pdf
              </p>
              <p className="text-[8px] text-gray-400">287 KB · Verified ✓</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main demo component ──────────────────────────────────────────────────────

const STEP_DURATION = 3500;

export function ProductDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const steps: Step[] = [
    {
      id: 0,
      label: 'Open Merit',
      duration: STEP_DURATION,
      leftPhone: <StudentAppHome />,
      rightPhone: <SupervisorIdle />,
      caption: 'Sarah opens Merit to log her volunteer session',
    },
    {
      id: 1,
      label: 'Log hours',
      duration: STEP_DURATION + 500,
      leftPhone: <LogFormFilling progress={progress} />,
      rightPhone: <SupervisorIdle />,
      caption: 'She fills out the session — org, date, hours, activity, supervisor',
    },
    {
      id: 2,
      label: 'SMS sent',
      duration: STEP_DURATION,
      leftPhone: <StudentWaiting />,
      rightPhone: <SupervisorSMSArriving />,
      caption: 'Merit texts her supervisor instantly. No app download needed',
    },
    {
      id: 3,
      label: 'Supervisor confirms',
      duration: STEP_DURATION + 500,
      leftPhone: <StudentWaiting />,
      rightPhone: <SupervisorReplying />,
      caption: 'John replies YES. One tap. Done',
    },
    {
      id: 4,
      label: 'Verified',
      duration: STEP_DURATION,
      leftPhone: <SessionVerified />,
      rightPhone: <SupervisorIdle />,
      caption: "Session flips to Verified instantly on Sarah's phone",
    },
    {
      id: 5,
      label: 'Export PDF',
      duration: STEP_DURATION + 500,
      leftPhone: <PDFGenerating />,
      rightPhone: <PDFPreview />,
      caption: 'One tap generates a signed PDF with QR verification code',
    },
    {
      id: 6,
      label: 'Share record',
      duration: STEP_DURATION,
      leftPhone: <SharingPDF />,
      rightPhone: <CounsellorEmail />,
      caption: 'Sarah emails it directly to her school counsellor',
    },
  ];

  // Auto-advance through steps + tick progress bar
  useEffect(() => {
    if (isPaused) return;
    const stepDuration = steps[currentStep].duration;
    const progressTicker = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.01));
    }, stepDuration / 100);
    const advanceTimer = setTimeout(() => {
      setCurrentStep((s) => (s + 1) % steps.length);
      setProgress(0);
    }, stepDuration);
    return () => {
      clearTimeout(advanceTimer);
      clearInterval(progressTicker);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isPaused]);

  const step = steps[currentStep];

  return (
    <section className="py-24 overflow-hidden bg-gray-950">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            See it in action
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            From zero to verified
            <br />
            <span className="text-gray-400">in under two minutes.</span>
          </h2>
        </div>

        {/* Step pills */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(i);
                setProgress(0);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                currentStep === i
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        {/* Phone mockups */}
        <div
          className="flex items-start justify-center gap-6 md:gap-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left phone — always visible */}
          <div className="relative">
            <div className="text-center mb-4">
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                Student
              </span>
            </div>
            <Phone>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`left-${currentStep}`}
                  className="h-full"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  {step.leftPhone}
                </motion.div>
              </AnimatePresence>
            </Phone>
          </div>

          {/* Center connector — desktop only */}
          <div className="hidden md:flex flex-col items-center justify-center pt-20 gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                className="w-1.5 h-1.5 rounded-full bg-gray-600"
              />
            ))}
          </div>

          {/* Right phone — desktop only */}
          <div className="hidden md:block relative">
            <div className="text-center mb-4">
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                {currentStep >= 5 ? 'PDF record' : 'Supervisor'}
              </span>
            </div>
            <Phone>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`right-${currentStep}`}
                  className="h-full"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  {step.rightPhone}
                </motion.div>
              </AnimatePresence>
            </Phone>
          </div>
        </div>

        {/* Caption + progress + dots */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 text-sm text-center max-w-md px-4"
            >
              {step.caption}
            </motion.p>
          </AnimatePresence>

          <div className="w-64 h-px bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  setProgress(0);
                }}
                aria-label={`Go to step ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  currentStep === i
                    ? 'w-6 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-gray-700 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          <p className="text-[10px] text-gray-600">
            Hover to pause · Click any step to jump
          </p>
        </div>
      </div>
    </section>
  );
}
