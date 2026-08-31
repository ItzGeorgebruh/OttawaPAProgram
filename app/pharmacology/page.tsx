'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/app/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, ArrowLeft, Pill, ChevronRight, Filter, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

function PharmacologyDashboard() {
  const searchParams = useSearchParams();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize state from URL query parameters if returning from a detail view
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTerm, setSelectedTerm] = useState(searchParams.get('term') || 'All');

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .eq('section', 'Pharmacology')
      .order('generic_name', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const filtered = items.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    
    let matchesSearch =
      item.generic_name?.toLowerCase().includes(query) ||
      item.brand_names?.toLowerCase().includes(query) ||
      item.drug_class?.toLowerCase().includes(query);

    if (query === 'antibiotic' || query === 'antibiotics') {
      const antibioticClasses = [
        'penicillin', 'cephalosporin', 'macrolide', 'fluoroquinolone', 
        'tetracycline', 'aminoglycoside', 'carbapenem', 'glycopeptide', 
        'lincosamide', 'sulfonamide', 'oxazolidinone', 'nitroimidazole', 
        'ansamycin', 'nrti', 'nnrti', 'protease inhibitor', 'antibiotic', 'anti-infective'
      ];
      
      const classText = (item.drug_class || '').toLowerCase();
      const mechanismText = (item.mechanism_of_action || '').toLowerCase();
      
      matchesSearch = antibioticClasses.some(keyword => 
        classText.includes(keyword) || mechanismText.includes(keyword)
      );
    } else if (query === 'antiviral' || query === 'antivirals' || query === 'anti-viral' || query === 'anti-virals') {
      const antiviralClasses = [
        'antiviral', 'anti-viral', 'nrti', 'nnrti', 'protease inhibitor', 
        'integrase', 'neuraminidase', ' polymerase inhibitor', 'nucleoside analog'
      ];
      
      const classText = (item.drug_class || '').toLowerCase();
      const mechanismText = (item.mechanism_of_action || '').toLowerCase();
      
      matchesSearch = antiviralClasses.some(keyword => 
        classText.includes(keyword) || mechanismText.includes(keyword)
      );
    } else if (query === 'antifungal' || query === 'antifungals' || query === 'anti-fungal' || query === 'anti-fungals') {
      const antifungalClasses = [
        'antifungal', 'anti-fungal', 'azole', 'echinocandin', 'polyene', 'allylamine'
      ];
      
      const classText = (item.drug_class || '').toLowerCase();
      const mechanismText = (item.mechanism_of_action || '').toLowerCase();
      
      matchesSearch = antifungalClasses.some(keyword => 
        classText.includes(keyword) || mechanismText.includes(keyword)
      );
    }

    const matchesTerm = selectedTerm === 'All' || item.didactic_term === selectedTerm;
    return matchesSearch && matchesTerm;
  });

  const getPregnancyDisplay = (safetyText: string) => {
    const safety = (safetyText || '').toLowerCase();
    
    if (safety.includes('safe') || safety.includes('good') || safety.includes('category a') || safety.includes('category b')) {
      return {
        label: 'Safe',
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    } 
    if (safety.includes('unsafe') || safety.includes('contraindicated') || safety.includes('category x')) {
      return {
        label: 'Not safe',
        style: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    } 
    if (safety.includes('caution') || safety.includes('category c') || safety.includes('category d') || safety.includes('monitor')) {
      return {
        label: 'Use with caution',
        style: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
    
    return {
      label: safetyText || 'Not Specified',
      style: 'bg-slate-100 text-slate-600 border-slate-200'
    };
  };

  const formatBodySystemDisplay = (text: string) => {
    if (!text) return 'General';
    
    const tags = text.split(',').map(t => t.trim());
    const mappedTags = new Set<string>();

    tags.forEach(tag => {
      const lower = tag.toLowerCase();
      if (lower === 'metabolic') return;
      
      if (lower === 'gi' || lower === 'gastrointestinal') {
        mappedTags.add('Gastrointestinal');
      } else if (lower === 'gu' || lower === 'genitourinary') {
        mappedTags.add('Genitourinary');
      } else {
        mappedTags.add(tag);
      }
    });

    const result = Array.from(mappedTags);
    return result.length > 0 ? result.join(', ') : 'General';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition">
            <ArrowLeft className="w-4 h-4" /> Back to Main
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/systems" className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition">
              <Layers className="w-4 h-4 text-blue-600" /> View by Body Systems
            </Link>
            <Link href="/admin?folder=Pharmacology" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
              <Plus className="w-4 h-4" /> Add New Drug
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Pill className="text-blue-600 w-7 h-7" /> Pharmacology Database
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view all recorded medications by term.</p>
        </div>

        {/* Search Bar & Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search drugs or type 'antibiotics', 'antivirals', 'antifungals'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-transparent text-sm focus:outline-none font-medium text-slate-700 cursor-pointer"
            >
              <option value="All">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
              <option value="Term 4">Term 4</option>
              <option value="Term 5">Term 5</option>
              <option value="Term 6">Term 6</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading pharmacology items...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
            No drugs found matching this term or search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const pregnancyDisplay = getPregnancyDisplay(item.pregnancy_safety);

              // Build URL with search and term parameters preserved for the back button
              const queryParams = new URLSearchParams();
              queryParams.set('from', 'pharmacology');
              if (searchQuery) queryParams.set('search', searchQuery);
              if (selectedTerm !== 'All') queryParams.set('term', selectedTerm);

              const detailUrl = `/view/${item.id}?${queryParams.toString()}`;

              return (
                <Link 
                  key={item.id} 
                  href={detailUrl} 
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">
                          {formatBodySystemDisplay(item.body_systems)}
                        </span>
                        {item.didactic_term && (
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-semibold border border-indigo-100">
                            {item.didactic_term}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {item.generic_name}
                      </h3>
                      {item.brand_names && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Brands: {item.brand_names}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      {item.drug_class || 'Unclassified'}
                    </span>
                    
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${pregnancyDisplay.style}`}>
                      {pregnancyDisplay.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PharmacologyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <PharmacologyDashboard />
    </Suspense>
  );
}