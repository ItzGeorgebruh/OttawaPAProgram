'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/app/supabase';
import Link from 'next/link';
import { ArrowLeft, Home, Star, Search, ExternalLink, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function FavoritesContent() {
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load starred IDs from localStorage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('pa_app_favorites');
    if (savedFavs) {
      try {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStarredIds(parsed);
          fetchStarredRecords(parsed);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStarredRecords = async (ids: string[]) => {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .in('id', ids);

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };

  const removeFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the card
    const updatedIds = starredIds.filter(favId => favId !== id);
    setStarredIds(updatedIds);
    setRecords(records.filter(record => record.id !== id));
    localStorage.setItem('pa_app_favorites', JSON.stringify(updatedIds));
  };

  const filteredRecords = records.filter(record => {
    const query = searchQuery.toLowerCase();
    const name = (record.generic_name || '').toLowerCase();
    const drugClass = (record.drug_class || '').toLowerCase();
    const systems = (record.body_systems || '').toLowerCase();
    return name.includes(query) || drugClass.includes(query) || systems.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Main Menu
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-7 h-7 fill-amber-500 text-amber-500" /> Starred Study Cards
              </h1>
              <p className="text-sm text-slate-500 mt-1">Your personal collection of high-yield bookmarked topics</p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl">
              {records.length} Saved Items
            </span>
          </div>

          {/* Search Bar */}
          {records.length > 0 && (
            <div className="relative pt-2">
              <Search className="absolute left-3.5 top-5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search starred items by name, class, or system..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Content States */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading your starred items...</div>
        ) : records.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Star className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Starred Items Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              You can star any drug or clinical condition card while browsing by clicking the "Star" button at the top of its detail page.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            No starred items match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRecords.map((record) => {
              const isClinical = record.section === 'Clinical Medicine';
              return (
                <Link
                  key={record.id}
                  href={`/view/${record.id}`}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                        {record.section}
                      </span>
                      <button
                        onClick={(e) => removeFavorite(e, record.id)}
                        title="Remove from favorites"
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition">
                      {record.generic_name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {isClinical ? record.pathophysiology || record.cause || 'Clinical condition record' : record.drug_class || record.mechanism_of_action || 'Pharmacology record'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>{record.didactic_term || 'Term 1'}</span>
                    <span className="text-amber-600 flex items-center gap-1 group-hover:underline">
                      View Card <ExternalLink className="w-3 h-3" />
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

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading favorites...</div>}>
      <FavoritesContent />
    </Suspense>
  );
}