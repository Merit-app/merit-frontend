'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

interface UpgradeGateProps {
  orgId: string;
  feature: string;
  description: string;
  plan?: 'pro' | 'enterprise';
}

export function UpgradeGate({ orgId, feature, description, plan = 'pro' }: UpgradeGateProps) {
  const price = plan === 'pro' ? 29 : 99;
  const planLabel = plan === 'pro' ? 'Pro' : 'Enterprise';

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-gray-500" />
      </div>
      <div>
        <p className="text-white font-bold text-lg">{feature}</p>
        <p className="text-gray-400 text-sm mt-2 leading-relaxed">{description}</p>
      </div>
      <Link
        href={`/org/${orgId}/settings?tab=billing`}
        className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
      >
        Upgrade to {planLabel} · ${price}/mo
      </Link>
      <p className="text-gray-600 text-xs">14-day free trial. Cancel anytime.</p>
    </div>
  );
}
