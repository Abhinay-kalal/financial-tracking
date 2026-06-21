'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Mail, Phone, MapPin, Building, FileText, Edit2, Trash2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { clientService } from '@/lib/api/services';
import { mockClients } from '@/lib/mock-data';
import type { Client } from '@/types';
import { toast } from 'react-hot-toast';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    billingAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setForm({
      name: '', email: '', phone: '', gstin: '', pan: '',
      billingAddress: '', city: '', state: '', pincode: '', country: 'India'
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      gstin: client.gstin || '',
      pan: client.pan || '',
      billingAddress: client.billingAddress,
      city: client.city,
      state: client.state,
      pincode: client.pincode,
      country: client.country,
    });
    setIsOpen(true);
  };

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await clientService.getAll();
      if (res && res.success) {
        setClients(res.data);
      } else {
        setClients(mockClients);
      }
    } catch (error) {
      setClients(mockClients);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;

    try {
      if (editingClient) {
        const res = await clientService.update(editingClient.id, {
          companyName: form.name,
          ...form
        });
        if (res && res.success) {
          toast.success('Client updated');
          fetchClients();
          setIsOpen(false);
        } else {
          throw new Error('Update failed');
        }
      } else {
        const res = await clientService.create({
          companyName: form.name,
          ...form
        });
        if (res && res.success) {
          toast.success('Client created');
          fetchClients();
          setIsOpen(false);
        } else {
          throw new Error('Create failed');
        }
      }
    } catch (error: any) {
      // Local state fallback
      if (editingClient) {
        const updated = {
          ...editingClient,
          name: form.name,
          email: form.email,
          phone: form.phone,
          gstin: form.gstin,
          billingAddress: form.billingAddress,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
          updatedAt: new Date().toISOString().split('T')[0]
        } as Client;
        setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
        toast.success('Client updated (local)');
      } else {
        const created = {
          id: Math.random().toString(),
          name: form.name,
          email: form.email,
          phone: form.phone,
          gstin: form.gstin,
          billingAddress: form.billingAddress,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
          totalBilled: 0,
          totalReceived: 0,
          outstanding: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        } as Client;
        setClients(prev => [created, ...prev]);
        toast.success('Client created (local)');
      }
      setIsOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const res = await clientService.delete(id);
        if (res && res.success) {
          toast.success('Client deleted');
          fetchClients();
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        setClients(prev => prev.filter(c => c.id !== id));
        toast.success('Client deleted (local)');
      }
    }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">Client Directory</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Manage client details, GST registration details, and invoicing history</p>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </motion.div>

      {/* Search */}
      <motion.div {...fade(0.06)} className="fintrix-card p-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
          <input
            placeholder="Search clients by name, email or GSTIN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="fintrix-input pl-9"
          />
        </div>
      </motion.div>

      {/* Clients Grid */}
      <motion.div {...fade(0.12)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isLoading ? (
             <div className="col-span-full text-center py-12 text-[#757575]">
               Loading clients...
             </div>
          ) : filtered.map(client => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="fintrix-card overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-[16px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">{client.name}</h3>
                    {client.gstin ? (
                      <span className="fintrix-badge badge-purple font-mono text-[10px] py-0.5">
                        GST: {client.gstin}
                      </span>
                    ) : (
                      <span className="fintrix-badge badge-navy text-[10px] py-0.5">Unregistered</span>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    <button
                      className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white"
                      onClick={() => handleOpenEdit(client)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#757575] hover:text-rose-500"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-2 mt-4 text-[12.5px] text-[#757575] font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {client.billingAddress}, {client.city}, {client.state} - {client.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial summary */}
              <div className="bg-[#F4F7FA] dark:bg-[#162A3E]/40 px-5 py-3.5 border-t border-[#D8DFE5] dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] text-[#757575] uppercase font-bold tracking-wider">Billed</p>
                  <p className="text-[13px] font-semibold text-[#0E1C29] dark:text-white mt-0.5">{formatCurrency(client.totalBilled)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#757575] uppercase font-bold tracking-wider">Received</p>
                  <p className="text-[13px] font-semibold text-[#16a34a] mt-0.5">{formatCurrency(client.totalReceived)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#757575] uppercase font-bold tracking-wider">Balance</p>
                  <p className="text-[13px] font-bold text-[#b45309] mt-0.5">{formatCurrency(client.outstanding)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#757575]">
            No clients found matching the query.
          </div>
        )}
      </motion.div>

      {/* Add / Edit Client Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">{editingClient ? 'Edit Client Details' : 'Add New Client'}</DialogTitle>
            <DialogDescription className="text-[12.5px] text-[#757575]">
              Enter the billing details and tax registration numbers for the client.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="client-name" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Client Name *</Label>
              <input
                id="client-name"
                required
                placeholder="e.g. Acme Corporation"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="fintrix-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-email" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Email *</Label>
                <input
                  id="client-email"
                  type="email"
                  required
                  placeholder="accounts@acme.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-phone" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Phone *</Label>
                <input
                  id="client-phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="fintrix-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-gstin" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">GSTIN (Optional)</Label>
                <input
                  id="client-gstin"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={form.gstin}
                  onChange={e => setForm({ ...form, gstin: e.target.value })}
                  className="fintrix-input uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-pan" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">PAN (Optional)</Label>
                <input
                  id="client-pan"
                  placeholder="e.g. ABCDE1234F"
                  value={form.pan}
                  onChange={e => setForm({ ...form, pan: e.target.value })}
                  className="fintrix-input uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client-address" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Billing Address *</Label>
              <input
                id="client-address"
                required
                placeholder="Street address, building..."
                value={form.billingAddress}
                onChange={e => setForm({ ...form, billingAddress: e.target.value })}
                className="fintrix-input"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="client-city" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">City *</Label>
                <input
                  id="client-city"
                  required
                  placeholder="e.g. Bangalore"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-state" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">State *</Label>
                <input
                  id="client-state"
                  required
                  placeholder="e.g. Karnataka"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-pincode" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Pincode *</Label>
                <input
                  id="client-pincode"
                  required
                  placeholder="e.g. 560001"
                  value={form.pincode}
                  onChange={e => setForm({ ...form, pincode: e.target.value })}
                  className="fintrix-input"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <button type="button" className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2">Save Client</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
