'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { supabase } from '@/app/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

const AVAILABLE_SYSTEMS = [
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Neurology',
  'Endocrine',
  'Integumentary',
  'Renal',
  'Hematologic',
  'Immunologic',
  'Musculoskeletal',
  'Reproductive',
  'Dermatology',
  'ENT',
  'Psychiatry',
  'Systemic',
  'Immune'
];

function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    section: 'Pharmacology',
    didactic_term: 'Term 1',
    pregnancy_safety: 'Not Specified',
    generic_name: '',
    brand_names: '',
    drug_class: '',
    body_systems: '',
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
    image_url: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      fetchRecord();
    }
  }, [id]);

  const fetchRecord = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setErrorMsg('Failed to load record.');
    } else if (data) {
      setForm({
        section: data.section || 'Pharmacology',
        didactic_term: data.didactic_term || 'Term 1',
        pregnancy_safety: data.pregnancy_safety || 'Not Specified',
        generic_name: data.generic_name || '',
        brand_names: data.brand_names || '',
        drug_class: data.drug_class || '',
        body_systems: data.body_systems || '',
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
        image_url: data.image_url || '',
        notes: data.notes || '',
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSystem = (sys: string) => {
    const currentSystems = form.body_systems
      ? form.body_systems.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    let updatedSystems: string[];
    if (currentSystems.includes(sys)) {
      updatedSystems = currentSystems.filter(s => s !== sys);
    } else {
      updatedSystems = [...currentSystems, sys];
    }

    setForm({
      ...form,
      body_systems: updatedSystems.join(', ')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    const { error } = await supabase
      .from('drugs')
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading record for editing...</div>;
  }

  const isClinical = form.section === 'Clinical Medicine';
  const selectedSystemsList = form.body_systems ? form.body_systems.split(',').map(s => s.trim()) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link
            href={`/view/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Record</h1>
            <p className="text-sm text-slate-500 mt-0.5">Update information for {form.generic_name || 'this entry'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Section</label>
              <select
                name="section"
                value={form.section}
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
                name="didactic_term"
                value={form.didactic_term}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Term 4">Term 4</option>
                <option value="Term 5">Term 5</option>
                <option value="Term 6">Term 6</option>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pregnancy Safety</label>
                <select
                  name="pregnancy_safety"
                  value={form.pregnancy_safety}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Safe">Safe</option>
                  <option value="Use with caution">Use with caution</option>
                  <option value="Contraindicated">Contraindicated</option>
                  <option value="Not Specified">Not Specified</option>
                </select>
              </div>
            )}
          </div>

          {/* MULTI-SYSTEM SELECTOR CHECKBOX GRID */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Body Systems (Click to select multiple)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {AVAILABLE_SYSTEMS.map((sys) => {
                const isSelected = selectedSystemsList.includes(sys);
                return (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => toggleSystem(sys)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {sys}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              name="body_systems"
              value={form.body_systems}
              onChange={handleChange}
              placeholder="Or type custom comma-separated systems..."
              className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* IMAGE URL INPUT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-slate-400" /> Reference Image / Diagram URL
            </label>
            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isClinical && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pregnancy Safety</label>
              <select
                name="pregnancy_safety"
                value={form.pregnancy_safety}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Safe">Safe</option>
                <option value="Use with caution">Use with caution</option>
                <option value="Contraindicated">Contraindicated</option>
                <option value="Not Specified">Not Specified</option>
              </select>
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

          {/* ADDITIONAL NOTES TEXTAREA */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Additional Notes & Personal Pearls</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="Add any extra notes, high-yield reminders, or mnemonics here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

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

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading editor...</div>}>
      <EditForm params={params} />
    </Suspense>
  );
}