'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Clock,
  MessageSquare,
  BadgeCheck,
  ArrowRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingSlide } from './onboarding-slide';
import { OnboardingProgress } from './onboarding-progress';
import { useOnboarding } from '@/hooks/use-onboarding';
import { cn } from '@/lib/utils';

const TOTAL_SLIDES = 5;

function getSlides(firstName: string) {
  return [
    {
      heading: `Welcome to Merit, ${firstName}`,
      subtext:
        "You're now part of a network of students proving their volunteer work matters.",
      visual: (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-merit-blue-100 flex items-center justify-center">
            <Sparkles className="text-merit-blue-600" size={32} />
          </div>
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">merit.</p>
        </div>
      ),
    },
    {
      heading: 'Log every session in 60 seconds',
      subtext:
        'Date, org, hours, supervisor — that\'s it. Your hours are timestamped and stored securely.',
      visual: (
        <div className="flex flex-col gap-2 w-64 text-left">
          {[
            { label: 'Organization', val: 'Vancouver Food Bank' },
            { label: 'Hours', val: '3' },
            { label: 'Supervisor', val: 'Jane Smith' },
          ].map((f) => (
            <div key={f.label} className="bg-card rounded-lg px-3 py-2 border border-border flex justify-between text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="text-foreground font-medium">{f.val}</span>
            </div>
          ))}
          <div className="bg-merit-blue-600 rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 text-white text-xs font-medium">
            <Clock size={12} />
            Log session
          </div>
        </div>
      ),
    },
    {
      heading: 'SMS verification — no paperwork',
      subtext:
        'Your supervisor gets a text. They reply YES. Your hours are independently verified — no chasing signatures.',
      visual: (
        <div className="flex flex-col gap-2 w-64">
          <div className="bg-ink-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-ink-100 self-start max-w-[80%]">
            <span className="font-medium text-muted-foreground block mb-0.5 text-[10px]">Merit</span>
            Hi Jane! Kai logged 3 hrs at Vancouver Food Bank on Jun 14.{' '}
            <span className="text-merit-blue-300 font-semibold">Reply YES to confirm.</span>
          </div>
          <div className="bg-merit-blue-600 rounded-2xl rounded-br-sm px-4 py-2.5 text-xs text-white self-end">
            YES
          </div>
          <div className="flex items-center gap-1.5 self-start">
            <MessageSquare size={12} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Verified via SMS</span>
          </div>
        </div>
      ),
    },
    {
      heading: 'Earn badges. Build your record.',
      subtext:
        'Hit milestones, collect badges, and share your verified profile on college apps.',
      visual: (
        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
          {[
            { label: 'First Shift', tier: 'bronze', icon: '✦' },
            { label: 'Ten Strong', tier: 'bronze', icon: '★' },
            { label: 'Quarter Mark', tier: 'silver', icon: '◆' },
            { label: 'Fifty', tier: 'gold', icon: '🏆' },
          ].map((b) => (
            <div
              key={b.label}
              className={cn(
                'rounded-xl border px-3 py-2 text-center text-xs font-medium',
                b.tier === 'bronze' && 'bg-amber-50 border-amber-200 text-amber-800',
                b.tier === 'silver' && 'bg-slate-50 border-slate-200 text-slate-700',
                b.tier === 'gold' && 'bg-yellow-50 border-yellow-300 text-yellow-800',
              )}
            >
              <span className="block text-base mb-0.5">{b.icon}</span>
              {b.label}
            </div>
          ))}
          <div className="rounded-xl border px-3 py-2 text-center text-xs font-medium bg-muted border-border text-muted-foreground opacity-60 grayscale">
            <BadgeCheck className="mx-auto mb-0.5" size={16} />
            ???
          </div>
        </div>
      ),
    },
    {
      heading: "Ready to log your first hour?",
      subtext: 'Takes less than a minute.',
      visual: (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-merit-blue-100 flex items-center justify-center">
            <ArrowRight className="text-merit-blue-600" size={28} />
          </div>
          <p className="text-xs text-muted-foreground">You're all set</p>
        </div>
      ),
    },
  ];
}

export function OnboardingModal() {
  const { showOnboarding, complete, skip, user } = useOnboarding();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const router = useRouter();

  if (!showOnboarding) return null;

  const firstName = user?.firstName || 'there';
  const slides = getSlides(firstName);
  const isLast = step === TOTAL_SLIDES - 1;

  function next() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_SLIDES - 1));
  }

  function back() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handlePrimary() {
    if (isLast) {
      await complete();
      router.push('/log');
    } else {
      next();
    }
  }

  async function handleSkip() {
    await skip();
  }

  const slide = slides[step]!;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4">
      {/* Card */}
      <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <OnboardingProgress total={TOTAL_SLIDES} current={step} />
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-muted-foreground transition-colors p-1 rounded-lg hover:bg-muted"
            aria-label="Skip onboarding"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide content */}
        <div className="min-h-[340px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <OnboardingSlide
              key={step}
              heading={slide.heading}
              subtext={slide.subtext}
              visual={slide.visual}
              direction={direction}
            />
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 px-6 pb-6 pt-2">
          <Button
            onClick={handlePrimary}
            className="w-full bg-merit-blue-600 hover:bg-merit-blue-700 text-white h-11 rounded-xl font-medium"
          >
            {isLast ? (
              <>Log my first session <ArrowRight size={16} /></>
            ) : (
              <>Next <ArrowRight size={16} /></>
            )}
          </Button>

          {step > 0 && !isLast && (
            <button
              onClick={back}
              className="text-sm text-muted-foreground hover:text-muted-foreground transition-colors py-1"
            >
              Back
            </button>
          )}

          {(step === 0 || isLast) && (
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-muted-foreground transition-colors py-1"
            >
              {isLast ? "I'll do it later" : 'Skip'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
