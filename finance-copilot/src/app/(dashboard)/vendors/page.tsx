'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Mail, Phone, MapPin, Building, CreditCard, Edit2, Trash2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { vendorService } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils';
import type { Vendor } from '@/types';
import { toast } from 'react-hot-toast';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: 'software',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setForm({
      name: '', email: '', phone: '', gstin: '', pan: '',
      address: '', city: '', state: '', pincode: '',
      category: 'software', bankName: '', accountNumber: '', ifscCode: ''
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      gstin: vendor.gstin || '',
      pan: vendor.pan || '',
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      pincode: vendor.pincode,
      category: vendor.category,
      bankName: vendor.bankName || '',
      accountNumber: vendor.accountNumber || '',
      ifscCode: vendor.ifscCode || '',
    });
    setIsOpen(true);
  };

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const res = await vendorService.getAll();
      if (res.success) {
        setVendors(res.data);
      }
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  import('react').then(React => {
    React.useEffect(() => {
      fetchVendors();
    }, []);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;

    try {
      if (editingVendor) {
        const res = await vendorService.update(editingVendor.id, {
          vendorName: form.name,
          ...form
        });
        if (res.success) {
          toast.success('Vendor updated');
          fetchVendors();
          setIsOpen(false);
        }
      } else {
        const res = await vendorService.create({
          vendorName: form.name,
          ...form
        });
        if (res.success) {
          toast.success('Vendor created');
          fetchVendors();
          setIsOpen(false);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save vendor');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        const res = await vendorService.delete(id);
        if (res.success) {
          toast.success('Vendor deleted');
          fetchVendors();
        }
      } catch (error) {
        toast.error('Failed to delete vendor');
      }
    }
  };

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase()) ||
    (v.gstin && v.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">Vendor Management</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Organize supplier contact information, categories, and payment instructions</p>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </motion.div>

      {/* Search */}
      <motion.div {...fade(0.06)} className="fintrix-card p-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
          <input
            placeholder="Search vendors by name, category, or GSTIN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="fintrix-input pl-9"
          />
        </div>
      </motion.div>

      {/* Vendors Grid */}
      <motion.div {...fade(0.12)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-[#757575]">
              Loading vendors...
            </div>
          ) : filtered.map(vendor => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="fintrix-card overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-[16px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">{vendor.name}</h3>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      <span className="fintrix-badge badge-navy capitalize text-[10px] py-0.5">
                        {vendor.category}
                      </span>
                      {vendor.gstin && (
                        <span className="fintrix-badge badge-purple font-mono text-[10px] py-0.5">
                          GST: {vendor.gstin}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button
                      className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white"
                      onClick={() => handleOpenEdit(vendor)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#757575] hover:text-rose-500"
                      onClick={() => handleDelete(vendor.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-2 mt-4 text-[12.5px] text-[#757575] font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {vendor.address}, {vendor.city}, {vendor.state} - {vendor.pincode}
                    </span>
                  </div>
                  {vendor.accountNumber && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#D8DFE5] dark:border-white/[0.06] mt-2">
                      <CreditCard className="w-3.5 h-3.5 text-[#6B3AB1] dark:text-[#a78bfa] flex-shrink-0" />
                      <span className="font-mono text-[11.5px]">
                        {vendor.bankName} (A/C: *{vendor.accountNumber.slice(-4)})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial summary */}
              <div className="bg-[#F4F7FA] dark:bg-[#162A3E]/40 px-5 py-3.5 border-t border-[#D8DFE5] dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] text-[#757575] uppercase font-bold tracking-wider">Billed</p>
                  <p className="text-[13px] font-semibold text-[#0E1C29] dark:text-white mt-0.5">{formatCurrency(vendor.totalBilled)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#757575] uppercase font-bold tracking-wider">Paid</p>
                  <p className="text-[13px] font-semibold text-[#16a34a] mt-0.5">{formatCurrency(vendor.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#757575] uppercase font-bold tracking-wider">Outstanding</p>
                  <p className="text-[13px] font-bold text-[#b45309] mt-0.5">{formatCurrency(vendor.outstanding)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#757575]">
            No vendors found.
          </div>
        )}
      </motion.div>

      {/* Add / Edit Vendor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">{editingVendor ? 'Edit Vendor Details' : 'Add New Vendor'}</DialogTitle>
            <DialogDescription className="text-[12.5px] text-[#757575]">
              Set up a vendor profile including contact info and bank payment details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="vendor-name" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Vendor / Company Name *</Label>
              <input
                id="vendor-name"
                required
                placeholder="e.g. AWS India"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="fintrix-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="vendor-email" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Email *</Label>
                <input
                  id="vendor-email"
                  type="email"
                  required
                  placeholder="billing@vendor.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vendor-phone" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Phone *</Label>
                <input
                  id="vendor-phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="fintrix-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vendor-category" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={val => setForm({ ...form, category: val })}
                >
                  <SelectTrigger id="vendor-category" className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                    <SelectItem value="software" className="text-[13px]">Software</SelectItem>
                    <SelectItem value="rent" className="text-[13px]">Rent</SelectItem>
                    <SelectItem value="supplies" className="text-[13px]">Supplies</SelectItem>
                    <SelectItem value="utilities" className="text-[13px]">Utilities</SelectItem>
                    <SelectItem value="travel" className="text-[13px]">Travel</SelectItem>
                    <SelectItem value="other" className="text-[13px]">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vendor-gstin" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">GSTIN (Optional)</Label>
                <input
                  id="vendor-gstin"
                  placeholder="29ABCDE1234F1Z5"
                  value={form.gstin}
                  onChange={e => setForm({ ...form, gstin: e.target.value })}
                  className="fintrix-input uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vendor-pan" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">PAN (Optional)</Label>
                <input
                  id="vendor-pan"
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={e => setForm({ ...form, pan: e.target.value })}
                  className="fintrix-input uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vendor-address" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Address *</Label>
              <input
                id="vendor-address"
                required
                placeholder="Street address..."
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="fintrix-input"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vendor-city" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">City *</Label>
                <input
                  id="vendor-city"
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vendor-state" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">State *</Label>
                <input
                  id="vendor-state"
                  required
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vendor-pincode" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Pincode *</Label>
                <input
                  id="vendor-pincode"
                  required
                  value={form.pincode}
                  onChange={e => setForm({ ...form, pincode: e.target.value })}
                  className="fintrix-input"
                />
              </div>
            </div>

            {/* Bank details */}
            <div className="pt-3 border-t border-[#D8DFE5] dark:border-white/[0.06] space-y-3">
              <Label className="text-[12px] font-semibold text-[#6B3AB1] dark:text-[#a78bfa]">Vendor Bank Transfer Instructions</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bank-name" className="text-[11.5px] text-[#757575]">Bank Name</Label>
                  <input
                    id="bank-name"
                    placeholder="e.g. HDFC Bank"
                    value={form.bankName}
                    onChange={e => setForm({ ...form, bankName: e.target.value })}
                    className="fintrix-input text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-number" className="text-[11.5px] text-[#757575]">Account Number</Label>
                  <input
                    id="acc-number"
                    placeholder="e.g. 50100234..."
                    value={form.accountNumber}
                    onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                    className="fintrix-input text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ifsc" className="text-[11.5px] text-[#757575]">IFSC Code</Label>
                  <input
                    id="ifsc"
                    placeholder="e.g. HDFC0000123"
                    value={form.ifscCode}
                    onChange={e => setForm({ ...form, ifscCode: e.target.value })}
                    className="fintrix-input text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <button type="button" className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2">Save Vendor</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
