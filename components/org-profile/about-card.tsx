import { Mail, Phone } from 'lucide-react';

interface Props {
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  ein: string | null;
  claimed: boolean;
}

export function OrgAboutCard({ description, contactEmail, contactPhone, ein, claimed }: Props) {
  const hasContent = description || contactEmail || contactPhone || ein;

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-5">
      <h2 className="text-[15px] font-semibold text-ink-900 mb-3">About</h2>

      {description ? (
        <p className="text-sm text-ink-700 leading-relaxed mb-4">{description}</p>
      ) : (
        <p className="text-sm text-ink-400 italic mb-4">
          {claimed
            ? 'No description added yet.'
            : 'This organization hasn\'t added a description yet.'}
        </p>
      )}

      {(contactEmail || contactPhone || ein) && (
        <div className="space-y-2 pt-3 border-t border-ink-100">
          {contactEmail && (
            <div className="flex items-center gap-2 text-[13px] text-ink-600">
              <Mail size={13} className="text-ink-400 shrink-0" />
              <a href={`mailto:${contactEmail}`} className="hover:text-merit-blue-600 transition-colors">
                {contactEmail}
              </a>
            </div>
          )}
          {contactPhone && (
            <div className="flex items-center gap-2 text-[13px] text-ink-600">
              <Phone size={13} className="text-ink-400 shrink-0" />
              <a href={`tel:${contactPhone}`} className="hover:text-merit-blue-600 transition-colors">
                {contactPhone}
              </a>
            </div>
          )}
          {ein && (
            <div className="text-[12px] text-ink-400">
              EIN / CRA: <span className="font-mono">{ein}</span>
            </div>
          )}
        </div>
      )}

      {!hasContent && (
        <p className="text-sm text-ink-400 italic">No additional details available.</p>
      )}
    </div>
  );
}
