'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/app/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

function SystemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialSystem = searchParams.get('system') || 'All';
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState(initialSystem);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const sysParam = searchParams.get('system');
    if (sysParam) {
      setSelectedSystem(sysParam);
    }
  }, [searchParams]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .order('generic_name', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const primarySystems = [
    'All',
    'Cardiovascular',
    'Respiratory',
    'Gastrointestinal',
    'Neurology',
    'Endocrine',
    'Integumentary',
    'Renal',
    'Genitourinary',
    'Hematologic',
    'Immunologic',
    'Musculoskeletal',
    'Reproductive',
    'Dermatology',
    'Psychiatry'
  ];

  const handleSelectSystem = (sys: string) => {
    setSelectedSystem(sys);
    const params = new URLSearchParams(searchParams.toString());
    if (sys === 'All') {
      params.delete('system');
    } else {
      params.set('system', sys);
    }
    router.replace(`/systems?${params.toString()}`, { scroll: false });
  };

  // Intelligent filter helper to map shorthand (GI -> Gastrointestinal, GU -> Genitourinary)
  const matchesSystemFilter = (itemSystemText: string, filter: string) => {
    if (!itemSystemText) return false;
    const text = itemSystemText.toLowerCase();
    const target = filter.toLowerCase();

    // Direct substring match (e.g. "Cardiovascular" matches "Cardiovascular, Endocrine")
    if (text.includes(target)) return true;

    // Shorthand mapping aliases
    if (target === 'gastrointestinal' && (text.includes('gi') || text.match(/\bgi\b/))) {
      return true;
    }
    if (target === 'genitourinary' && (text.includes('gu') || text.match(/\bgu\b/))) {
      return true;
    }

    return false;
  };

  const filtered = selectedSystem === 'All' 
    ? items 
    : items.filter(i => matchesSystemFilter(i.body_systems, selectedSystem));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/pharmacology" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition">
            <ArrowLeft className="w-4 h-4" /> Back to Pharmacology
          </Link>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="text-blue-600 w-7 h-7" /> Body Systems Organization
          </h1>
          <p className="text-sm text-slate-500 mt-1">Browse all pharmacology and clinical entries categorized by organ system.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {primarySystems.map((sys) => (
            <button
              key={sys}
              onClick={() => handleSelectSystem(sys)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                selectedSystem === sys
                  ? 'bg-blue-600 text-white shadow-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading systems...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
            No entries found for this body system.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <Link 
                key={item.id} 
                href={`/view/${item.id}?from=systems&system=${encodeURIComponent(selectedSystem)}`} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {item.section || 'General'}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-semibold border border-blue-100">
                      {item.body_systems || 'General'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {item.generic_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {item.brand_names ? `Subtype/Brands: ${item.brand_names}` : item.drug_class || ''}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SystemsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading systems view...</div>}>
      <SystemsContent />
    </Suspense>
  );
}