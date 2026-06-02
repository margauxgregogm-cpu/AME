'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2, ShoppingCart, AlertTriangle, Globe, MapPin,
  Zap, Clock, Snail, CheckCircle, XCircle, ArrowRight,
  Package, Wrench, TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  buildFournisseurStats, formatMontant, noteColor, rapiditeColor
} from '@/lib/utils';
import type { Fournisseur, Commande, Evaluation, FournisseurStats, Alerte } from '@/lib/types';

export default function Dashboard() {
  const [stats, setStats] = useState<FournisseurStats[]>([]);
  const [allAlertes, setAllAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: fournisseurs, error: e1 }, { data: commandes, error: e2 }, { data: evaluations, error: e3 }] =
          await Promise.all([
            supabase.from('fournisseurs').select('*').order('nom'),
            supabase.from('commandes').select('*'),
            supabase.from('evaluations').select('*'),
          ]);
        if (e1 || e2 || e3) throw new Error(e1?.message || e2?.message || e3?.message);
        const f = (fournisseurs as Fournisseur[]) || [];
        const c = (commandes as Commande[]) || [];
        const ev = (evaluations as Evaluation[]) || [];
        const s = f.map(fournisseur =>
          buildFournisseurStats(
            fournisseur,
            c.filter(x => x.fournisseur_id === fournisseur.id),
            ev.filter(x => x.fournisseur_id === fournisseur.id)
          )
        );
        setStats(s);
        setAllAlertes(s.flatMap(x => x.alertes));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const total = stats.length;
  const actifs = stats.filter(s => s.fournisseur.statut).length;
  const francais = stats.filter(s => !s.fournisseur.est_etranger).length;
  const etrangers = stats.filter(s => s.fournisseur.est_etranger).length;
  const rapides = stats.filter(s => s.rapidite === 'Rapide').length;
  const normaux = stats.filter(s => s.rapidite === 'Normal').length;
  const lents = stats.filter(s => s.rapidite === 'Lent').length;
  const montantGlobal = stats.reduce((sum, s) => sum + s.montantTotal, 0);
  const alertesHautes = allAlertes.filter(a => a.severite === 'haute');
  const sorted = [...stats].sort((a, b) => (b.noteGlobale ?? 0) - (a.noteGlobale ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d&apos;ensemble des fournisseurs OSC7</p>
      </div>

      {/* KPIs row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Building2 size={20} />} label="Fournisseurs actifs" value={`${actifs} / ${total}`} color="blue" />
        <KpiCard icon={<MapPin size={20} />} label="Fournisseurs français" value={francais} color="green" />
        <KpiCard icon={<Globe size={20} />} label="Fournisseurs étrangers" value={etrangers} color="orange" />
        <KpiCard icon={<AlertTriangle size={20} />} label="Alertes actives" value={allAlertes.length} color={alertesHautes.length > 0 ? 'red' : 'yellow'} />
      </div>

      {/* KPIs row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Zap size={20} />} label="Rapides (< 7j)" value={rapides} color="green" />
        <KpiCard icon={<Clock size={20} />} label="Normaux (7–21j)" value={normaux} color="yellow" />
        <KpiCard icon={<Snail size={20} />} label="Lents (> 21j)" value={lents} color="red" />
        <KpiCard icon={<ShoppingCart size={20} />} label="Montant total commandé" value={formatMontant(montantGlobal)} color="blue" small />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classement */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> Classement par note globale
            </h2>
            <Link href="/fournisseurs" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Voir tous <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {sorted.map((s, i) => (
              <div key={s.fournisseur.id} className="px-5 py-3 flex items-center gap-4">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-400'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/fournisseurs/${s.fournisseur.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                      {s.fournisseur.nom}
                    </Link>
                    {s.fournisseur.est_etranger && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Étranger</span>
                    )}
                    {!s.fournisseur.statut && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Inactif</span>
                    )}
                    {s.rapidite && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${rapiditeColor(s.rapidite)}`}>{s.rapidite}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {s.nbCommandes} commande{s.nbCommandes !== 1 ? 's' : ''} · {formatMontant(s.montantTotal)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {s.noteGlobale !== null ? (
                    <>
                      <div className={`text-xl font-bold ${noteColor(s.noteGlobale)}`}>{s.noteGlobale.toFixed(2)}</div>
                      <div className="text-xs text-slate-400">/ 5</div>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
              </div>
            ))}
            {sorted.length === 0 && (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">Aucun fournisseur</div>
            )}
          </div>
        </div>

        {/* Panneau droit */}
        <div className="space-y-4">
          {/* Alertes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Alertes récentes</h2>
              <Link href="/alertes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Toutes <ArrowRight size={12} />
              </Link>
            </div>
            <div className="px-5 py-3 space-y-2">
              {allAlertes.slice(0, 5).map((a, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg border ${
                  a.severite === 'haute' ? 'bg-red-50 border-red-100 text-red-800' :
                  a.severite === 'moyenne' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                  'bg-yellow-50 border-yellow-100 text-yellow-800'
                }`}>
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{a.fournisseurNom}</div>
                    <div>{a.message}</div>
                  </div>
                </div>
              ))}
              {allAlertes.length === 0 && (
                <div className="py-4 text-center text-slate-400 text-sm flex flex-col items-center gap-1">
                  <CheckCircle size={20} className="text-green-400" />
                  Aucune alerte active
                </div>
              )}
            </div>
          </div>

          {/* Répartition achats */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Répartition des achats</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><Package size={16} className="text-blue-500" /></div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">Consommables</div>
                  <div className="text-xs text-slate-500">Montant &lt; 800 €</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg"><Wrench size={16} className="text-purple-500" /></div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">Investissements</div>
                  <div className="text-xs text-slate-500">Montant ≥ 800 €</div>
                </div>
              </div>
              <Link href="/commandes" className="block text-center text-xs text-blue-600 hover:underline mt-2">
                Voir le détail des commandes →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Actions recommandées */}
      {alertesHautes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Actions recommandées
          </h3>
          <ul className="space-y-1.5">
            {alertesHautes.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <XCircle size={14} className="shrink-0 mt-0.5" />
                <span><strong>{a.fournisseurNom}</strong> — {a.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color, small = false }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; small?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorMap[color] || colorMap.blue} mb-3`}>{icon}</div>
      <div className={`font-bold text-slate-900 ${small ? 'text-base' : 'text-2xl'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
      <div className="font-semibold mb-1">Erreur de connexion Supabase</div>
      <div className="text-sm font-mono">{message}</div>
      <div className="mt-3 text-xs text-red-500">Configurez votre fichier .env.local avec les clés Supabase.</div>
    </div>
  );
}
