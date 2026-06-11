'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Calendar, MessageSquare, FileText, Award, Users,
  ChevronRight, Shield, Zap,
} from 'lucide-react';
import { orgOnboardingApi } from '@/lib/api';

// ── Slide definitions ─────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'welcome',
    Icon: Shield,
    iconBg: 'bg-card/10',
    iconColor: 'text-foreground',
    subtitle: 'Your complete volunteer management platform',
    title: 'Welcome to Merit for Organizations',
    description:
      "Everything you need to run your volunteer program — from verifying hours to generating grant reports. Let's show you around.",
    visual: (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { label: 'Verify sessions', Icon: CheckCircle2, color: 'text-success' },
          { label: 'Run events', Icon: Calendar, color: 'text-primary' },
          { label: 'Send messages', Icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Grant reports', Icon: FileText, color: 'text-warning' },
          { label: 'Certificates', Icon: Award, color: 'text-pink-400' },
          { label: 'Manage team', Icon: Users, color: 'text-cyan-400' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card/5 rounded-xl p-3 flex flex-col items-center gap-2 text-center"
          >
            <item.Icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-[10px] text-muted-foreground font-medium leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'verify',
    Icon: CheckCircle2,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-success',
    subtitle: 'One click. Done.',
    title: 'Verify volunteer sessions',
    description:
      'Students log their own hours. You see every session in your dashboard and verify or dispute with one click. No paperwork. No spreadsheets.',
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { name: 'Sarah Kim', activity: 'Food bank sorting', hrs: '4h', pending: true },
          { name: 'Jordan Lee', activity: 'Youth mentorship', hrs: '3h', pending: false },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-3 bg-card/5 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
              {s.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium">{s.name}</p>
              <p className="text-muted-foreground text-xs truncate">{s.activity}</p>
            </div>
            <span className="text-foreground text-sm font-bold shrink-0">{s.hrs}</span>
            {s.pending ? (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-green-500/20 text-success font-medium shrink-0">
                Verify ✓
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-success font-medium shrink-0">
                Verified ✓
              </span>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'events',
    Icon: Calendar,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-primary',
    subtitle: 'Replace your sign-up spreadsheet.',
    title: 'Create events and shifts',
    description:
      'Create a volunteer shift in 30 seconds. Set a max capacity, publish it, and Merit texts all your volunteers automatically. Check in arrivals on the day. Hours auto-log for everyone.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">Saturday Food Bank</p>
            <p className="text-muted-foreground text-xs">June 7 · 9am–12pm · 15 spots</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-success font-medium shrink-0">
            Published
          </span>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">SIGNED UP (12/15)</p>
          <div className="flex -space-x-2">
            {['SK', 'JL', 'PM', 'AR', 'TN'].map((init, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-border flex items-center justify-center text-[10px] font-bold text-foreground"
              >
                {init}
              </div>
            ))}
            <div className="w-7 h-7 rounded-full bg-card/10 border-2 border-border flex items-center justify-center text-[10px] text-muted-foreground">
              +7
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 text-primary text-xs rounded-lg px-3 py-2 font-medium flex items-center gap-2">
          <Zap className="w-3 h-3 shrink-0" />
          Hours auto-logged when you mark complete
        </div>
      </div>
    ),
  },
  {
    id: 'messages',
    Icon: MessageSquare,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    subtitle: 'Reach all your volunteers instantly.',
    title: 'Send bulk SMS announcements',
    description:
      'Type a message, choose who gets it (all volunteers, event attendees, or recently active), and send. Every volunteer receives an SMS on their phone.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {['All volunteers', 'Active 30d', 'This event'].map((filter, i) => (
            <span
              key={filter}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                i === 0 ? 'bg-foreground text-background' : 'bg-card/10 text-muted-foreground'
              }`}
            >
              {filter}
            </span>
          ))}
        </div>
        <div className="bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground">
          Reminder: Food bank shift tomorrow 9am at 123 Main St. See you there! 🙌
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Sending to 47 volunteers</span>
          <span className="text-foreground bg-muted px-3 py-1 rounded-lg font-medium">Send →</span>
        </div>
      </div>
    ),
  },
  {
    id: 'reports',
    Icon: FileText,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-warning',
    subtitle: 'What used to take 3 hours takes 30 seconds.',
    title: 'Generate grant reports instantly',
    description:
      'Select a date range and click generate. Merit produces a professional PDF with total volunteers, hours, program breakdown, and top contributors — formatted for grant committee submissions.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl overflow-hidden">
        <div className="bg-card px-4 py-3">
          <p className="text-[9px] text-muted-foreground tracking-widest">MERIT · VOLUNTEER IMPACT REPORT</p>
          <p className="text-foreground font-bold text-sm mt-0.5">Vancouver Rotary Foundation</p>
          <p className="text-muted-foreground text-xs">January 1 – May 31, 2026</p>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {[
            { value: '47', label: 'Volunteers' },
            { value: '312h', label: 'Total hours' },
            { value: '89', label: 'Sessions' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-foreground font-bold text-lg">{stat.value}</p>
              <p className="text-muted-foreground text-[10px]">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-3">
          <div className="w-full bg-amber-500 text-white text-xs font-bold py-2 rounded-lg text-center">
            ↓ Download PDF
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'certificates',
    Icon: Award,
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    subtitle: 'Students love these for college apps.',
    title: 'Issue volunteer certificates',
    description:
      'Generate a personalized, professional recognition letter for any volunteer in seconds. Includes their hours, dates, activities, and your signature.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl p-4 space-y-3">
        <div className="border border-white/10 rounded-xl p-4">
          <p className="text-[9px] text-muted-foreground text-center tracking-widest mb-2">
            CERTIFICATE OF RECOGNITION
          </p>
          <p className="text-foreground font-bold text-center text-lg">Sarah Kim</p>
          <p className="text-muted-foreground text-xs text-center mt-1">
            24 verified hours · Vancouver Rotary Foundation
          </p>
          <div className="border-t border-white/10 mt-3 pt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>Jane Smith · Coordinator</span>
            <span>June 2, 2026</span>
          </div>
        </div>
        <div className="w-full bg-pink-500/10 text-pink-400 text-xs font-medium py-2 rounded-lg text-center">
          ↓ Download certificate PDF
        </div>
      </div>
    ),
  },
  {
    id: 'team',
    Icon: Users,
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    subtitle: 'Everyone gets their own login.',
    title: 'Manage your team',
    description:
      "Invite co-chairs, coordinators, and supervisors by email. Each person gets their own dedicated org login — no sharing accounts. You control access levels.",
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { name: 'You', role: 'Owner', color: 'text-cyan-400' },
          { name: 'Maria C.', role: 'Admin', color: 'text-primary' },
          { name: 'David K.', role: 'Coordinator', color: 'text-muted-foreground' },
        ].map((member) => (
          <div key={member.name} className="flex items-center gap-3 bg-card/5 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
              {member.name[0]}
            </div>
            <p className="flex-1 text-foreground text-sm">{member.name}</p>
            <span className={`text-xs font-medium ${member.color}`}>{member.role}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 bg-card/5 rounded-xl px-4 py-3 border border-dashed border-white/10">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center shrink-0">
            <span className="text-muted-foreground text-lg leading-none">+</span>
          </div>
          <p className="text-muted-foreground text-sm">Invite a team member...</p>
        </div>
      </div>
    ),
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

interface OrgOnboardingModalProps {
  orgId: string;
  orgName: string;
  onComplete: () => void;
}

export function OrgOnboardingModal({ orgId, orgName: _orgName, onComplete }: OrgOnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;
  const progress = ((currentSlide + 1) / SLIDES.length) * 100;

  const handleNext = async () => {
    if (isLast) {
      setIsCompleting(true);
      try {
        await orgOnboardingApi.complete(orgId);
      } catch {
        // Non-fatal — don't block access if API fails
      }
      onComplete();
    } else {
      setCurrentSlide((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-card rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Slide content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`w-12 h-12 rounded-2xl ${slide.iconBg} flex items-center justify-center mb-5`}>
                <slide.Icon className={`w-6 h-6 ${slide.iconColor}`} />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {slide.subtitle}
              </p>
              <h2 className="text-xl font-bold text-foreground mb-3">{slide.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{slide.description}</p>
              {slide.visual}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-5 h-1.5 bg-card' : 'w-1.5 h-1.5 bg-muted hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                onClick={() => setCurrentSlide((s) => s - 1)}
                className="text-sm text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isCompleting}
              className="flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {isLast ? (
                isCompleting ? 'Setting up...' : "Let's go →"
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
