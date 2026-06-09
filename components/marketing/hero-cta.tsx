'use client';

import { useState } from 'react';

export function HeroCTA() {
  const [mode, setMode] = useState<'student' | 'org'>('student');

  return (
    <div className="space-y-5">
      {/* Mode switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setMode('student')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'student' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          For students
        </button>
        <button
          onClick={() => setMode('org')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'org' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          For organizations
        </button>
      </div>

      {/* Student CTA */}
      {mode === 'student' && (
        <div className="flex flex-col gap-3">
          <a
            href="/signup"
            className="bg-card text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-muted transition-colors shadow-sm text-sm w-fit"
          >
            Start for free
          </a>
          <a href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            Already have an account? Sign in →
          </a>
          <p className="text-xs text-muted-foreground">No credit card. No app download. Works in your browser.</p>
        </div>
      )}

      {/* Org CTA */}
      {mode === 'org' && (
        <div className="flex flex-col gap-3">
          <a
            href="/org/login"
            className="bg-card text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-muted transition-colors shadow-sm text-sm w-fit flex items-center gap-2"
          >
            Sign in to your organization →
          </a>
          <a href="/org/join" className="text-sm text-muted-foreground hover:text-foreground">
            Accept a team invitation
          </a>
          <a href="/org" className="text-sm text-muted-foreground hover:text-foreground">
            Learn more about Merit for Organizations →
          </a>
        </div>
      )}
    </div>
  );
}
