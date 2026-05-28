import Link from 'next/link';
import { MessageCircle, FileText, Mail } from 'lucide-react';

const FAQS = [
  {
    q: 'How does supervisor verification work?',
    a: "After you log a session, Merit sends your supervisor an SMS with a summary. They reply YES to confirm or NO to dispute. Verified sessions count toward your goal; disputed ones appear flagged in your record.",
  },
  {
    q: 'What counts as a verified hour?',
    a: "Any session confirmed by a supervisor via SMS reply, or sessions logged at an institutional partner (those are auto-verified). Pending sessions don't count toward totals until confirmed.",
  },
  {
    q: "Why does my supervisor's SMS not arrive?",
    a: "Check that the phone number is correct in the session detail. If the number is right, ask your supervisor to check their spam filter. You can resend the verification request from the session detail sheet.",
  },
  {
    q: 'Can I edit a session after logging it?',
    a: 'You can delete a session from the session detail sheet and re-log it with corrected information. Editing in place is coming in a future update.',
  },
  {
    q: 'How do I export my hours for college applications?',
    a: 'Go to Export in the sidebar. You can choose a date range, include or exclude supervisor names, and download a signed PDF suitable for scholarship, college application, and graduation requirement submissions.',
  },
  {
    q: 'Is my data stored securely?',
    a: "During this preview, data is stored locally in your browser's localStorage. We don't transmit anything to external servers. A cloud sync option is on the roadmap.",
  },
];

export default function HelpPage() {
  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-h1 text-ink-900">Help</h1>
        <p className="text-small text-ink-500 mt-1">Answers to common questions about Merit.</p>
      </div>

      {/* FAQ */}
      <div className="space-y-4 mb-10">
        {FAQS.map(({ q, a }) => (
          <div key={q} className="bg-white rounded-xl border border-ink-200 p-5">
            <p className="text-[13px] font-semibold text-ink-900 mb-2">{q}</p>
            <p className="text-small text-ink-500 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-ink-200 p-5">
        <p className="text-[13px] font-semibold text-ink-900 mb-4">Still need help?</p>
        <div className="space-y-3">
          <a
            href="mailto:hello@merit.app"
            className="flex items-center gap-3 text-[13px] text-ink-700 hover:text-merit-blue-600 transition-colors"
          >
            <Mail size={15} className="text-ink-400 shrink-0" />
            hello@merit.app
          </a>
          <div className="flex items-center gap-3 text-[13px] text-ink-500">
            <MessageCircle size={15} className="text-ink-400 shrink-0" />
            Live chat coming soon
          </div>
          <Link
            href="/export"
            className="flex items-center gap-3 text-[13px] text-ink-700 hover:text-merit-blue-600 transition-colors"
          >
            <FileText size={15} className="text-ink-400 shrink-0" />
            Export your record
          </Link>
        </div>
      </div>
    </div>
  );
}
