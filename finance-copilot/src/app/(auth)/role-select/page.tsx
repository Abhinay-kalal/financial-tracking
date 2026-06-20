'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Calculator, Eye, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { value: 'admin', label: 'Admin', desc: 'Full access to all features and settings', icon: ShieldCheck, color: 'from-rose-500 to-pink-600' },
  { value: 'founder', label: 'Founder', desc: 'Business overview with key metrics and reports', icon: TrendingUp, color: 'from-indigo-500 to-violet-600' },
  { value: 'accountant', label: 'Accountant', desc: 'Manage invoices, expenses and tax filings', icon: Calculator, color: 'from-emerald-500 to-teal-600' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access to financial data', icon: Eye, color: 'from-amber-500 to-orange-600' },
];

import { authService } from '@/lib/api/services';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function RoleSelectPage() {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authService.selectRole(selected);
      useAuthStore.getState().updateRole(selected);
      
      const userStr = localStorage.getItem('fc_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.role = selected;
        localStorage.setItem('fc_user', JSON.stringify(userObj));
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to set user role. Please try again.');
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

      <h1 className="text-2xl font-bold mb-2">Select your role</h1>
      <p className="text-muted-foreground text-sm mb-6">This helps us customize your experience. You can change it later.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {roles.map((role, i) => (
          <motion.button
            key={role.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected(role.value)}
            id={`role-${role.value}`}
            className={cn(
              'p-4 rounded-2xl border-2 text-left transition-all duration-200',
              selected === role.value
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-border/50 hover:border-border hover:bg-accent/30'
            )}
          >
            <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', role.color)}>
              <role.icon className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-sm">{role.label}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">{role.desc}</p>
          </motion.button>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-rose-500 font-medium text-center">
          {errorMsg}
        </div>
      )}

      <Button
        onClick={handleContinue}
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={!selected || isLoading}
        id="role-continue-btn"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
        ) : (
          <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
        )}
      </Button>
    </motion.div>
  );
}
