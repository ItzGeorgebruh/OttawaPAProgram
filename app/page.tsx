'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import Link from 'next/link';
import { Search, BookOpen, Star } from 'lucide-react';

export default function MainPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
    const savedFavs = localStorage.getItem('pa_app_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {}
    }
  }, []);

  const fetchRecords = async () => {
    setLoading(false);
    const { data } = await supabase
      .from('drugs')
      .select('id, generic_name, section, body_systems, drug_class')
      .order('generic_name', { ascending: true });

    if (data) setAllRecords(data);
  };

  const filteredRecords = searchTerm.trim() === '' ? [] : allRecords.filter(item => {
    const query = searchTerm.toLowerCase();
    return (
      item.generic_name?.toLowerCase().includes(query) ||
      item.drug_class?.toLowerCase().includes(query) ||
      item.body_systems?.toLowerCase().includes(query)
    );
  });

  const favoriteRecords = allRecords.filter(item => favorites.includes(item.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-2 pt-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            PA Study Hub
          </h1>
          <p className="text-sm text-slate-500">
            Cumulative Didactic, PACKRAT & Clinical Rotation Reference Database
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search any disease, drug name, class, or system..."
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Search Results Dropdown / Box */}
        {searchTerm.trim() !== '' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-3 space-y-2 max-h-96 overflow-y-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Search Results ({filteredRecords.length})
            </p>
            {filteredRecords.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No matching records found.</p>
            ) : (
              filteredRecords.map(item => (
                <Link
                  key={item.id}
                  href={`/view/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.generic_name}</h4>
                    <p className="text-xs text-slate-500">
                      {item.section} &bull; {item.body_systems || 'General'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    View
                  </span>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Main Navigation Hub Grid (Pharmacology & Clinical Medicine Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/pharmacology"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
              Pharmacology Drugs
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse all drug cards, mechanisms of action, side effects, and pregnancy safety ratings.
            </p>
          </Link>

          <Link
            href="/clinical"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
              Clinical Medicine
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse medical conditions, pathophysiology, etiology, diagnosis, and evidence-based treatments.
            </p>
          </Link>
        </div>

        {/* Starred Favorites Section (Local Storage) */}
        {favoriteRecords.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Your Starred Favorites</h3>
            </div>
            <div className="space-y-2">
              {favoriteRecords.map(item => (
                <Link
                  key={item.id}
                  href={`/view/${item.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition border border-slate-200 text-sm font-semibold"
                >
                  <span>{item.generic_name}</span>
                  <span className="text-xs text-slate-400 uppercase font-medium">{item.section}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}