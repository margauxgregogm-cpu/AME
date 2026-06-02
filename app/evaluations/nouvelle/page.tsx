'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getNoteGlobale, noteColor } from '@/lib/utils';
import type { Fournisseur } from '@/lib/types';
import { Suspense } from 'react';

function NouvelleEvaluationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fournisseur_id: searchParams.get('fournisseur') || '',
    qualite: 3,
    delai: 3,
    prix: 3,
    reactivite: 3,
    commentaire: '',
    date_evaluation: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    supabase.from('fournisseurs').select('id, nom').order('nom').then(({ data }) => {
      setFournisseurs((data as Fournisseur[]) || []);
    });
  }, []);

  function setScore(field: string, value: number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('evaluations').insert([form]);
    if (!error) {
      if (form.fournisseur_id) router.push(`/fournisseurs/${form.fournisseur_id}`);
      else router.push('/evaluations');
    } else {
      alert('Erreur : ' + error.message);
      setSaving(false);
    }
  }

  const noteGlobale = getNoteGlobale(form.qualite, form.delai, form.prix, form.reactivite);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/evaluations" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nouvelle évaluation</h1>
          <p className="text-slate-500 text-sm">Évaluer un fournisseur sur 4 critères</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <FormField label="Fournisseur *">
          <select required value={form.fournisseur_id} onChange={e => setForm(f => ({ ...f, fournisseur_id: e.target.value }))} className="input">
            <option value="">Sélectionner un fournisseur...</option>
            {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </FormField>

        <FormField label="Date d'évaluation *">
          <input type="date" required value={form.date_evaluation} onChange={e => setForm(f => ({ ...f, date_evaluation: e.target.value }))} className="input" />
        </FormField>

        {/* Scores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">Critères d&apos;évaluation</h3>
          <ScoreField label="Qualité" weight="40%" value={form.qualite} onChange={v => setScore('qualite', v)} />
          <ScoreField label="Délai" weight="35%" value={form.delai} onChange={v => setScore('delai', v)} />
          <ScoreField label="Prix" weight="15%" value={form.prix} onChange={v => setScore('prix', v)} />
          <ScoreField label="Réactivité" weight="10%" value={form.reactivite} onChange={v => setScore('reactivite', v)} />
        </div>

        {/* Note globale preview */}
        <div className={`rounded-xl p-4 border-2 ${noteGlobale >= 4 ? 'bg-green-50 border-green-200' : noteGlobale >= 2.5 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-sm text-slate-600 mb-1">Note globale pondérée</div>
          <div className={`text-4xl font-bold ${noteColor(noteGlobale)}`}>{noteGlobale.toFixed(2)}<span className="text-lg font-normal text-slate-400">/5</span></div>
          <div className="text-xs text-slate-500 mt-1">Qualité×40% + Délai×35% + Prix×15% + Réactivité×10%</div>
        </div>

        <FormField label="Commentaire">
          <textarea value={form.commentaire} onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))}
            className="input min-h-20 resize-none" placeholder="Observations, points forts, axes d'amélioration..." rows={3} />
        </FormField>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer l\'évaluation'}
          </button>
          <Link href="/evaluations" className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NouvelleEvaluation() {
  return <Suspense><NouvelleEvaluationForm /></Suspense>;
}

function ScoreField({ label, weight, value, onChange }: { label: string; weight: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 shrink-0">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-400">Pondération {weight}</div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`w-10 h-10 rounded-lg text-sm font-bold border-2 transition-all ${
              value === v
                ? v >= 4 ? 'bg-green-500 text-white border-green-500' : v >= 3 ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-red-500 text-white border-red-500'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}>
            {v}
          </button>
        ))}
      </div>
      <div className="flex">
        {[1, 2, 3, 4, 5].map(v => (
          <Star key={v} size={16} className={v <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
        ))}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
