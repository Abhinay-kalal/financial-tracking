'use client';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Bell, Search, Menu, ChevronDown,
  LogOut, User, Settings, CreditCard,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const notifications = [
    { title: 'Invoice #INV-2024-0042 due soon', desc: 'Due in 3 days — ₹1,24,500', time: '2h ago', dot: '#f59e0b' },
    { title: 'Payment received from TechStart', desc: '₹53,100 credited', time: '1d ago', dot: '#22c55e' },
    { title: 'GlobalSoft invoice overdue', desc: 'Overdue by 20 days', time: '2d ago', dot: '#ef4444' },
  ];

  const profileLinks = [
    { icon: User,       label: 'My Profile', href: '/settings' },
    { icon: CreditCard, label: 'Billing',    href: '/settings' },
    { icon: Settings,   label: 'Settings',   href: '/settings' },
  ];

  return (
    <header className="h-[60px] border-b border-[#D8DFE5] dark:border-white/[0.06] bg-white/90 dark:bg-[#0E1C29]/90 backdrop-blur-xl px-5 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#F4F7FA] dark:hover:bg-white/5 transition-colors text-[#0E1C29] dark:text-white/80"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:flex flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
          <input
            placeholder="Search invoices, clients, transactions…"
            className="w-full h-9 pl-9 pr-4 bg-[#F4F7FA] dark:bg-white/5 border border-[#D8DFE5] dark:border-white/[0.07] rounded-lg text-[13px] text-[#0E1C29] dark:text-white/90 placeholder:text-[#757575] outline-none focus:border-[#53259A] focus:ring-2 focus:ring-[#53259A]/10 transition-all"
            id="navbar-search"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center text-[10px] text-[#757575] border border-[#D8DFE5] dark:border-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Theme */}
        <button
          id="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:text-white/50 dark:hover:text-white/90 transition-all"
        >
          {mounted
            ? theme === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:text-white/50 dark:hover:text-white/90 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white dark:border-[#0E1C29]" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-11 w-[320px] bg-white dark:bg-[#162A3E] border border-[#D8DFE5] dark:border-white/[0.08] rounded-xl shadow-2xl shadow-[#0E1C29]/12 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#D8DFE5] dark:border-white/[0.07]">
                  <h3 className="text-[13px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Notifications</h3>
                  <span className="fintrix-badge badge-red text-[10.5px]">3 new</span>
                </div>
                <div className="divide-y divide-[#F4F7FA] dark:divide-white/[0.04]">
                  {notifications.map((n, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 hover:bg-[#F4F7FA] dark:hover:bg-white/[0.03] cursor-pointer transition-colors">
                      <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.dot }} />
                      <div>
                        <p className="text-[12.5px] font-medium text-[#0E1C29] dark:text-white/90 leading-snug">{n.title}</p>
                        <p className="text-[11.5px] text-[#757575] mt-0.5">{n.desc}</p>
                        <p className="text-[10.5px] text-[#757575]/70 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[#D8DFE5] dark:border-white/[0.07]">
                  <button className="w-full text-center text-[12px] text-[#53259A] dark:text-[#a78bfa] font-semibold hover:underline">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#D8DFE5] dark:bg-white/[0.08] mx-1" />

        {/* Profile */}
        <div className="relative">
          <button
            id="profile-menu"
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg hover:bg-[#F4F7FA] dark:hover:bg-white/[0.05] transition-colors border border-transparent hover:border-[#D8DFE5] dark:hover:border-white/[0.08]"
          >
            <div className="w-7 h-7 rounded-lg fintrix-gradient-bg flex items-center justify-center text-white text-[11px] font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12.5px] font-semibold text-[#0E1C29] dark:text-white leading-tight">{user?.name || 'Admin User'}</p>
              <p className="text-[10.5px] text-[#757575] leading-tight capitalize">{user?.role || 'admin'}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#757575] hidden sm:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-11 w-56 bg-white dark:bg-[#162A3E] border border-[#D8DFE5] dark:border-white/[0.08] rounded-xl shadow-2xl shadow-[#0E1C29]/12 p-1.5 z-50"
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-[13px] font-semibold text-[#0E1C29] dark:text-white">{user?.name || 'Admin User'}</p>
                  <p className="text-[11.5px] text-[#757575]">{user?.email || 'admin@company.com'}</p>
                </div>
                <div className="border-t border-[#D8DFE5] dark:border-white/[0.07] my-1" />
                {profileLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { router.push(item.href); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#253F59] dark:text-white/80 hover:bg-[#F4F7FA] dark:hover:bg-white/[0.05] hover:text-[#0E1C29] dark:hover:text-white transition-colors text-left"
                  >
                    <item.icon className="w-3.5 h-3.5 text-[#757575]" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-[#D8DFE5] dark:border-white/[0.07] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#dc2626] hover:bg-[#fef2f2] dark:hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
