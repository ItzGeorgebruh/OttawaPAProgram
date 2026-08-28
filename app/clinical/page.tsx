'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import Link from 'next/link';
import { Plus, Search, ArrowLeft, Stethoscope, ChevronRight, Filter } from 'lucide-react';

export default function ClinicalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('All');

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('folder', 'Clinical Medicine')
      .order('generic_name', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand_names?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTerm = selectedTerm === 'All' || item.term === selectedTerm;
    return matchesSearch && matchesTerm;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition">
            <ArrowLeft className="w-4 h-4" /> Back to Main
          </Link>
          <Link href="/admin?folder=Clinical Medicine" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Add New Disease
          </Link>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Stethoscope className="text-emerald-600 w-7 h-7" /> Clinical Medicine Database
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view all recorded disease processes by term.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search diseases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
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
              <option value="Clinical Year">Clinical Year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading clinical items...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
            No diseases found matching this term or search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <Link 
                key={item.id} 
                href={`/view/${item.id}`} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                      {item.generic_name}
                    </h3>
                    {item.term && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-semibold border border-indigo-100">
                        {item.term}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Subtype: {item.brand_names || 'General'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}