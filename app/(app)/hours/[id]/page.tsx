'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useMeritStore } from '@/lib/store';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sessions = useMeritStore((s) => s.sessions);
  const router = useRouter();

  const session = sessions.find((s) => s.id === id);

  useEffect(() => {
    if (sessions.length === 0) return; // still hydrating
    if (!session) {
      notFound();
      return;
    }
    // Redirect to hours table with session sheet open
    router.replace(`/hours?session=${id}`);
  }, [session, sessions.length, id, router]);

  return null;
}
