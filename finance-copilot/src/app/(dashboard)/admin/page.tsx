'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Users, Server, HardDrive, Database,
  Activity, Cpu, Zap, Globe
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const initialUsers = [
  { id: '1', name: 'Abhinay Kumar', email: 'abhinay@financecopilot.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Sarah Patel', email: 'sarah@financecopilot.com', role: 'founder', status: 'active' },
  { id: '3', name: 'Rajesh Sharma', email: 'rajesh@financecopilot.com', role: 'accountant', status: 'active' },
  { id: '4', name: 'Vijay Iyer', email: 'vijay@financecopilot.com', role: 'viewer', status: 'suspended' },
];

const diagnostics = [
  {
    icon: Users,
    label: 'Active Sessions',
    value: '14 / 20 Users',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: Server,
    label: 'Server CPU',
    value: '4.2% Load',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: HardDrive,
    label: 'API Latency',
    value: '18 ms',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    icon: Database,
    label: 'DB Connection',
    value: 'Healthy',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    valueClass: 'text-emerald-600',
  },
];

const featureFlags = [
  {
    id: 'aiCopilot',
    icon: Zap,
    label: 'Finance AI Copilot',
    desc: 'ChatGPT-powered natural language insights.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'gstEWayBill',
    icon: Activity,
    label: 'GST E-Way Bill Integration',
    desc: 'Generate e-way transport bills directly.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    id: 'recurringInvoicing',
    icon: Cpu,
    label: 'Recurring Invoices',
    desc: 'Subscription models and automatic schedules.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    id: 'multiCurrency',
    icon: Globe,
    label: 'Multi-Currency Invoicing',
    desc: 'Invoice clients in USD, EUR, GBP, etc.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
];

const roleColors: Record<string, string> = {
  admin: 'badge-purple',
  founder: 'badge-navy',
  accountant: 'badge-amber',
  viewer: 'badge-green',
};

export default function AdminPage() {
  const [users, setUsers] = useState(initialUsers);
  const [flags, setFlags] = useState<Record<string, boolean>>({
    aiCopilot: true,
    gstEWayBill: false,
    recurringInvoicing: true,
    multiCurrency: false,
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-1">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'Instrument Sans, Inter, sans-serif' }}>
            Admin Console
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            System diagnostics, platform metrics, and user access management.
          </p>
        </div>
      </motion.div>

      {/* ── Diagnostic Stat Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {diagnostics.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06 }}
            className="stat-card flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${d.bg}`}>
              <d.icon className={`w-5 h-5 ${d.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: 'rgb(var(--muted-foreground))' }}>
                {d.label}
              </p>
              <p className={`text-base font-bold ${d.valueClass ?? ''}`} style={{ fontFamily: 'Instrument Sans, Inter, sans-serif' }}>
                {d.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── User Role Management ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="fintrix-card lg:col-span-2 overflow-hidden"
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'rgb(var(--muted-foreground))' }} />
              <h2 className="font-semibold text-sm" style={{ fontFamily: 'Instrument Sans, Inter, sans-serif' }}>
                User Role Management
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="fintrix-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.05 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #53259A 0%, #6B3AB1 100%)' }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{u.name}</div>
                          <div className="text-xs" style={{ color: 'rgb(var(--muted-foreground))' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Select value={u.role} onValueChange={val => handleRoleChange(u.id, val)}>
                        <SelectTrigger
                          className="w-32 h-8 text-xs capitalize"
                          style={{
                            background: 'rgb(var(--background))',
                            borderColor: 'rgb(var(--border))',
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="founder">Founder</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <span className={`fintrix-badge ${u.status === 'active' ? 'badge-green' : 'badge-red'} capitalize`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`btn-fintrix text-xs px-3 py-1.5 ${
                          u.status === 'active'
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Feature Flags ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="fintrix-card overflow-hidden"
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: 'rgb(var(--muted-foreground))' }} />
              <h2 className="font-semibold text-sm" style={{ fontFamily: 'Instrument Sans, Inter, sans-serif' }}>
                Global Feature Flags
              </h2>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
            {featureFlags.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.06 }}
                className="px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${f.bg}`}>
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <div className="min-w-0">
                    <Label
                      htmlFor={`flag-${f.id}`}
                      className="text-sm font-semibold cursor-pointer block truncate"
                    >
                      {f.label}
                    </Label>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgb(var(--muted-foreground))' }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
                <Switch
                  id={`flag-${f.id}`}
                  checked={flags[f.id]}
                  onCheckedChange={val => setFlags(prev => ({ ...prev, [f.id]: val }))}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Role Permission Matrix ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="fintrix-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" style={{ color: 'rgb(var(--muted-foreground))' }} />
            <h2 className="font-semibold text-sm" style={{ fontFamily: 'Instrument Sans, Inter, sans-serif' }}>
              Role Permission Matrix
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fintrix-table">
            <thead>
              <tr>
                <th>Permission</th>
                <th className="text-center">Admin</th>
                <th className="text-center">Founder</th>
                <th className="text-center">Accountant</th>
                <th className="text-center">Viewer</th>
              </tr>
            </thead>
            <tbody>
              {[
                { perm: 'View Dashboard', admin: true, founder: true, accountant: true, viewer: true },
                { perm: 'Create Invoice', admin: true, founder: true, accountant: true, viewer: false },
                { perm: 'Approve Payables', admin: true, founder: true, accountant: false, viewer: false },
                { perm: 'Manage Users', admin: true, founder: false, accountant: false, viewer: false },
                { perm: 'View Reports', admin: true, founder: true, accountant: true, viewer: false },
                { perm: 'System Settings', admin: true, founder: false, accountant: false, viewer: false },
              ].map((row, i) => (
                <motion.tr
                  key={row.perm}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                >
                  <td className="font-medium">{row.perm}</td>
                  {(['admin', 'founder', 'accountant', 'viewer'] as const).map(role => (
                    <td key={role} className="text-center">
                      {row[role] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
