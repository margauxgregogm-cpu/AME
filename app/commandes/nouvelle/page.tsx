'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCategorie } from '@/lib/utils';
import type { Fournisseur } from '@/lib/types';
import { Suspense } from 'react';

function NouvelleCommandeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fournisseur_id: searchParams.get('fournisseur') || '',
    reference_commande: '',
    montant: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    date_livraison_reelle: '',
    statut: 'en_cours',
    notes: '',
  });

  useEffect(() => {
    supabase.from('fournisseurs').select('id, nom').eq('statut', true).order('nom').then(({ data }) => {
      setFournisseurs((data as Fournisseur[]) || []);
    });
  }, []);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      montant: parseFloat(form.montant),
      date_livraison_prevue: form.date_livraison_prevue || null,
      date_livraison_reelle: form.date_livraison_reelle || null,
    };
    const { error } = await supabase.from('commandes').insert([payload]);
    if (!error) {
      if (form.fournisseur_id) {
        router.push(`/fournisseurs/${form.fournisseur_id}`);
      } else {
        router.push('/commandes');
      }
    } else {
      alert('Erreur : ' + error.message);
      setSaving(false);
    }
  }

  const montantNum = parseFloat(form.montant);
  const cat = !isNaN(montantNum) ? getCategorie(montantNum) : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/commandes" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nouvelle commande</h1>
          <p className="text-slate-500 text-sm">Enregistrer une commande fournisseur</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <FormField label="Fournisseur *">
          <select required value={form.fournisseur_id} onChange={e => set('fournisseur_id', e.target.value)} className="input">
            <option value="">Sélectionner un fournisseur...</option>
            {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </FormField>

        <FormField label="Référence commande">
          <input type="text" value={form.reference_commande} onChange={e => set('reference_commande', e.target.value)}
            className="input" placeholder="Ex : CMD-2026-001" />
        </FormField>

        <FormField label="Montant (€) *">
          <input type="number" required min="0" step="0.01" value={form.montant} onChange={e => set('montant', e.target.value)}
            className="input" placeholder="0.00" />
          {cat && (
            <div className={`flex items-center gap-2 mt-2 text-sm font-medium ${cat === 'Consommable' ? 'text-blue-600' : 'text-purple-600'}`}>
              {cat === 'Consommable' ? <Package size={14} /> : <Wrench size={14} />}
              Catégorie : <strong>{cat}</strong>
              {montantNum > 25000 && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠ Consultation de plusieurs fournisseurs recommandée</span>
              )}
            </div>
          )}
        </FormField>

        <FormField label="Date de commande *">
          <input type="date" required value={form.date_commande} onChange={e => set('date_commande', e.target.value)} className="input" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date livraison prévue">
            <input type="date" value={form.date_livraison_prevue} onChange={e => set('date_livraison_prevue', e.target.value)} className="input" />
          </FormField>
          <FormField label="Date livraison réelle">
            <input type="date" value={form.date_livraison_reelle} onChange={e => set('date_livraison_reelle', e.target.value)} className="input" />
          </FormField>
        </div>

        <FormField label="Statut">
          <select value={form.statut} onChange={e => set('statut', e.target.value)} className="input">
            <option value="en_cours">En cours</option>
            <option value="livree">Livrée</option>
            <option value="en_retard">En retard</option>
            <option value="annulee">Annulée</option>
          </select>
        </FormField>

        <FormField label="Notes">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            className="input min-h-20 resize-none" placeholder="Description, remarques..." rows={3} />
        </FormField>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer la commande'}
          </button>
          <Link href="/commandes" className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NouvelleCommande() {
  return <Suspense><NouvelleCommandeForm /></Suspense>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
