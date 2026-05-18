'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Props {
  supervisorName: string;
  studentName: string;
  hours: number;
  org: string;
  date: string;
  activity: string;
}

export function SmsPreview({ supervisorName, studentName, hours, org, date, activity }: Props) {
  const [explainerOpen, setExplainerOpen] = useState(false);

  const formattedDate = date
    ? format(parseISO(date), 'MMM d, yyyy')
    : '[date]';

  const hoursStr = hours ? (hours % 1 === 0 ? `${hours}` : hours.toFixed(1)) : '[hours]';

  const messageText = `Hi ${supervisorName || '[supervisor name]'} — ${studentName} logged ${hoursStr} hours at ${org || '[organization]'} on ${formattedDate}${activity ? ` (${activity.slice(0, 60)}${activity.length > 60 ? '…' : ''})` : ''}. Reply YES to verify or NO to dispute.`;

  const steps = [
    { n: 1, text: 'Your supervisor gets a text from Merit.' },
    { n: 2, text: 'They reply YES — no account or app needed.' },
    { n: 3, text: 'Your session is marked verified immediately.' },
  ];

  return (
    <div className="flex flex-col h-full">
      <p className="text-h3 text-ink-900 mb-4">SMS preview</p>

      {/* Phone frame */}
      <div className="flex-1 bg-white rounded-xl border border-ink-200 p-5">
        {/* From header */}
        <p className="text-[11px] font-mono text-ink-400 mb-4">
          From: Merit (+1 587 555 0199)
        </p>

        {/* Message bubble */}
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-[13px] leading-relaxed text-ink-900"
          style={{ background: '#F5F5F4' }}
        >
          {messageText}
        </div>

        {/* What happens next */}
        <div className="mt-6 border-t border-ink-100 pt-4">
          <button
            type="button"
            onClick={() => setExplainerOpen(!explainerOpen)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-ink-500 hover:text-ink-700 transition-colors"
          >
            What happens next?
            {explainerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {explainerOpen && (
            <ol className="mt-3 space-y-2">
              {steps.map(({ n, text }) => (
                <li key={n} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-merit-blue-100 text-[10px] font-semibold text-merit-blue-700 mt-0.5">
                    {n}
                  </span>
                  <span className="text-[12px] text-ink-600">{text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
