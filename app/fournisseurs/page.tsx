'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Building2, Globe, MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildFournisseurStats, formatMontant, noteColor, rapiditeColor } from '@/lib/utils';
import type { Fournisseur, Commande, Evaluation, FournisseurStats } from '@/lib/types';

export default function FournisseursPage() {
  const [stats, setStats] = useState<FournisseurStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'actifs' | 'inactifs'>('tous');
  const [filtreOrigine, setFiltreOrigine] = useState<'tous' | 'francais' | 'etrangers'>('tous');

  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: c }, { data: ev }] = await Promise.all([
        supabase.from('fournisseurs').select('*').order('nom'),
        supabase.from('commandes').select('*'),
        supabase.from('evaluations').select('*'),
      ]);
      const fournisseurs = (f as Fournisseur[]) || [];
      const commandes = (c as Commande[]) || [];
      const evaluations = (ev as Evaluation[]) || [];
      setStats(fournisseurs.map(fournisseur =>
        buildFournisseurStats(
          fournisseur,
          commandes.filter(x => x.fournisseur_id === fournisseur.id),
          evaluations.filter(x => x.fournisseur_id === fournisseur.id)
        )
      ));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = stats.filter(s => {
    if (search && !s.fournisseur.nom.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtreStatut === 'actifs' && !s.fournisseur.statut) return false;
    if (filtreStatut === 'inactifs' && s.fournisseur.statut) return false;
    if (filtreOrigine === 'francais' && s.fournisseur.est_etranger) return false;
    if (filtreOrigine === 'etrangers' && !s.fournisseur.est_etranger) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fournisseurs</h1>
          <p className="text-slate-500 text-sm mt-1">{stats.length} fournisseur{stats.length !== 1 ? 's' : ''} enregistré{stats.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/fournisseurs/nouveau"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Ajouter un fournisseur
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['tous', 'actifs', 'inactifs'] as const).map(v => (
            <button key={v} onClick={() => setFiltreStatut(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtreStatut === v ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['tous', 'francais', 'etrangers'] as const).map(v => (
            <button key={v} onClick={() => setFiltreOrigine(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtreOrigine === v ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {v === 'tous' ? 'Tous' : v === 'francais' ? '🇫🇷 Français' : '🌍 Étrangers'}
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
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Fournisseur</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pays / Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Délai moyen</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Note</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Montant total</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Alertes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s.fournisseur.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Building2 size={15} className="text-blue-500" />
                      </div>
                      <div>
                        <Link href={`/fournisseurs/${s.fournisseur.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                          {s.fournisseur.nom}
                        </Link>
                        {s.fournisseur.est_etranger && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Globe size={11} className="text-orange-500" />
                            <span className="text-xs text-orange-600">Fournisseur étranger</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-600">
                      {s.fournisseur.est_etranger ? <Globe size={13} className="text-orange-400" /> : <MapPin size={13} className="text-green-400" />}
                      {s.fournisseur.pays}
                    </div>
                    {s.fournisseur.type_fournisseur && (
                      <div className="text-xs text-slate-400 mt-0.5">{s.fournisseur.type_fournisseur}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.delaiMoyen !== null ? (
                      <div>
                        <div className="font-medium text-slate-700">{s.delaiMoyen} jour{s.delaiMoyen !== 1 ? 's' : ''}</div>
                        {s.rapidite && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${rapiditeColor(s.rapidite)}`}>{s.rapidite}</span>
                        )}
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {s.noteGlobale !== null ? (
                      <span className={`text-lg font-bold ${noteColor(s.noteGlobale)}`}>{s.noteGlobale.toFixed(2)}<span className="text-xs text-slate-400 font-normal">/5</span></span>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatMontant(s.montantTotal)}</td>
                  <td className="px-4 py-3">
                    {s.fournisseur.statut ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle size={12} /> Actif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full w-fit">
                        <XCircle size={12} /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.alertes.length > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full w-fit">
                        <AlertTriangle size={11} /> {s.alertes.length}
                      </span>
                    ) : (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/fournisseurs/${s.fournisseur.id}`} className="text-xs text-blue-600 hover:underline">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Aucun fournisseur trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
