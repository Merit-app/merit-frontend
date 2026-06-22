'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, Target, ClipboardList, Megaphone, MessageSquare, Shield,
  ChevronRight, CheckCircle2, TrendingUp, FileText, Upload,
} from 'lucide-react';

// ── Slide definitions ─────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'welcome',
    Icon: School,
    iconBg: 'bg-merit-blue-500/10',
    iconColor: 'text-merit-blue-500',
    subtitle: 'Your whole service-hour program, in one place',
    title: 'Welcome to Merit for Schools',
    description:
      "Track every student's hours, set requirements, collect assignments, share opportunities, and prove your program's impact — without spreadsheets. Here's the tour.",
    visual: (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { label: 'Track hours', Icon: TrendingUp, color: 'text-success' },
          { label: 'Set goals', Icon: Target, color: 'text-primary' },
          { label: 'Assignments', Icon: ClipboardList, color: 'text-purple-400' },
          { label: 'Opportunities', Icon: Megaphone, color: 'text-warning' },
          { label: 'Message students', Icon: MessageSquare, color: 'text-pink-400' },
          { label: 'Add your team', Icon: Users, color: 'text-cyan-400' },
        ].map((item) => (
          <div key={item.label} className="bg-card/5 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
            <item.Icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-[10px] text-muted-foreground font-medium leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'roster',
    Icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-primary',
    subtitle: 'No more chasing students for updates.',
    title: 'Track every student automatically',
    description:
      'Import your roster once — students auto-pair when they sign up with their school email. Verified hours roll in on their own, with at-risk flags so nobody slips through the cracks.',
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { name: 'Sarah Kim', hrs: '28 / 30', status: 'On track', cls: 'bg-blue-500/15 text-primary' },
          { name: 'Jordan Lee', hrs: '6 / 30', status: 'At risk', cls: 'bg-amber-500/15 text-warning' },
          { name: 'Priya Nair', hrs: '30 / 30', status: 'Met ✓', cls: 'bg-green-500/15 text-success' },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-3 bg-card/5 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
              {s.name[0]}
            </div>
            <p className="flex-1 text-foreground text-sm font-medium">{s.name}</p>
            <span className="text-muted-foreground text-xs tabular-nums shrink-0">{s.hrs}</span>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 ${s.cls}`}>{s.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'requirements',
    Icon: Target,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-success',
    subtitle: 'Set it once. Merit does the math.',
    title: 'Requirements & cohort goals',
    description:
      'Set the hours requirement and deadline — or different goals per graduating class. Merit calculates who has met it, who is on track, and who is behind, automatically.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">Service requirement</p>
            <p className="text-muted-foreground text-xs">30 hours · due June 2027</p>
          </div>
          <Target className="w-5 h-5 text-success shrink-0" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">PER-CLASS GOALS</p>
          {[
            { cls: 'Class of 2027', hrs: '40h' },
            { cls: 'Class of 2028', hrs: '20h' },
          ].map((c) => (
            <div key={c.cls} className="flex items-center justify-between bg-card/5 rounded-lg px-3 py-2 text-sm">
              <span className="text-muted-foreground">{c.cls}</span>
              <span className="text-foreground font-medium">{c.hrs}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'assignments',
    Icon: ClipboardList,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    subtitle: 'Collect work, not paper.',
    title: 'Post assignments & collect files',
    description:
      'Post tasks and forms (like “Teams for WEX”). Students upload their docs and PDFs right in Merit — you download, review, and approve or return, all tracked per student.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-foreground text-sm font-semibold">WEX reflection form</p>
          <span className="text-xs text-muted-foreground">18/24 submitted</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 bg-card/5 rounded-lg px-3 py-2">
            <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="flex-1 text-foreground text-sm">Sarah Kim — reflection.pdf</span>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-green-500/15 text-success font-medium">Approved</span>
          </div>
          <div className="flex items-center gap-2 bg-card/5 rounded-lg px-3 py-2">
            <Upload className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1 text-muted-foreground text-sm">Jordan Lee — not submitted</span>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-card/10 text-muted-foreground font-medium">Outstanding</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'opportunities',
    Icon: Megaphone,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-warning',
    subtitle: 'Give students places to serve.',
    title: 'Share volunteer opportunities',
    description:
      'Post opportunities and events from your partner organizations. Students browse and sign up right from their dashboard — and their hours flow back to you verified.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">Saturday Food Bank</p>
            <p className="text-muted-foreground text-xs">June 7 · 9am–12pm</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-success font-medium shrink-0">Open</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {['SK', 'JL', 'PM', 'AR'].map((init, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-card flex items-center justify-center text-[10px] font-bold text-white">
                {init}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">12 of 15 students signed up</span>
        </div>
      </div>
    ),
  },
  {
    id: 'messages',
    Icon: MessageSquare,
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    subtitle: 'Reach everyone — or just who needs it.',
    title: 'Announcements & nudges',
    description:
      'Send an announcement to all students, or nudge only the ones falling behind with one tap. No group chats, no email lists to maintain.',
    visual: (
      <div className="mt-4 bg-card/5 rounded-xl p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {['All students', 'Behind', 'Class of 2027'].map((filter, i) => (
            <span key={filter} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${i === 1 ? 'bg-foreground text-background' : 'bg-card/10 text-muted-foreground'}`}>
              {filter}
            </span>
          ))}
        </div>
        <div className="bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground">
          Reminder: you have 12 hours left to log before the June deadline. You&apos;ve got this! 💪
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Nudging 12 students who are behind</span>
          <span className="text-foreground bg-muted px-3 py-1 rounded-lg font-medium">Send →</span>
        </div>
      </div>
    ),
  },
  {
    id: 'team',
    Icon: Shield,
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    subtitle: "You're all set.",
    title: 'Add your team & prove impact',
    description:
      'Invite co-coordinators with their own logins and permission levels. Export a clean roster or compliance report whenever you need it. Ready to start?',
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { name: 'You', role: 'Primary coordinator', color: 'text-cyan-400' },
          { name: 'Maria C.', role: 'Assistant', color: 'text-primary' },
        ].map((m) => (
          <div key={m.name} className="flex items-center gap-3 bg-card/5 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-xs font-bold text-foreground shrink-0">{m.name[0]}</div>
            <p className="flex-1 text-foreground text-sm">{m.name}</p>
            <span className={`text-xs font-medium ${m.color}`}>{m.role}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 bg-green-500/10 text-success rounded-xl px-4 py-2.5 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Export roster &amp; compliance reports anytime
        </div>
      </div>
    ),
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function ChapterOnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;
  const progress = ((currentSlide + 1) / SLIDES.length) * 100;

  const handleNext = () => {
    if (isLast) onComplete();
    else setCurrentSlide((s) => s + 1);
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
          <motion.div className="h-full bg-merit-blue-600 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{slide.subtitle}</p>
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
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === currentSlide ? 'w-5 h-1.5 bg-merit-blue-600' : 'w-1.5 h-1.5 bg-muted hover:bg-gray-500'}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button onClick={() => setCurrentSlide((s) => s - 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-merit-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-merit-blue-700 transition-colors"
            >
              {isLast ? "Let's go →" : (<>Next <ChevronRight className="w-4 h-4" /></>)}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
