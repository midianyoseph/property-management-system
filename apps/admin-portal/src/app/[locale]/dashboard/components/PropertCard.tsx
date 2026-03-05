import { Building2, MapPin, Plus, Bed, Bath } from 'lucide-react';

export function PropertyCard({ property, onAddUnit }: any) {
  // Defensive check: if property is undefined, return null
  if (!property) return null;

  const units = property.units || [];

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
          <Building2 size={32} />
        </div>
        <button onClick={() => onAddUnit(property)} className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm flex items-center gap-2">
           <Plus size={16} /> Add Unit
        </button>
      </div>

      <h3 className="text-2xl font-bold text-slate-900">{property.name}</h3>
      <p className="text-slate-400 text-sm mb-6 flex items-center gap-1"><MapPin size={14} /> {property.city}, {property.state}</p>

      <div className="space-y-2">
        {units.map((unit: any) => (
          <div key={unit.id} className="flex justify-between p-4 bg-slate-50 rounded-2xl border">
            <span className="font-bold">{unit.unit_code}</span>
            <span className="text-indigo-600 font-bold">${unit.monthly_rent}</span>
          </div>
        ))}
      </div>
    </div>
  );
}