'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/services';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.login(data);
      if (res.success && res.data) {
        useAuthStore.getState().setAuth(res.data.user, res.data.token);
        localStorage.setItem('fc_token', res.data.token);
        localStorage.setItem('fc_user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      } else {
        setErrorMsg('Invalid login response');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass rounded-2xl p-8 shadow-xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl fintrix-gradient-bg flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-8-6h16" />
          </svg>
        </div>
        <div>
          <p className="text-[14.5px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Finance Copilot</p>
          <p className="text-[11px] text-[#757575]">GST Invoicing & Analytics</p>
        </div>
      </div>

      <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight mb-1">
        Sign in
      </h1>
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-[12.5px] text-red-600 dark:text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-[12.5px] font-semibold text-[#253F59] dark:text-white/80 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="fintrix-input"
            {...register('email')}
          />
          {errors.email && <p className="text-[11.5px] text-[#dc2626] mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">
              Password
            </label>
            <Link href="/forgot-password" className="text-[12px] text-[#53259A] dark:text-[#a78bfa] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="fintrix-input pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11.5px] text-[#dc2626] mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          id="login-submit"
          disabled={isLoading}
          className="w-full btn-fintrix btn-fintrix-primary justify-center h-10 text-[13.5px] mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
            : <>Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-[12.5px] text-[#757575]">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[#53259A] dark:text-[#a78bfa] font-semibold hover:underline">
          Create account
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-5 p-3 rounded-xl border border-[#D8DFE5] dark:border-white/[0.08] bg-[#F4F7FA] dark:bg-white/[0.03]">
        <p className="text-[11.5px] text-[#757575] text-center">
          Demo: <span className="font-semibold text-[#53259A]">admin@demo.com</span> / <span className="font-semibold text-[#53259A]">password123</span>
        </p>
      </div>
    </motion.div>
  );
}
