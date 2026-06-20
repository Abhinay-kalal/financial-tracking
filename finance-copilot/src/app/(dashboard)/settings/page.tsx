'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Building, CreditCard, Bell, Moon, Sun, Check
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Form states
  const [company, setCompany] = useState({
    name: 'Finance Copilot Inc.',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    address: '100 Fintech Heights, Outer Ring Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560103',
    bankName: 'HDFC Bank',
    accountNumber: '50100482910543',
    ifscCode: 'HDFC0000123',
  });

  const [notifications, setNotifications] = useState({
    emailInvoices: true,
    dueReminders: true,
    weeklyDigest: false,
    smsAlerts: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#6B3AB1] dark:text-[#a78bfa]" /> Account Settings
          </h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Configure your company tax registration details, bank accounts, and notifications</p>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={handleSave}>
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" /> Settings Saved
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </motion.div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile */}
          <motion.div {...fade(0.06)} className="fintrix-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Building className="w-5 h-5 text-[#6B3AB1] dark:text-[#a78bfa]" />
              <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Company Profile & GSTIN</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="comp-name" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Company Name *</Label>
                <input
                  id="comp-name"
                  required
                  value={company.name}
                  onChange={e => setCompany({ ...company, name: e.target.value })}
                  className="fintrix-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="comp-gstin" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Company GSTIN *</Label>
                  <input
                    id="comp-gstin"
                    required
                    value={company.gstin}
                    onChange={e => setCompany({ ...company, gstin: e.target.value })}
                    className="fintrix-input font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="comp-pan" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Company PAN *</Label>
                  <input
                    id="comp-pan"
                    required
                    value={company.pan}
                    onChange={e => setCompany({ ...company, pan: e.target.value })}
                    className="fintrix-input font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comp-addr" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Street Address *</Label>
                <input
                  id="comp-addr"
                  required
                  value={company.address}
                  onChange={e => setCompany({ ...company, address: e.target.value })}
                  className="fintrix-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="comp-city" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">City</Label>
                  <input
                    id="comp-city"
                    value={company.city}
                    onChange={e => setCompany({ ...company, city: e.target.value })}
                    className="fintrix-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="comp-state" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">State</Label>
                  <input
                    id="comp-state"
                    value={company.state}
                    onChange={e => setCompany({ ...company, state: e.target.value })}
                    className="fintrix-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="comp-pin" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Pincode</Label>
                  <input
                    id="comp-pin"
                    value={company.pincode}
                    onChange={e => setCompany({ ...company, pincode: e.target.value })}
                    className="fintrix-input"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bank details */}
          <motion.div {...fade(0.12)} className="fintrix-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-[#6B3AB1] dark:text-[#a78bfa]" />
              <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Bank Account (Payouts Details)</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bank-name" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Bank Name</Label>
                  <input
                    id="bank-name"
                    value={company.bankName}
                    onChange={e => setCompany({ ...company, bankName: e.target.value })}
                    className="fintrix-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-ifsc" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">IFSC Code</Label>
                  <input
                    id="bank-ifsc"
                    value={company.ifscCode}
                    onChange={e => setCompany({ ...company, ifscCode: e.target.value })}
                    className="fintrix-input font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bank-acc" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Account Number</Label>
                <input
                  id="bank-acc"
                  value={company.accountNumber}
                  onChange={e => setCompany({ ...company, accountNumber: e.target.value })}
                  className="fintrix-input font-mono"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Preference switches */}
        <div className="space-y-6">
          {/* Theme setting */}
          <motion.div {...fade(0.18)} className="fintrix-card p-5">
            <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-4">Appearance Theme</h2>
            <div className="flex gap-2 bg-white dark:bg-[#162A3E]">
              <button
                type="button"
                className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-[13px] border transition-all ${
                  mounted && theme === 'dark'
                    ? 'bg-[#53259A] text-white border-transparent'
                    : 'bg-transparent text-[#757575] border-[#D8DFE5] dark:border-white/[0.08]'
                }`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
              <button
                type="button"
                className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-[13px] border transition-all ${
                  mounted && theme === 'light'
                    ? 'bg-[#53259A] text-white border-transparent'
                    : 'bg-transparent text-[#757575] border-[#D8DFE5] dark:border-white/[0.08]'
                }`}
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
            </div>
          </motion.div>

          {/* Email / SMS alerts */}
          <motion.div {...fade(0.24)} className="fintrix-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-[#6B3AB1] dark:text-[#a78bfa]" />
              <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Notification Preferences</h2>
            </div>
            <div className="space-y-6 bg-white dark:bg-[#162A3E]">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-email" className="text-[13px] font-semibold text-[#0E1C29] dark:text-white">Invoice Status Alerts</Label>
                  <p className="text-[10px] text-[#757575]">Receive emails when invoices are opened or paid.</p>
                </div>
                <Switch
                  id="notify-email"
                  checked={notifications.emailInvoices}
                  onCheckedChange={val => setNotifications({ ...notifications, emailInvoices: val })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-due" className="text-[13px] font-semibold text-[#0E1C29] dark:text-white">Due Date Warnings</Label>
                  <p className="text-[10px] text-[#757575]">Alerts for overdue client receivables.</p>
                </div>
                <Switch
                  id="notify-due"
                  checked={notifications.dueReminders}
                  onCheckedChange={val => setNotifications({ ...notifications, dueReminders: val })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-digest" className="text-[13px] font-semibold text-[#0E1C29] dark:text-white">Weekly Summary Digest</Label>
                  <p className="text-[10px] text-[#757575]">Receive weekly cash flow breakdowns.</p>
                </div>
                <Switch
                  id="notify-digest"
                  checked={notifications.weeklyDigest}
                  onCheckedChange={val => setNotifications({ ...notifications, weeklyDigest: val })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-sms" className="text-[13px] font-semibold text-[#0E1C29] dark:text-white">SMS Payment Confirmations</Label>
                  <p className="text-[10px] text-[#757575]">Receive phone alerts for successful pay-ins.</p>
                </div>
                <Switch
                  id="notify-sms"
                  checked={notifications.smsAlerts}
                  onCheckedChange={val => setNotifications({ ...notifications, smsAlerts: val })}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
