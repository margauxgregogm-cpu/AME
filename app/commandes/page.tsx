'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Package, Wrench, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatMontant, formatDate, getCategorie, getDelaiReel, statutColor, statutLabel } from '@/lib/utils';
import type { Commande, Fournisseur } from '@/lib/types';

type CommandeAvecFournisseur = Commande & { fournisseur_nom: string };

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<CommandeAvecFournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: f }] = await Promise.all([
        supabase.from('commandes').select('*').order('date_commande', { ascending: false }),
        supabase.from('fournisseurs').select('id, nom'),
      ]);
      const fMap: Record<string, string> = {};
      ((f as Fournisseur[]) || []).forEach(fournisseur => { fMap[fournisseur.id] = fournisseur.nom; });
      setCommandes(((c as Commande[]) || []).map(cmd => ({
        ...cmd, fournisseur_nom: fMap[cmd.fournisseur_id] || '—',
      })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = commandes.filter(c => {
    if (search && ![c.fournisseur_nom, c.reference_commande || ''].some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filtreStatut !== 'tous' && c.statut !== filtreStatut) return false;
    return true;
  });

  const montantTotal = filtered.reduce((s, c) => s + Number(c.montant), 0);
  const consommables = filtered.filter(c => Number(c.montant) < 800);
  const investissements = filtered.filter(c => Number(c.montant) >= 800);
  const alerteMontant = filtered.filter(c => Number(c.montant) > 25000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commandes</h1>
          <p className="text-slate-500 text-sm mt-1">{commandes.length} commande{commandes.length !== 1 ? 's' : ''} enregistrée{commandes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/commandes/nouvelle" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Ajouter une commande
        </Link>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Montant total (filtre)</div>
          <div className="text-xl font-bold text-slate-900">{formatMontant(montantTotal)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1"><Package size={14} className="text-blue-500" /><span className="text-xs text-slate-500">Consommables</span></div>
          <div className="text-xl font-bold text-blue-600">{consommables.length}</div>
          <div className="text-xs text-slate-400">{formatMontant(consommables.reduce((s, c) => s + Number(c.montant), 0))}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1"><Wrench size={14} className="text-purple-500" /><span className="text-xs text-slate-500">Investissements</span></div>
          <div className="text-xl font-bold text-purple-600">{investissements.length}</div>
          <div className="text-xs text-slate-400">{formatMontant(investissements.reduce((s, c) => s + Number(c.montant), 0))}</div>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 ${alerteMontant.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className={alerteMontant.length > 0 ? 'text-red-500' : 'text-slate-400'} /><span className="text-xs text-slate-500">&gt; 25 000 €</span></div>
          <div className={`text-xl font-bold ${alerteMontant.length > 0 ? 'text-red-600' : 'text-slate-400'}`}>{alerteMontant.length}</div>
          {alerteMontant.length > 0 && <div className="text-xs text-red-500">Consultation requise</div>}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ v: 'tous', l: 'Toutes' }, { v: 'en_cours', l: 'En cours' }, { v: 'livree', l: 'Livrées' }, { v: 'en_retard', l: 'En retard' }, { v: 'annulee', l: 'Annulées' }].map(({ v, l }) => (
            <button key={v} onClick={() => setFiltreStatut(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtreStatut === v ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Référence</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Fournisseur</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Montant</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date commande</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Délai réel</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => {
                const delai = getDelaiReel(c.date_commande, c.date_livraison_reelle);
                const cat = getCategorie(Number(c.montant));
                const alerteMontant = Number(c.montant) > 25000;
                return (
                  <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${alerteMontant ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-700">{c.reference_commande || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{c.fournisseur_nom}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{formatMontant(Number(c.montant))}</div>
                      {alerteMontant && <div className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={10} /> Consultation requise</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat === 'Consommable' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {cat === 'Consommable' ? <span className="flex items-center gap-1"><Package size={10} /> {cat}</span> : <span className="flex items-center gap-1"><Wrench size={10} /> {cat}</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(c.date_commande)}</td>
                    <td className="px-4 py-3">
                      {delai !== null ? (
                        <span className={`font-medium ${delai > 21 ? 'text-red-600' : delai < 7 ? 'text-green-600' : 'text-slate-700'}`}>
                          {delai} jour{delai !== 1 ? 's' : ''}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statutColor(c.statut)}`}>{statutLabel(c.statut)}</span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Aucune commande trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
