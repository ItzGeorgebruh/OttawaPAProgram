'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, Stethoscope, ChevronRight } from 'lucide-react';

export default function MainPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl w-full space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Medical Reference Database
          </h1>
          <p className="text-base text-slate-500">
            Select a category to view and manage entries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Pharmacology Card */}
          <Link
            href="/pharmacology"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                  Pharmacology
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Browse drugs, mechanisms of action, indications, routes, and side effects.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-blue-600 font-semibold text-sm">
              <span>Open Pharmacology</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Clinical Medicine Card */}
          <Link
            href="/clinical"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition">
                  Clinical Medicine
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Browse diseases, pathology, causes, signs/symptoms, diagnostics, treatments, and consequences.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-semibold text-sm">
              <span>Open Clinical Medicine</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}