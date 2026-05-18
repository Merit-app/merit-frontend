'use client';

import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  name: string;
  description: string;
  logo: string; // initials placeholder
  logoColor: string;
  logoBg: string;
  status: 'coming_soon' | 'available';
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Google Classroom',
    description: 'Sync verified hours to your Google Classroom portfolio automatically.',
    logo: 'GC',
    logoColor: '#1565C0',
    logoBg: '#E3F2FD',
    status: 'coming_soon',
  },
  {
    name: 'Remind',
    description: 'Receive supervisor confirmation reminders and hour alerts via Remind.',
    logo: 'Rm',
    logoColor: '#2E7D32',
    logoBg: '#E8F5E9',
    status: 'coming_soon',
  },
  {
    name: 'PowerSchool',
    description: 'Push your verified service hours directly to your school record.',
    logo: 'PS',
    logoColor: '#6A1B9A',
    logoBg: '#F3E5F5',
    status: 'coming_soon',
  },
  {
    name: 'Naviance',
    description: 'Export your hours record to Naviance for college application tracking.',
    logo: 'Nv',
    logoColor: '#E65100',
    logoBg: '#FBE9E7',
    status: 'coming_soon',
  },
  {
    name: 'Canvas',
    description: 'Link Merit sessions to Canvas assignments and submission portfolios.',
    logo: 'Cv',
    logoColor: '#B71C1C',
    logoBg: '#FFEBEE',
    status: 'coming_soon',
  },
  {
    name: 'Slack',
    description: 'Get weekly summaries and goal alerts in a Slack channel of your choice.',
    logo: 'Sl',
    logoColor: '#4A154B',
    logoBg: '#F4ECF7',
    status: 'coming_soon',
  },
];

export default function IntegrationsPage() {
  function handleConnect(name: string) {
    toast.info(`${name} integration is coming soon.`, {
      description: "We'll notify you when it's available.",
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Integrations</h2>
        <p className="text-small text-ink-500 mt-1">
          Connect Merit to the tools your school already uses.
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="bg-white rounded-xl border border-ink-200 p-5 flex items-center gap-4"
          >
            {/* Logo */}
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold"
              style={{ background: integration.logoBg, color: integration.logoColor }}
            >
              {integration.logo}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[13px] font-medium text-ink-900">{integration.name}</p>
                <span className="text-[11px] font-medium text-ink-400 bg-ink-100 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
              <p className="text-small text-ink-500">{integration.description}</p>
            </div>

            {/* CTA */}
            <button
              onClick={() => handleConnect(integration.name)}
              className="shrink-0 flex items-center gap-1.5 text-[13px] font-medium text-ink-400 border border-ink-200 px-3 py-1.5 rounded-lg cursor-not-allowed"
              aria-disabled="true"
            >
              <Lock size={12} />
              Connect
            </button>
          </div>
        ))}
      </div>

      <p className="text-small text-ink-400 mt-6 text-center">
        Missing an integration? Email us at{' '}
        <a href="mailto:hello@merit.app" className="text-merit-blue-600 hover:underline">
          hello@merit.app
        </a>
      </p>
    </div>
  );
}
