'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { supabase } from '@/app/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Helper to format text and colors cleanly for pregnancy safety
const getPregnancyDisplay = (safetyText: string) => {
  const safety = (safetyText || '').toLowerCase();
  
  if (safety.includes('safe') || safety.includes('good') || safety.includes('category a') || safety.includes('category b')) {
    return {
      label: 'Safe',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  } 
  if (safety.includes('unsafe') || safety.includes('contraindicated') || safety.includes('category x') || safety.includes('category d')) {
    return {
      label: 'Not safe',
      style: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  } 
  if (safety.includes('caution') || safety.includes('category c') || safety.includes('monitor')) {
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

// Clean up body system display to omit metabolic and standardize GI/GU
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

function ViewMedicationContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get('from');
  const systemParam = searchParams.get('system');

  const [record, setRecord] = useState<any>(null);
  const [allDrugs, setAllDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRecord();
      fetchAllDrugs();
    }
  }, [id]);

  const fetchRecord = async () => {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) setRecord(data);
  };

  const fetchAllDrugs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('drugs')
      .select('id, generic_name, drug_class, section')
      .eq('section', 'Pharmacology');

    if (data) setAllDrugs(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const { error } = await supabase.from('drugs').delete().eq('id', id);
      if (!error) {
        router.push(record?.section === 'Clinical Medicine' ? '/clinical' : '/pharmacology');
        router.refresh();
      }
    }
  };

  const formatTextAsBullets = (text: string) => {
    if (!text) return <span className="text-slate-400">None specified</span>;
    
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return (
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            {parsed.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      }
    } catch (e) {
      // Not JSON
    }

    const items = text
      .split(/;\s*|,\s*(?![^()]*\))|\.\s+/)
      .map(item => item.trim().replace(/\.$/, ''))
      .filter(item => item.length > 0);

    if (items.length <= 1) {
      return <p className="text-sm text-slate-700 whitespace-pre-line">{text}</p>;
    }

    return (
      <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-sm">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderClickableTreatment = (text: string) => {
    if (!text) return <span className="text-slate-400">None specified</span>;
    
    let plainText = text;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        plainText = parsed.join('\n');
      }
    } catch (e) {
      // regular string
    }

    const matchedDrugs = allDrugs.filter(drug => {
      const nameMatch = drug.generic_name && plainText.toLowerCase().includes(drug.generic_name.toLowerCase());
      const classMatch = drug.drug_class && (
        plainText.toLowerCase().includes(drug.drug_class.toLowerCase()) ||
        (drug.drug_class.toLowerCase().includes('ace') && plainText.includes('ACEi')) ||
        (drug.drug_class.toLowerCase().includes('arb') && plainText.includes('ARB'))
      );
      return nameMatch || classMatch;
    });

    if (matchedDrugs.length === 0) {
      return formatTextAsBullets(text);
    }

    return (
      <div className="space-y-3">
        {formatTextAsBullets(text)}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Pharmacology:</span>
          {matchedDrugs.map(drug => (
            <Link
              key={drug.id}
              href={`/view/${drug.id}`}
              className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-lg text-xs font-semibold transition"
            >
              {drug.generic_name} <ExternalLink className="w-3 h-3" />
            </Link>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading details...</div>;
  }

  if (!record) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Record not found.</div>;
  }

  const isClinical = record.section === 'Clinical Medicine';
  
  // Determine dynamic back link preserving system filter if coming from systems view
  let backLink = isClinical ? '/clinical' : '/pharmacology';
  let backText = isClinical ? 'Back to Clinical' : 'Back to Pharmacology';
  if (fromParam === 'systems') {
    backLink = systemParam ? `/systems?system=${encodeURIComponent(systemParam)}` : '/systems';
    backText = systemParam ? `Back to ${systemParam}` : 'Back to Systems';
  }

  const pregnancyDisplay = getPregnancyDisplay(record.pregnancy_safety);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link href={backLink} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition">
            <ArrowLeft className="w-4 h-4" /> {backText}
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/edit/${id}`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
              <Edit className="w-4 h-4" /> Edit
            </Link>
            <button onClick={handleDelete} className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-100 transition shadow-sm cursor-pointer">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-semibold uppercase tracking-wider">
                {record.section} &bull; {formatBodySystemDisplay(record.body_systems)}
              </span>
              {record.didactic_term && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-semibold border border-indigo-100">
                  {record.didactic_term}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
              {record.drug_class || 'Unclassified'}
            </span>

          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{record.generic_name}</h1>
          {record.brand_names && (
            <p className="text-sm text-slate-500 font-medium">
              {isClinical ? 'Subtype: ' : 'Brands: '}{record.brand_names}
            </p>
          )}
        </div>

        {!isClinical ? (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pregnancy Safety Status</h3>
                <p className="text-sm font-medium text-slate-600 mt-0.5">Clinical Risk Evaluation</p>
              </div>
              <span className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border ${pregnancyDisplay.style}`}>
                {pregnancyDisplay.label}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mechanism of Action</h3>
              {formatTextAsBullets(record.mechanism_of_action)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Indications</h3>
                {formatTextAsBullets(record.indications)}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Route</h3>
                {formatTextAsBullets(record.route)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">Side Effects</h3>
                {formatTextAsBullets(record.side_effects)}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500">Contraindications</h3>
                {formatTextAsBullets(record.contraindications)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500">Clinical Pearls</h3>
              {formatTextAsBullets(record.clinical_pearls)}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pathology (Pathophysiology)</h3>
              {formatTextAsBullets(record.pathophysiology)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cause</h3>
                {formatTextAsBullets(record.cause)}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Signs / Symptoms</h3>
                {formatTextAsBullets(record.symptoms)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnosis / Tests Needed</h3>
                {formatTextAsBullets(record.diagnostics_labs)}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Treatment</h3>
                {renderClickableTreatment(record.treatment)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">Consequences (Complications)</h3>
              {formatTextAsBullets(record.complications)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ViewMedicationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading record details...</div>}>
      <ViewMedicationContent params={params} />
    </Suspense>
  );
}