'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Zap, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <p className="font-bold text-lg gradient-text">Finance Copilot</p>
      </div>

      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">We&apos;ve sent a password reset link to your email address.</p>
          <Link href="/login">
            <Button variant="outline" className="w-full">Back to Login</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
          <p className="text-muted-foreground text-sm mb-8">Enter your email and we&apos;ll send you a reset link.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="forgot-email" type="email" placeholder="you@company.com" className="pl-10 bg-white/5 border-white/10 h-11" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
            </div>
            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading} id="forgot-submit">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </Button>
          </form>
          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </>
      )}
    </motion.div>
  );
}
