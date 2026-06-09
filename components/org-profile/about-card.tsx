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
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="text-[15px] font-semibold text-foreground mb-3">About</h2>

      {description ? (
        <p className="text-sm text-foreground leading-relaxed mb-4">{description}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic mb-4">
          {claimed
            ? 'No description added yet.'
            : 'This organization hasn\'t added a description yet.'}
        </p>
      )}

      {(contactEmail || contactPhone || ein) && (
        <div className="space-y-2 pt-3 border-t border-border">
          {contactEmail && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Mail size={13} className="text-muted-foreground shrink-0" />
              <a href={`mailto:${contactEmail}`} className="hover:text-merit-blue-600 transition-colors">
                {contactEmail}
              </a>
            </div>
          )}
          {contactPhone && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Phone size={13} className="text-muted-foreground shrink-0" />
              <a href={`tel:${contactPhone}`} className="hover:text-merit-blue-600 transition-colors">
                {contactPhone}
              </a>
            </div>
          )}
          {ein && (
            <div className="text-[12px] text-muted-foreground">
              EIN / CRA: <span className="font-mono">{ein}</span>
            </div>
          )}
        </div>
      )}

      {!hasContent && (
        <p className="text-sm text-muted-foreground italic">No additional details available.</p>
      )}
    </div>
  );
}
