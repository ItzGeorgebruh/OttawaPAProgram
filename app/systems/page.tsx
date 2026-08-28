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
  const initialSection = searchParams.get('section') || 'Pharmacology';
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState(initialSystem);
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const sysParam = searchParams.get('system');
    const secParam = searchParams.get('section');
    if (sysParam) setSelectedSystem(sysParam);
    if (secParam) setActiveSection(secParam);
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
    'ENT',
    'Hematologic',
    'Immunologic',
    'Musculoskeletal',
    'Reproductive',
    'Dermatology',
    'Psychiatry'
  ];

  const handleSelectSystem = (sys: string) => {
    setSelectedSystem(sys);
    updateUrl(sys, activeSection);
  };

  const handleSelectSection = (sec: string) => {
    setActiveSection(sec);
    updateUrl(selectedSystem, sec);
  };

  const updateUrl = (sys: string, sec: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sys === 'All') {
      params.delete('system');
    } else {
      params.set('system', sys);
    }
    params.set('section', sec);
    router.replace(`/systems?${params.toString()}`, { scroll: false });
  };

  // Intelligent filter helper ensuring Integumentary is strictly protected and excluded from ENT
  const matchesSystemFilter = (item: any, filter: string) => {
    const itemSystemText = (item.body_systems || '').toLowerCase();
    const target = filter.toLowerCase();

    if (target === 'all') return true;

    // If looking specifically for Integumentary
    if (target === 'integumentary') {
      return itemSystemText.includes('integumentary');
    }

    const tokens = itemSystemText.split(/,\s*|\s+/).map((t: string) => t.trim());

    if (target === 'gastrointestinal') {
      return tokens.includes('gi') || tokens.some((t: string) => t.includes('gastrointestinal'));
    }
    
    if (target === 'genitourinary') {
      return tokens.includes('gu') || tokens.some((t: string) => t.includes('genitourinary'));
    }

    if (target === 'ent') {
      // Never let Integumentary fall into ENT
      if (itemSystemText.includes('integumentary')) {
        return false;
      }

      if (
        tokens.some((t: string) => 
          t.includes('ent') || 
          t.includes('otic') || 
          t.includes('ocular') || 
          t.includes('ophthalm') || 
          t.includes('otolaryngology') ||
          t.includes('special senses')
        )
      ) {
        return true;
      }
      
      const combinedText = `${item.generic_name || ''} ${item.drug_class || ''} ${item.symptoms || ''} ${item.indications || ''}`.toLowerCase();
      const entKeywords = [
        'ear', 'nose', 'throat', 'otitis', 'sinusitis', 'pharyngitis', 
        'tonsillitis', 'rhinitis', 'laryngitis', 'tinnitus', 'vertigo', 
        'epistaxis', 'parotitis', 'mastoiditis', 'laryngotracheobronchitis',
        'eye', 'vision', 'glaucoma', 'uveitis', 'amblyopia', 'cataract',
        'conjunctivitis', 'retinopathy', 'macular', 'strabismus'
      ];
      return entKeywords.some((keyword: string) => combinedText.includes(keyword));
    }

    return itemSystemText.includes(target);
  };

  // Automatically map otic, ocular, and ENT tags while strictly preserving Integumentary
  const formatBodySystemDisplay = (text: string) => {
    if (!text) return 'General';
    
    const tags = text.split(',').map((t: string) => t.trim());
    const mappedTags = new Set<string>();

    tags.forEach((tag: string) => {
      const lower = tag.toLowerCase();
      if (lower === 'metabolic') return;
      
      // Explicitly keep Integumentary as its own system
      if (lower.includes('integumentary')) {
        mappedTags.add('Integumentary');
      } else if (lower === 'gi' || lower === 'gastrointestinal') {
        mappedTags.add('Gastrointestinal');
      } else if (lower === 'gu' || lower === 'genitourinary') {
        mappedTags.add('Genitourinary');
      } else if (
        lower.includes('otic') || 
        lower.includes('ocular') || 
        lower.includes('ophthalm') || 
        lower.includes('ent') || 
        lower.includes('otolaryngology') ||
        lower.includes('special senses')
      ) {
        mappedTags.add('ENT');
      } else {
        mappedTags.add(tag);
      }
    });

    const result = Array.from(mappedTags);
    return result.length > 0 ? result.join(', ') : 'General';
  };

  const filtered = items.filter(item => {
    const matchesSection = (item.section || 'Pharmacology') === activeSection;
    const matchesSystem = selectedSystem === 'All' || matchesSystemFilter(item, selectedSystem);
    return matchesSection && matchesSystem;
  });

  const backLink = activeSection === 'Clinical Medicine' ? '/clinical' : '/pharmacology';
  const backText = activeSection === 'Clinical Medicine' ? 'Back to Clinical Medicine' : 'Back to Pharmacology';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href={backLink} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition">
            <ArrowLeft className="w-4 h-4" /> {backText}
          </Link>

          <div className="flex bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => handleSelectSection('Pharmacology')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSection === 'Pharmacology' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pharmacology Drugs
            </button>
            <button
              onClick={() => handleSelectSection('Clinical Medicine')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSection === 'Clinical Medicine' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Diseases
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className={`w-7 h-7 ${activeSection === 'Clinical Medicine' ? 'text-emerald-600' : 'text-blue-600'}`} /> 
            {activeSection === 'Clinical Medicine' ? 'Clinical Disease Systems' : 'Pharmacology Drug Systems'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeSection === 'Clinical Medicine' ? 'Browse all medical conditions and diseases categorized by organ system.' : 'Browse all medications categorized by organ system.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {primarySystems.map((sys) => (
            <button
              key={sys}
              onClick={() => handleSelectSystem(sys)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                selectedSystem === sys
                  ? `${activeSection === 'Clinical Medicine' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'} text-white`
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
            No {activeSection === 'Clinical Medicine' ? 'diseases' : 'drugs'} found for this body system.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <Link 
                key={item.id} 
                href={`/view/${item.id}?from=systems&system=${encodeURIComponent(selectedSystem)}&section=${encodeURIComponent(activeSection)}`} 
                className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center justify-between group cursor-pointer ${
                  activeSection === 'Clinical Medicine' ? 'hover:border-emerald-300' : 'hover:border-blue-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {item.section || 'General'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      activeSection === 'Clinical Medicine' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {formatBodySystemDisplay(item.body_systems)}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold text-slate-900 transition ${
                    activeSection === 'Clinical Medicine' ? 'group-hover:text-emerald-600' : 'group-hover:text-blue-600'
                  }`}>
                    {item.generic_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {item.brand_names ? `Subtype/Brands: ${item.brand_names}` : item.drug_class || ''}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-300 transition ${
                  activeSection === 'Clinical Medicine' ? 'group-hover:text-emerald-600' : 'group-hover:text-blue-600'
                }`} />
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