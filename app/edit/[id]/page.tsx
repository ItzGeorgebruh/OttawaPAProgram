'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/app/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';

export default function EditMedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    folder: 'Pharmacology',
    term: 'Term 1',
    pregnancy_safety: 'Not Specified',
    generic_name: '',
    brand_names: '',
    drug_class: '',
    body_systems: 'Cardiovascular',
    mechanism_of_action: '',
    indications: '',
    route: '',
    side_effects: '',
    contraindications: '',
    clinical_pearls: '',
    pathophysiology: '',
    cause: '',
    symptoms: '',
    diagnostics_labs: '',
    treatment: '',
    complications: '',
  });

  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching record:', error);
      setErrorMsg('Failed to load record.');
    } else if (data) {
      setForm({
        folder: data.folder || 'Pharmacology',
        term: data.term || 'Term 1',
        pregnancy_safety: data.pregnancy_safety || 'Not Specified',
        generic_name: data.generic_name || '',
        brand_names: data.brand_names || '',
        drug_class: data.drug_class || '',
        body_systems: data.body_systems || 'Cardiovascular',
        mechanism_of_action: data.mechanism_of_action || '',
        indications: data.indications || '',
        route: data.route || '',
        side_effects: data.side_effects || '',
        contraindications: data.contraindications || '',
        clinical_pearls: data.clinical_pearls || '',
        pathophysiology: data.pathophysiology || '',
        cause: data.cause || '',
        symptoms: data.symptoms || '',
        diagnostics_labs: data.diagnostics_labs || '',
        treatment: data.treatment || '',
        complications: data.complications || '',
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAIFill = async () => {
    if (!form.generic_name) {
      alert('Please enter a name before running AI Auto-Fill.');
      return;
    }

    setGenerating(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: form.generic_name, type: form.folder }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate AI data.');

      setForm((prev) => ({
        ...prev,
        brand_names: data.brand_names || prev.brand_names,
        drug_class: data.drug_class || prev.drug_class,
        body_systems: data.body_systems || prev.body_systems,
        mechanism_of_action: data.mechanism_of_action || data.mechanism || prev.mechanism_of_action,
        indications: data.indications || prev.indications,
        route: data.route || prev.route,
        side_effects: data.side_effects || prev.side_effects,
        contraindications: data.contraindications || prev.contraindications,
        clinical_pearls: data.clinical_pearls || prev.clinical_pearls,
        pathophysiology: data.pathophysiology || prev.pathophysiology,
        cause: data.cause || prev.cause,
        symptoms: data.symptoms || prev.symptoms,
        diagnostics_labs: data.diagnostics_labs || prev.diagnostics_labs,
        treatment: data.treatment || prev.treatment,
        complications: data.complications || prev.complications,
      }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating content with AI.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    const { error } = await supabase
      .from('medications')
      .update(form)
      .eq('id', id);

    if (error) {
      console.error('Error updating record:', error);
      setErrorMsg(error.message);
      setSaving(false);
    } else {
      router.push(`/view/${id}`);
      router.refresh();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading editor...</div>;
  }

  const isClinical = form.folder === 'Clinical Medicine';
  const cancelLink = isClinical ? '/clinical' : '/pharmacology';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link
            href={cancelLink}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Entry</h1>
              <p className="text-sm text-slate-500 mt-0.5">Update details for {form.generic_name}</p>
            </div>
            
            <button
              type="button"
              onClick={handleAIFill}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'AI Generating...' : 'AI Auto-Fill'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Section</label>
              <select
                name="folder"
                value={form.folder}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Pharmacology">Pharmacology</option>
                <option value="Clinical Medicine">Clinical Medicine</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Didactic Term</label>
              <select
                name="term"
                value={form.term}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Term 4">Term 4</option>
                <option value="Clinical Year">Clinical Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {isClinical ? 'Disease / Condition Name' : 'Generic Name'}
              </label>
              <input
                type="text"
                name="generic_name"
                value={form.generic_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {isClinical ? 'Subtype / Variant' : 'Brand Names'}
              </label>
              <input
                type="text"
                name="brand_names"
                value={form.brand_names}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!isClinical ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Drug Class</label>
                <input
                  type="text"
                  name="drug_class"
                  value={form.drug_class}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Body System</label>
                <input
                  type="text"
                  name="body_systems"
                  value={form.body_systems}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {!isClinical && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Body System</label>
                <input
                  type="text"
                  name="body_systems"
                  value={form.body_systems}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pregnancy Safety</label>
                <select
                  name="pregnancy_safety"
                  value={form.pregnancy_safety}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Safe (Category A/B)">Safe (Category A/B)</option>
                  <option value="Use with Caution (Category C)">Use with Caution (Category C)</option>
                  <option value="Contraindicated / Unsafe (Category D/X)">Contraindicated / Unsafe (Category D/X)</option>
                  <option value="Not Specified">Not Specified</option>
                </select>
              </div>
            </div>
          )}

          {isClinical ? (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pathology (Pathophysiology)</label>
                  <textarea name="pathophysiology" rows={3} value={form.pathophysiology} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Cause</label>
                  <textarea name="cause" rows={3} value={form.cause} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Signs / Symptoms</label>
                  <textarea name="symptoms" rows={3} value={form.symptoms} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Diagnosis / Tests Needed</label>
                  <textarea name="diagnostics_labs" rows={3} value={form.diagnostics_labs} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Treatment</label>
                  <textarea name="treatment" rows={3} value={form.treatment} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Consequences (Complications)</label>
                  <textarea name="complications" rows={3} value={form.complications} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mechanism of Action</label>
                <textarea name="mechanism_of_action" rows={3} value={form.mechanism_of_action} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Indications</label>
                  <textarea name="indications" rows={3} value={form.indications} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Route</label>
                  <textarea name="route" rows={3} value={form.route} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Side Effects</label>
                  <textarea name="side_effects" rows={3} value={form.side_effects} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Contraindications</label>
                  <textarea name="contraindications" rows={3} value={form.contraindications} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Clinical Pearls</label>
                <textarea name="clinical_pearls" rows={3} value={form.clinical_pearls} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}