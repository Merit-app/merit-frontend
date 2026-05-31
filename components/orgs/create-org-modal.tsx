'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Building2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { orgsApi } from '@/lib/api';
import { useMeritStore } from '@/lib/store';

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Food & Hunger',
  'Education & Tutoring',
  'Environment & Nature',
  'Animal Welfare',
  'Health & Wellness',
  'Community & Social',
  'Youth & Children',
  'Arts & Culture',
  'Emergency & Crisis',
  'Sports & Recreation',
  'Faith & Spiritual',
  'Other',
];

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  category: z.string().min(1, 'Please select a category'),
  city: z.string().min(2, 'City is required').max(100),
  websiteUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email('Enter a valid email').or(z.literal('')).optional(),
  isRecruiting: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateOrgModal({ open, onClose }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrg, setCreatedOrg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setIsOrgAdmin = useMeritStore((s) => s.setIsOrgAdmin);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isRecruiting: false },
  });

  const descriptionValue = watch('description') ?? '';

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await orgsApi.createOrg({
        name: data.name,
        category: data.category,
        city: data.city,
        websiteUrl: data.websiteUrl || undefined,
        description: data.description || undefined,
        contactEmail: data.contactEmail || undefined,
        isRecruiting: data.isRecruiting,
      });
      setCreatedOrg((res as any).data.org);
      setIsOrgAdmin(true); // user is now an org admin
      setStep('success');
    } catch {
      toast.error('Failed to create organization — please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setCreatedOrg(null);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg overflow-visible">

        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 shrink-0" />
                Add your organization
              </DialogTitle>
              <DialogDescription>
                Add your org to Merit so students can log and verify hours here.
                You'll be the admin and can manage your page.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2 max-h-[65vh] overflow-y-auto pr-1">
              {/* Name */}
              <div className="space-y-1.5">
                <Label>
                  Organization name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('name')}
                  placeholder="e.g. Vancouver Youth Coding Club"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Category + City row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(val) => setValue('category', val, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input {...register('city')} placeholder="e.g. Vancouver" />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <Label>
                  Website{' '}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  {...register('websiteUrl')}
                  placeholder="https://yourorg.org"
                  type="url"
                />
                {errors.websiteUrl && (
                  <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>
                )}
              </div>

              {/* Contact email */}
              <div className="space-y-1.5">
                <Label>
                  Contact email{' '}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  {...register('contactEmail')}
                  placeholder="hello@yourorg.org"
                  type="email"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>
                  Description{' '}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Textarea
                  {...register('description')}
                  placeholder="What does your organization do?"
                  rows={3}
                  className="resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {descriptionValue.length}/500
                </p>
              </div>

              {/* Recruiting toggle */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <input
                  type="checkbox"
                  id="isRecruiting"
                  {...register('isRecruiting')}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <label htmlFor="isRecruiting" className="text-sm font-medium cursor-pointer">
                    We're looking for volunteers
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Shows a recruiting badge on your org page
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {isLoading ? 'Creating...' : 'Create organization'}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'success' && createdOrg && (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{createdOrg.name} is now on Merit!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                You're the admin. Students can now log hours at your organization.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleClose();
                  router.push(`/orgs/${createdOrg.slug}`);
                }}
              >
                View org page
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  handleClose();
                  router.push('/org/dashboard');
                }}
              >
                Go to dashboard
              </Button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
