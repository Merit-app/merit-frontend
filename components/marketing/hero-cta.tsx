'use client';

import { useState } from 'react';

export function HeroCTA() {
  const [mode, setMode] = useState<'student' | 'org'>('student');

  return (
    <div className="space-y-5">
      {/* Mode switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setMode('student')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'student' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          For students
        </button>
        <button
          onClick={() => setMode('org')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'org' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
            className="bg-gray-900 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-colors shadow-sm text-sm w-fit"
          >
            Start for free
          </a>
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            Already have an account? Sign in →
          </a>
          <p className="text-xs text-gray-400">No credit card. No app download. Works in your browser.</p>
        </div>
      )}

      {/* Org CTA */}
      {mode === 'org' && (
        <div className="flex flex-col gap-3">
          <a
            href="/org/login"
            className="bg-gray-900 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-colors shadow-sm text-sm w-fit flex items-center gap-2"
          >
            Sign in to your organization →
          </a>
          <a href="/org/join" className="text-sm text-gray-500 hover:text-gray-700">
            Accept a team invitation
          </a>
          <a href="/org" className="text-sm text-gray-500 hover:text-gray-700">
            Learn more about Merit for Organizations →
          </a>
        </div>
      )}
    </div>
  );
}
