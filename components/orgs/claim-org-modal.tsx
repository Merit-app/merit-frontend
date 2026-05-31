'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Building2, CheckCircle2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { orgClaimsApi, ApiError } from '@/lib/api';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  role: z.enum(['employee', 'coordinator', 'owner', 'board_member', 'other']),
  workEmail: z.string().email('Enter a valid work email'),
});

type FormData = z.infer<typeof schema>;

const ROLE_LABELS: Record<string, string> = {
  employee: 'Employee',
  coordinator: 'Volunteer Coordinator',
  owner: 'Owner / Executive Director',
  board_member: 'Board Member',
  other: 'Other',
};

type ClaimState = 'form' | 'auto_approved' | 'pending_review';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ClaimOrgModal({ open, onClose, orgId, orgName }: Props) {
  const [claimState, setClaimState] = useState<ClaimState>('form');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await orgClaimsApi.submit({
        orgId,
        role: data.role,
        workEmail: data.workEmail,
      });
      if (res.data.autoApproved) {
        setClaimState('auto_approved');
      } else {
        setClaimState('pending_review');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error(err.message);
        } else {
          toast.error('Failed to submit claim — please try again');
        }
      } else {
        toast.error('Failed to submit claim — please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setClaimState('form');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-visible">

        {claimState === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 shrink-0" />
                Claim {orgName}
              </DialogTitle>
              <DialogDescription>
                Verify your connection to this organization to manage its Merit page.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              {/* Role */}
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink-900">
                  Your role at {orgName}
                </Label>
                <Select onValueChange={(val) => setValue('role', val as FormData['role'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role…" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[200]" sideOffset={4}>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-[12px] text-red-500">{errors.role.message}</p>
                )}
              </div>

              {/* Work email */}
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink-900">Work email</Label>
                <Input
                  {...register('workEmail')}
                  type="email"
                  placeholder="you@organization.org"
                  autoFocus
                />
                {errors.workEmail && (
                  <p className="text-[12px] text-red-500">{errors.workEmail.message}</p>
                )}
                <p className="text-[11px] text-ink-500">
                  Use your work email. If your domain matches the organization's website,
                  you'll be approved instantly.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-merit-blue-600 hover:bg-merit-blue-700 text-white" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {isLoading ? 'Submitting…' : 'Submit claim'}
                </Button>
              </div>
            </form>
          </>
        )}

        {claimState === 'auto_approved' && (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">You're now an admin!</h3>
              <p className="text-ink-500 text-sm mt-1">
                Your email matched {orgName}'s domain. You've been automatically approved.
              </p>
            </div>
            <Button
              className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        )}

        {claimState === 'pending_review' && (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Claim submitted</h3>
              <p className="text-ink-500 text-sm mt-1">
                We couldn't automatically verify your email domain.
                Your claim is under manual review — we'll email you within 2 business days.
              </p>
            </div>
            <Button variant="outline" onClick={handleClose}>
              Got it
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
