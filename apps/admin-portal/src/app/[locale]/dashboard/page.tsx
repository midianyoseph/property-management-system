'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, AlertCircle, Home, FileWarning, ArrowRight, Building2, ChevronRight } from 'lucide-react';

// Hooks & Components
import { useApi } from './hooks/useApi';
import { Sidebar } from './components/Sidebar';
import { PropertyCard } from './components/PropertCard';

export default function AdminDashboard() {
  const { apiRequest } = useApi();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New State: Track which status filter is active
  const [activeFilter, setActiveFilter] = useState<'LATE' | 'VACANT' | 'INACTIVE_LEASE' | null>(null);

  const loadData = useCallback(async () => {
    try {
      const json = await apiRequest('/api/properties');
      setProperties(json.data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    let vacantUnits = 0;
    let latePayments = 0;
    let inactiveLeases = 0;

    properties.forEach((p: any) => {
      p.units?.forEach((u: any) => {
        if (!u.is_occupied) vacantUnits++;
        if (u.payment_status === 'late') latePayments++;
        if (u.lease_status !== 'active' && u.is_occupied) inactiveLeases++;
      });
    });

    return { vacantUnits, latePayments, inactiveLeases };
  }, [properties]);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Click a status card to filter units</p>
        </header>

        {/* --- SECTION 1, 2, 3: STATUS CARDS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* LATE PAYMENTS - MADE OBVIOUS */}
          <button 
            onClick={() => setActiveFilter(activeFilter === 'LATE' ? null : 'LATE')}
            className={`flex flex-col p-6 rounded-[32px] border-2 transition-all text-left ${
              activeFilter === 'LATE' ? 'border-rose-500 bg-rose-50 shadow-lg' : 'border-white bg-white shadow-sm hover:border-rose-200'
            }`}
          >
            <div className="bg-rose-500 text-white p-3 rounded-2xl w-fit mb-4">
              <AlertCircle size={28} />
            </div>
            <p className="text-rose-600 font-black uppercase text-xs tracking-widest">Late Payments</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.latePayments}</h2>
            <p className="text-slate-400 text-xs font-bold mt-2">Urgent Action Required</p>
          </button>

          {/* NOT OCCUPIED */}
          <button 
            onClick={() => setActiveFilter(activeFilter === 'VACANT' ? null : 'VACANT')}
            className={`flex flex-col p-6 rounded-[32px] border-2 transition-all text-left ${
              activeFilter === 'VACANT' ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-white bg-white shadow-sm hover:border-indigo-200'
            }`}
          >
            <div className="bg-indigo-600 text-white p-3 rounded-2xl w-fit mb-4">
              <Home size={28} />
            </div>
            <p className="text-indigo-600 font-black uppercase text-xs tracking-widest">Not Occupied</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.vacantUnits}</h2>
            <p className="text-slate-400 text-xs font-bold mt-2">Inventory Available</p>
          </button>

          {/* LEASE INACTIVE */}
          <button 
            onClick={() => setActiveFilter(activeFilter === 'INACTIVE_LEASE' ? null : 'INACTIVE_LEASE')}
            className={`flex flex-col p-6 rounded-[32px] border-2 transition-all text-left ${
              activeFilter === 'INACTIVE_LEASE' ? 'border-amber-500 bg-amber-50 shadow-lg' : 'border-white bg-white shadow-sm hover:border-amber-200'
            }`}
          >
            <div className="bg-amber-500 text-white p-3 rounded-2xl w-fit mb-4">
              <FileWarning size={28} />
            </div>
            <p className="text-amber-600 font-black uppercase text-xs tracking-widest">Lease Inactive</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.inactiveLeases}</h2>
            <p className="text-slate-400 text-xs font-bold mt-2">Expired or Pending</p>
          </button>
        </section>

        {/* --- MANAGE PROPERTIES HEADER --- */}
        <div className="flex items-center justify-between mb-8 border-t border-slate-200 pt-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Summary</h2>
            <p className="text-slate-500 text-sm font-medium">Total Properties: {properties.length}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/properties'}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all group"
          >
            Manage All Properties <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- PROPERTY LIST WITH FILTER LOGIC --- */}
        <div className="grid grid-cols-1 gap-8">
          {properties.map((p: any) => {
            // Filter units based on selection
            const filteredUnits = p.units?.filter((u: any) => {
              if (activeFilter === 'LATE') return u.payment_status === 'late';
              if (activeFilter === 'VACANT') return !u.is_occupied;
              if (activeFilter === 'INACTIVE_LEASE') return u.lease_status !== 'active' && u.is_occupied;
              return true; // Default: show all
            });

            if (activeFilter && filteredUnits.length === 0) return null;

            return (
              <div key={p.id} className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                {/* Property Metadata Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="bg-slate-100 p-4 rounded-3xl text-slate-900">
                      <Building2 size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{p.name}</h3>
                      <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        <span>{p.units?.length} Total Units</span>
                        <span>•</span>
                        <span>{p.city}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-8 px-8 py-4 bg-slate-50 rounded-3xl">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Revenue</p>
                      <p className="text-lg font-black text-slate-900">${p.total_revenue || '0'}</p>
                    </div>
                    <div className="text-center border-l border-slate-200 pl-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Occupancy</p>
                      <p className="text-lg font-black text-indigo-600">{Math.round((p.units?.filter((u:any)=>u.is_occupied).length / p.units?.length) * 100)}%</p>
                    </div>
                  </div>
                </div>

                {/* Units List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUnits.map((u: any) => (
                    <div key={u.id} className="group p-5 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-white hover:border-indigo-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-10 rounded-full ${u.is_occupied ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                        <div>
                          <p className="font-black text-slate-800 text-lg uppercase">{u.unit_code}</p>
                          <p className="text-xs font-bold text-slate-400">{u.is_occupied ? u.tenant_name : 'Empty'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-indigo-600">${u.monthly_rent}</p>
                        <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}