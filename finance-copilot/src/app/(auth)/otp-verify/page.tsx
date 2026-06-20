'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import { authService } from '@/lib/api/services';

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (otp.join('').length !== 6) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const email = localStorage.getItem('fc_signup_email') || '';
      if (!email) {
        setErrorMsg('Email not found. Please sign up again.');
        return;
      }
      await authService.verifyOtp({ email, otp: otp.join('') });
      setSuccessMsg('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired verification code');
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

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
        <p className="text-sm text-muted-foreground">We've sent a 6-digit code to your email address. Enter it below.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-rose-500 font-medium text-center">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-500 font-medium text-center">
          {successMsg}
        </div>
      )}

      <div className="flex gap-3 justify-center mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-border bg-white/5 focus:border-indigo-500 focus:outline-none transition-colors"
            id={`otp-input-${i}`}
          />
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={otp.join('').length !== 6 || isLoading}
        id="otp-verify-btn"
      >
        {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify Email'}
      </Button>

      <button className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <RefreshCw className="w-4 h-4" /> Resend code in 60s
      </button>
    </motion.div>
  );
}
