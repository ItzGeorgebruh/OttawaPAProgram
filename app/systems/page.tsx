'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/app/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, ChevronRight, Home, Check, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

function SystemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialSection = searchParams.get('section') || 'Pharmacology';
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['All']);
  const [selectedTerms, setSelectedTerms] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const secParam = searchParams.get('section');
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

  const didacticTerms = ['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Term 5', 'Term 6'];

  const toggleSystem = (sys: string) => {
    if (sys === 'All') {
      setSelectedSystems(['All']);
      return;
    }
    
    let updated = selectedSystems.filter(s => s !== 'All');
    if (updated.includes(sys)) {
      updated = updated.filter(s => s !== sys);
    } else {
      updated.push(sys);
    }
    
    if (updated.length === 0) {
      setSelectedSystems(['All']);
    } else {
      setSelectedSystems(updated);
    }
  };

  const toggleTerm = (term: string) => {
    if (term === 'All') {
      setSelectedTerms(['All']);
      return;
    }
    
    let updated = selectedTerms.filter(t => t !== 'All');
    if (updated.includes(term)) {
      updated = updated.filter(t => t !== term);
    } else {
      updated.push(term);
    }
    
    if (updated.length === 0) {
      setSelectedTerms(['All']);
    } else {
      setSelectedTerms(updated);
    }
  };

  const handleSelectSection = (sec: string) => {
    setActiveSection(sec);
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', sec);
    router.replace(`/systems?${params.toString()}`, { scroll: false });
  };

  const matchesSystemFilter = (item: any, filters: string[]) => {
    if (filters.includes('All')) return true;
    
    const itemSystems = (item.body_systems || '')
      .toLowerCase()
      .split(',')
      .map((s: string) => s.trim());

    return filters.some(target => {
      const lowerTarget = target.toLowerCase();
      
      if (itemSystems.includes(lowerTarget)) return true;

      if (lowerTarget === 'gastrointestinal' && itemSystems.some((s: string) => s.includes('gi') || s.includes('gastrointestinal'))) {
        return true;
      }
      if (lowerTarget === 'genitourinary' && itemSystems.some((s: string) => s.includes('gu') || s.includes('genitourinary'))) {
        return true;
      }
      if (lowerTarget === 'neurology' && itemSystems.some((s: string) => s.includes('neurology') || s.includes('nervous'))) {
        return true;
      }
      if (lowerTarget === 'ent') {
        return itemSystems.some((s: string) => s.includes('ent') || s.includes('otic') || s.includes('ocular') || s.includes('ophthalm') || s.includes('otolaryngology') || s.includes('special senses'));
      }

      return false;
    });
  };

  const matchesTermFilter = (item: any, filters: string[]) => {
    if (filters.includes('All')) return true;
    const itemTerm = (item.didactic_term || '').trim().toLowerCase();
    return filters.some(f => f.trim().toLowerCase() === itemTerm);
  };

  const formatBodySystemDisplay = (text: string) => {
    if (!text) return 'General';
    const tags = text.split(',').map((t: string) => t.trim());
    const mappedTags = new Set<string>();

    tags.forEach((tag: string) => {
      const lower = tag.toLowerCase();
      if (lower === 'metabolic') return;
      
      if (lower.includes('integumentary')) {
        mappedTags.add('Integumentary');
      } else if (lower === 'gi' || lower === 'gastrointestinal') {
        mappedTags.add('Gastrointestinal');
      } else if (lower === 'gu' || lower === 'genitourinary') {
        mappedTags.add('Genitourinary');
      } else if (
        lower.includes('otic') || lower.includes('ocular') || lower.includes('ophthalm') || lower.includes('ent') || lower.includes('otolaryngology') || lower.includes('special senses')
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
    const itemSection = (item.section || '').trim().toLowerCase();
    const currentSection = activeSection.trim().toLowerCase();
    const matchesSection = itemSection === currentSection;

    const query = searchQuery.toLowerCase().trim();
    
    // If user is searching, let the query drive results globally within the section
    if (query) {
      return (
        matchesSection &&
        (item.generic_name?.toLowerCase().includes(query) ||
         item.brand_names?.toLowerCase().includes(query) ||
         item.drug_class?.toLowerCase().includes(query) ||
         item.body_systems?.toLowerCase().includes(query))
      );
    }

    const matchesSys = matchesSystemFilter(item, selectedSystems);
    const matchesTrm = matchesTermFilter(item, selectedTerms);

    return matchesSection && matchesSys && matchesTrm;
  });

  const backLink = activeSection === 'Clinical Medicine' ? '/clinical' : '/pharmacology';
  const backText = activeSection === 'Clinical Medicine' ? 'Back to Clinical Medicine' : 'Back to Pharmacology';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Link href={backLink} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition">
              <ArrowLeft className="w-4 h-4" /> {backText}
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition">
              <Home className="w-4 h-4 text-slate-500" /> Main Menu
            </Link>
          </div>

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
            Select multiple body systems and terms simultaneously to filter your review list.
          </p>
        </div>

        {/* Multi-Select Systems Filter */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter by Body Systems (Multi-select)</span>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => toggleSystem('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5 ${
                selectedSystems.includes('All')
                  ? `${activeSection === 'Clinical Medicine' ? 'bg-emerald-600' : 'bg-blue-600'} text-white`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selectedSystems.includes('All') && <Check className="w-3.5 h-3.5" />} All Systems
            </button>
            {primarySystems.map((sys) => {
              const isSelected = selectedSystems.includes(sys);
              return (
                <button
                  key={sys}
                  onClick={() => toggleSystem(sys)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5 ${
                    isSelected
                      ? `${activeSection === 'Clinical Medicine' ? 'bg-emerald-600' : 'bg-blue-600'} text-white`
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />} {sys}
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Select Terms Filter */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter by Didactic Term (Multi-select)</span>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => toggleTerm('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5 ${
                selectedTerms.includes('All')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selectedTerms.includes('All') && <Check className="w-3.5 h-3.5" />} All Terms
            </button>
            {didacticTerms.map((term) => {
              const isSelected = selectedTerms.includes(term);
              return (
                <button
                  key={term}
                  onClick={() => toggleTerm(term)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />} {term}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, brand, or class within selected filters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading systems...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
            No {activeSection === 'Clinical Medicine' ? 'diseases' : 'drugs'} found matching these selected filters and search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <Link 
                key={item.id} 
                href={`/view/${item.id}?from=systems&section=${encodeURIComponent(activeSection)}`} 
                className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center justify-between group cursor-pointer ${
                  activeSection === 'Clinical Medicine' ? 'hover:border-emerald-300' : 'hover:border-blue-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      activeSection === 'Clinical Medicine' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {formatBodySystemDisplay(item.body_systems)}
                    </span>
                    {item.didactic_term && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-semibold border border-indigo-100">
                        {item.didactic_term}
                      </span>
                    )}
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