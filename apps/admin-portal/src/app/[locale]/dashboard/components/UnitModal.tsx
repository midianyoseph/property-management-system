'use client';

import { useState } from 'react';
import { X, Bed, Bath, DollarSign } from 'lucide-react';

export function UnitModal({ onClose, onSubmit, submitting, propertyName }: any) {
  const [form, setForm] = useState({
    unit_code: '',
    bedrooms: 1,
    bathrooms: 1,
    monthly_rent: 0,
    is_occupied: false // Required by your createUnit service
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Service requires actual numbers and booleans
    const payload = {
      ...form,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      monthly_rent: Number(form.monthly_rent),
      is_occupied: Boolean(form.is_occupied)
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Add Unit</h2>
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mt-1">{propertyName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase ml-1">Unit Code</label>
            <input 
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600" 
              placeholder="e.g. 101-A" 
              value={form.unit_code}
              onChange={(e) => setForm({...form, unit_code: e.target.value})}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><Bed size={12}/> Beds</label>
              <input type="number" className="w-full px-5 py-3 bg-slate-50 border rounded-xl" value={form.bedrooms}
                onChange={(e) => setForm({...form, bedrooms: parseInt(e.target.value)})} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><Bath size={12}/> Baths</label>
              <input type="number" step="0.5" className="w-full px-5 py-3 bg-slate-50 border rounded-xl" value={form.bathrooms}
                onChange={(e) => setForm({...form, bathrooms: parseFloat(e.target.value)})} required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><DollarSign size={12}/> Monthly Rent</label>
            <input type="number" className="w-full px-5 py-3 bg-slate-50 border rounded-xl" placeholder="0" value={form.monthly_rent}
              onChange={(e) => setForm({...form, monthly_rent: parseFloat(e.target.value)})} required />
          </div>

          {/* Occupancy Toggle */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <input 
              type="checkbox" 
              id="occupied"
              className="w-5 h-5 accent-indigo-600"
              checked={form.is_occupied}
              onChange={(e) => setForm({...form, is_occupied: e.target.checked})}
            />
            <label htmlFor="occupied" className="text-sm font-bold text-slate-700">Mark as currently occupied</label>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white font-black py-5 rounded-[20px] hover:bg-black transition-all shadow-xl disabled:opacity-50">
            {submitting ? 'Adding...' : 'Confirm Unit'}
          </button>
        </form>
      </div>
    </div>
  );
}