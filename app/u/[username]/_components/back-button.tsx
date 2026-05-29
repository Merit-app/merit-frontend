'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-[13px] text-ink-500 hover:text-ink-800 transition-colors"
    >
      <ArrowLeft size={14} />
      Back
    </button>
  );
}
