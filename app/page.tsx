'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/app/supabase';
import Link from 'next/link';
import { Search, BookOpen, Stethoscope, PlusCircle, Star, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

function MainDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedFavs = localStorage.getItem('pa_app_favorites');
    if (savedFavs) {
      try { setStarredIds(JSON.parse(savedFavs)); } catch (e) {}
    }
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drugs')
      .select('id, generic_name, brand_names, drug_class, section, body_systems');

    if (!error && data) setRecords(data);
    setLoading(false);
  };

  const filteredRecords = records.filter(record => {
    return (
      (record.generic_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.brand_names || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.drug_class || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.body_systems || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Navigation Bar with Starred Favorites Button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div></div> {/* Spacer */}
          <Link
            href="/favorites"
            className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Starred Favorites
            {mounted && starredIds.length > 0 && (
              <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {starredIds.length}
              </span>
            )}
          </Link>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-2 pt-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            PA Study Hub
          </h1>
          <p className="text-sm text-slate-500">
            Cumulative Didactic, PACKRAT & Clinical Rotation Reference Database
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search any disease, drug name, class, or system..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Section Cards */}
        {!searchQuery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link 
              href="/pharmacology" 
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">Pharmacology Drugs</h2>
                <p className="text-xs text-slate-500 mt-1">Browse all drug cards, mechanisms of action, side effects, and pregnancy safety ratings.</p>
              </div>
            </Link>

            <Link 
              href="/clinical" 
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">Clinical Medicine</h2>
                <p className="text-xs text-slate-500 mt-1">Browse medical conditions, pathophysiology, etiology, diagnosis, and evidence-based treatments.</p>
              </div>
            </Link>
          </div>
        )}

        {/* Live Search Results Feed */}
        {searchQuery && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Search Results ({filteredRecords.length})
              </h2>
            </div>

            {loading ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">Searching database...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">No matching records found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredRecords.map((record) => {
                  const isStarred = mounted && starredIds.includes(record.id);
                  const isClinical = record.section === 'Clinical Medicine';

                  return (
                    <Link
                      key={record.id}
                      href={`/view/${record.id}`}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {record.section}
                          </span>
                          {record.drug_class && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {record.drug_class}
                            </span>
                          )}
                          {isStarred && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                          {record.generic_name}
                        </h3>
                        {record.brand_names && (
                          <p className="text-xs text-slate-500 truncate">
                            {isClinical ? 'Subtype: ' : 'Brands: '}{record.brand_names}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading portal...</div>}>
      <MainDashboard />
    </Suspense>
  );
}