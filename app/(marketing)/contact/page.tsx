'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MarketingFooter } from '@/components/marketing/footer';
import { cn } from '@/lib/utils';
const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Enter a valid email address.'),
  subject: z.enum(['general', 'bug', 'partnership', 'press'] as const),
  message: z.string().min(10, 'Message must be at least 10 characters.').max(2000, 'Message is too long.'),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      // Build mailto link
      const subject = {
        general: 'General inquiry',
        bug: 'Bug report',
        partnership: 'School partnership',
        press: 'Press inquiry',
      }[data.subject];

      const mailtoBody = `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${subject}\n\nMessage:\n${data.message}`;
      const mailtoLink = `mailto:hello@merit.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`;

      // Open mailto
      window.location.href = mailtoLink;

      // Show success message
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink-200 bg-white">
        <Link href="/" className="text-[18px] font-bold text-ink-900 tracking-tight">
          merit<span className="text-merit-blue-600">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">About</Link>
          <Link href="/pricing" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">Pricing</Link>
          <Link href="/login" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">Sign in</Link>
          <Link href="/signup" className="text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-[36px] font-bold text-ink-900 mb-3">Get in touch</h1>
          <p className="text-[16px] text-ink-600">
            Have a question or feedback? We'd love to hear from you. We reply within 24 hours.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-ink-200 p-8 mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-[13px] font-medium text-ink-900 mb-1.5 block">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                autoComplete="name"
                autoFocus
                {...register('name')}
                className={cn(errors.name && 'border-danger')}
              />
              {errors.name && (
                <p className="text-[12px] text-danger mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-[13px] font-medium text-ink-900 mb-1.5 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                {...register('email')}
                className={cn(errors.email && 'border-danger')}
              />
              {errors.email && (
                <p className="text-[12px] text-danger mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject" className="text-[13px] font-medium text-ink-900 mb-1.5 block">
                Subject
              </Label>
              <select
                id="subject"
                {...register('subject')}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-ink-300 bg-white text-[13px] font-medium text-ink-900',
                  'focus:outline-none focus:ring-2 focus:ring-merit-blue-500 focus:border-transparent',
                  errors.subject && 'border-danger'
                )}
              >
                <option value="">Select a subject...</option>
                <option value="general">General inquiry</option>
                <option value="bug">Bug report</option>
                <option value="partnership">School partnership</option>
                <option value="press">Press inquiry</option>
              </select>
              {errors.subject && (
                <p className="text-[12px] text-danger mt-1">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="text-[13px] font-medium text-ink-900 mb-1.5 block">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us what's on your mind..."
                rows={6}
                {...register('message')}
                className={cn(errors.message && 'border-danger')}
              />
              {errors.message && (
                <p className="text-[12px] text-danger mt-1">{errors.message.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send message'
              )}
            </Button>

            {submitted && (
              <div className="rounded-lg bg-success/8 border border-success/20 px-3 py-2.5">
                <p className="text-[13px] text-success">
                  ✓ Message sent! We'll be in touch soon.
                </p>
              </div>
            )}
          </form>

          {/* Email fallback */}
          <div className="mt-8 pt-8 border-t border-ink-200">
            <p className="text-[13px] text-ink-600 mb-4">Prefer email? Reach out directly:</p>
            <a
              href="mailto:hello@merit.app"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
            >
              <Mail size={16} />
              hello@merit.app
            </a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[13px] text-ink-600">
            Expected response time: <span className="font-medium">24 hours</span>
          </p>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
