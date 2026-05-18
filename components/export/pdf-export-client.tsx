'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// @react-pdf/renderer is browser-only — must be ssr: false
const PdfExportInner = dynamic(() => import('./pdf-export-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex gap-8">
      <div className="w-72 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-[700px] w-full rounded-xl" />
      </div>
    </div>
  ),
});

export function PdfExportClient() {
  return <PdfExportInner />;
}
