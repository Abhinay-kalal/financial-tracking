'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand store hydration
    const timer = setTimeout(() => setHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F4F7FA] dark:bg-[#0E1C29]">
        <Loader2 className="w-8 h-8 animate-spin text-[#53259A]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'rgb(244, 247, 250)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
