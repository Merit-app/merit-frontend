import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shows whether a verified session is shared with the student's school. Manage sharing
// from My chapter → "Choose what your school sees".
export function SharedIndicator({ shared, className }: { shared: boolean; className?: string }) {
  return shared ? (
    <span
      title="Shared with your school"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        'text-merit-blue-700 bg-merit-blue-50 dark:text-merit-blue-300 dark:bg-merit-blue-900/30',
        className,
      )}
    >
      <Eye className="h-3 w-3" /> Shared
    </span>
  ) : (
    <span
      title="Hidden from your school"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-500/15',
        className,
      )}
    >
      <EyeOff className="h-3 w-3" /> Hidden
    </span>
  );
}
