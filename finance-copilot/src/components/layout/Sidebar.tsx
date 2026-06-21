'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  FileText, Users, Building2, BarChart3, Settings, ShieldCheck,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft,
  Wallet2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';

const navSections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Income',      href: '/income',      icon: TrendingUp },
      { label: 'Expenses',    href: '/expenses',    icon: TrendingDown },
      { label: 'Receivables', href: '/receivables', icon: ArrowUpRight },
      { label: 'Payables',    href: '/payables',    icon: ArrowDownLeft },
    ],
  },
  {
    label: 'Documents',
    items: [
      { label: 'Invoices',    href: '/invoices',    icon: FileText },
      { label: 'Reports',     href: '/reports',     icon: BarChart3 },
    ],
  },
  {
    label: 'Directory',
    items: [
      { label: 'Clients',     href: '/clients',     icon: Users },
      { label: 'Vendors',     href: '/vendors',     icon: Building2 },
    ],
  },
];

const bottomItems = [
  { label: 'Admin',    href: '/admin',    icon: ShieldCheck },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleCollapse, sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: sidebarCollapsed ? 68 : 256 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:relative flex flex-col h-screen overflow-hidden flex-shrink-0 fintrix-sidebar transition-transform duration-300 ease-in-out md:transition-none md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon mark */}
            <div className="w-8 h-8 rounded-lg fintrix-gradient-bg flex items-center justify-center flex-shrink-0 shadow-md">
              <Wallet2 className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden leading-tight"
                >
                  <p className="text-white font-semibold text-[14px] font-['Instrument_Sans',sans-serif] tracking-tight">Finance</p>
                  <p className="text-[11px] text-white/40 font-medium tracking-wide">Copilot · GST</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fintrix-section-label mb-2"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'fintrix-nav-item group relative',
                        active && 'active',
                        sidebarCollapsed && 'justify-center px-0 w-[44px] mx-auto'
                      )}
                    >
                      <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="whitespace-nowrap overflow-hidden text-[13.5px]"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {/* Tooltip when collapsed */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0E1C29] border border-white/10 rounded-lg text-xs text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                          {item.label}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-3 pb-4 pt-3 border-t border-white/[0.07] space-y-0.5">
        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'fintrix-nav-item group relative',
                  active && 'active',
                  sidebarCollapsed && 'justify-center px-0 w-[44px] mx-auto'
                )}
              >
                <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0E1C29] border border-white/10 rounded-lg text-xs text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-white border border-[#D8DFE5] flex items-center justify-center shadow-md hover:shadow-lg transition-all z-50 text-[#0E1C29]"
      >
        {sidebarCollapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>
    </motion.aside>
    </>
  );
}
