'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { ClaimModal } from './claim-modal';

interface ClaimButtonProps {
  orgId: string;
  orgName: string;
  orgWebsiteUrl?: string | null;
}

export function ClaimButton({ orgId, orgName, orgWebsiteUrl }: ClaimButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <Shield className="w-3.5 h-3.5" />
        Claim this page
      </button>

      {open && (
        <ClaimModal
          orgId={orgId}
          orgName={orgName}
          orgWebsiteUrl={orgWebsiteUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
