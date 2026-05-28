import type { Metadata } from 'next';
import { PdfExportClient } from '@/components/export/pdf-export-client';

export const metadata: Metadata = { title: 'Export' };

export default function ExportPage() {
  return (
    <div className="px-4 py-4 md:px-8 md:py-6">
      <div className="mb-6">
        <h1 className="text-h1 text-ink-900">Export</h1>
        <p className="text-small text-ink-500 mt-1">
          Download a verified PDF of your hours for scholarships, college applications, and graduation requirements.
        </p>
      </div>
      <PdfExportClient />
    </div>
  );
}
