'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Fournisseur } from '@/lib/types';

export default function ModifierFournisseur() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nom: '', pays: 'France', type_fournisseur: '',
    contact: '', email: '', telephone: '', site_web: '', statut: true,
  });

  useEffect(() => {
    supabase.from('fournisseurs').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        const f = data as Fournisseur;
        setForm({
          nom: f.nom, pays: f.pays, type_fournisseur: f.type_fournisseur || '',
          contact: f.contact || '', email: f.email || '', telephone: f.telephone || '',
          site_web: f.site_web || '', statut: f.statut,
        });
      }
      setLoading(false);
    });
  }, [id]);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('fournisseurs').update(form).eq('id', id);
    if (!error) {
      router.push(`/fournisseurs/${id}`);
    } else {
      alert('Erreur : ' + error.message);
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/fournisseurs/${id}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modifier le fournisseur</h1>
          <p className="text-slate-500 text-sm">{form.nom}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Nom du fournisseur *">
          <input type="text" required value={form.nom} onChange={e => set('nom', e.target.value)} className="input" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Pays *">
            <input type="text" required value={form.pays} onChange={e => set('pays', e.target.value)} className="input" />
            {form.pays && form.pays !== 'France' && (
              <p className="text-xs text-orange-600 mt-1">⚠ Classé comme fournisseur étranger</p>
            )}
          </FormField>
          <FormField label="Type de fournisseur">
            <input type="text" value={form.type_fournisseur} onChange={e => set('type_fournisseur', e.target.value)} className="input" />
          </FormField>
        </div>
        <FormField label="Contact">
          <input type="text" value={form.contact} onChange={e => set('contact', e.target.value)} className="input" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" />
          </FormField>
          <FormField label="Téléphone">
            <input type="tel" value={form.telephone} onChange={e => set('telephone', e.target.value)} className="input" />
          </FormField>
        </div>
        <FormField label="Site web">
          <input type="url" value={form.site_web} onChange={e => set('site_web', e.target.value)} className="input" />
        </FormField>
        <FormField label="Statut">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set('statut', true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.statut ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200'}`}>
              Actif
            </button>
            <button type="button" onClick={() => set('statut', false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${!form.statut ? 'bg-gray-500 text-white border-gray-500' : 'bg-white text-slate-600 border-slate-200'}`}>
              Inactif
            </button>
          </div>
        </FormField>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <Link href={`/fournisseurs/${id}`} className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            Annuler
          </Link>
        </div>
      </form>
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
