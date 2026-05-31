'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

// ── Feature mockups ───────────────────────────────────────────────────────────

function LogFormMockup() {
  return (
    <div className="p-6 space-y-4">
      <p className="text-sm font-semibold text-gray-800">Log hours</p>
      <div className="space-y-3">
        {[
          { label: 'Organization', value: 'Vancouver Rotary Foundation' },
          { label: 'Date', value: 'May 28, 2026' },
          { label: 'Hours', value: '4 hours' },
          { label: 'Activity', value: 'Food bank sorting' },
          { label: 'Supervisor', value: 'John Smith · +1 604 555 0100' },
        ].map((field) => (
          <div key={field.label}>
            <p className="text-xs text-gray-400 mb-1">{field.label}</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
              {field.value}
            </div>
          </div>
        ))}
        <div className="bg-gray-900 text-white text-sm font-medium rounded-lg py-3 text-center mt-2">
          Log session →
        </div>
      </div>
    </div>
  );
}

function SMSMockup() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-gray-800 mb-4">SMS verification</p>
      <div className="max-w-[240px] mx-auto bg-gray-900 rounded-3xl p-2 shadow-xl">
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 text-center border-b">
            <p className="text-xs text-gray-500">Messages</p>
            <p className="text-sm font-semibold">Merit App</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-blue-500 text-white text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
              Sarah logged 4 hours at Vancouver Rotary on May 28. Reply YES to verify.
            </div>
            <div className="bg-gray-100 text-gray-800 text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[40%] ml-auto">
              YES
            </div>
            <div className="bg-blue-500 text-white text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
              ✓ Verified! Sarah&apos;s session is now confirmed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PDFMockup() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-gray-800 mb-4">Signed PDF record</p>
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-900 text-white p-4">
          <p className="text-xs text-gray-400">MERIT · VERIFIED RECORD</p>
          <p className="font-bold text-lg mt-1">Sarah Kim</p>
          <p className="text-xs text-gray-400 mt-0.5">Burnaby North Secondary · Grade 11</p>
        </div>
        <div className="p-4 space-y-2">
          {[
            { org: 'Vancouver Rotary', date: 'May 28', hrs: '4h', status: '✓' },
            { org: 'BC Youth Council', date: 'May 15', hrs: '3h', status: '✓' },
            { org: 'Red Cross', date: 'May 1', hrs: '6h', status: '✓' },
          ].map((row) => (
            <div key={row.org} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100">
              <span className="text-gray-700 font-medium">{row.org}</span>
              <span className="text-gray-400">{row.date}</span>
              <span className="font-bold text-gray-900">{row.hrs}</span>
              <span className="text-green-600 font-bold">{row.status}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <span className="text-xs font-semibold text-gray-700">Total verified</span>
            <span className="text-sm font-bold text-gray-900">13h</span>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <div className="w-12 h-12 border-2 border-gray-300 rounded grid grid-cols-3 gap-px p-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-sm ${
                    [0, 1, 3, 5, 7, 8].includes(i) ? 'bg-gray-800' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">Scan to verify</p>
              <p className="text-xs text-gray-400">meritco.app/verify/...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileMockup() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-gray-800 mb-4">Public profile</p>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              SK
            </div>
            <div>
              <p className="font-bold text-white">Sarah Kim</p>
              <p className="text-xs text-blue-200">@sarahkim · Grade 11</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          {[
            { label: 'Hours', value: '47' },
            { label: 'Orgs', value: '4' },
            { label: 'Badges', value: '3' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="p-3 flex gap-2 flex-wrap">
          {['First Shift', 'Community Hopper', 'Quarter Mark'].map((name) => (
            <div
              key={name}
              className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full font-medium"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    id: 'log',
    label: 'Log hours',
    headline: 'Done in under a minute.',
    body: "Pick your org, enter what you did, add your supervisor. That's it.",
    mockup: <LogFormMockup />,
  },
  {
    id: 'verify',
    label: 'SMS verification',
    headline: 'Your supervisor confirms in one tap.',
    body: 'We text them a simple YES/NO. No app download, no account needed.',
    mockup: <SMSMockup />,
  },
  {
    id: 'export',
    label: 'PDF export',
    headline: 'A document advisors actually trust.',
    body: 'QR code for verification, supervisor signature block, your full record.',
    mockup: <PDFMockup />,
  },
  {
    id: 'profile',
    label: 'Public profile',
    headline: 'Your verified record, always shareable.',
    body: 'A public link shows your hours, badges, and orgs. Perfect for applications.',
    mockup: <ProfileMockup />,
  },
] as const;

export function FeatureExplorer() {
  const [active, setActive] = useState<(typeof FEATURES)[number]['id']>('log');
  const activeFeature = FEATURES.find((f) => f.id === active)!;

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto" id="how-it-works">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
          How it works
        </p>
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Simple by design.</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-2">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActive(feature.id)}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-200 group ${
                active === feature.id
                  ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      active === feature.id ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {feature.headline}
                  </p>
                  <p
                    className={`text-sm ${
                      active === feature.id ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {feature.body}
                  </p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 ml-4 transition-transform ${
                    active === feature.id ? 'text-white rotate-90' : 'text-gray-400'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-white min-h-72 transition-all duration-300">
            {activeFeature.mockup}
          </div>
        </div>
      </div>
    </section>
  );
}
