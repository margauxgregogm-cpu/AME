'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildFournisseurStats, severiteColor } from '@/lib/utils';
import type { Fournisseur, Commande, Evaluation, Alerte } from '@/lib/types';

const ALERTE_ICONS: Record<string, string> = {
  note_basse: '⭐',
  qualite_basse: '🔴',
  lent: '🐌',
  montant_eleve: '💶',
  etranger: '🌍',
  inactif: '⛔',
};

const ALERTE_LABELS: Record<string, string> = {
  note_basse: 'Note insuffisante',
  qualite_basse: 'Qualité critique',
  lent: 'Fournisseur lent',
  montant_eleve: 'Montant élevé',
  etranger: 'Fournisseur étranger',
  inactif: 'Fournisseur inactif',
};

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: c }, { data: ev }] = await Promise.all([
        supabase.from('fournisseurs').select('*'),
        supabase.from('commandes').select('*'),
        supabase.from('evaluations').select('*'),
      ]);
      const fournisseurs = (f as Fournisseur[]) || [];
      const commandes = (c as Commande[]) || [];
      const evaluations = (ev as Evaluation[]) || [];
      const allAlertes: Alerte[] = [];
      for (const fournisseur of fournisseurs) {
        const fc = commandes.filter(x => x.fournisseur_id === fournisseur.id);
        const fe = evaluations.filter(x => x.fournisseur_id === fournisseur.id);
        const stats = buildFournisseurStats(fournisseur, fc, fe);
        allAlertes.push(...stats.alertes);
      }
      allAlertes.sort((a, b) => {
        const order = { haute: 0, moyenne: 1, basse: 2 };
        return order[a.severite] - order[b.severite];
      });
      setAlertes(allAlertes);
      setLoading(false);
    }
    load();
  }, []);

  const hautes = alertes.filter(a => a.severite === 'haute');
  const moyennes = alertes.filter(a => a.severite === 'moyenne');
  const basses = alertes.filter(a => a.severite === 'basse');

  const byType = alertes.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alertes</h1>
        <p className="text-slate-500 text-sm mt-1">
          {alertes.length === 0 ? 'Aucune alerte active' : `${alertes.length} alerte${alertes.length !== 1 ? 's' : ''} active${alertes.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {alertes.length === 0 && !loading ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <div className="font-semibold text-green-800 text-lg">Aucune alerte active</div>
          <div className="text-green-600 text-sm mt-1">Tous vos fournisseurs sont dans les normes.</div>
        </div>
      ) : (
        <>
          {/* Résumé */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{hautes.length}</div>
                <div className="text-xs text-red-700 font-medium">Haute sévérité</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{moyennes.length}</div>
                <div className="text-xs text-orange-700 font-medium">Sévérité moyenne</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{basses.length}</div>
                <div className="text-xs text-yellow-700 font-medium">Basse sévérité</div>
              </div>
            </div>
          )}

          {/* Répartition par type */}
          {!loading && Object.keys(byType).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Répartition par type</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(byType).map(([type, count]) => (
                  <span key={type} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
                    {ALERTE_ICONS[type]} {ALERTE_LABELS[type]} <strong>({count})</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Liste alertes */}
          {loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : (
            <div className="space-y-3">
              {alertes.map((a, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${severiteColor(a.severite)}`}>
                  <span className="text-2xl shrink-0">{ALERTE_ICONS[a.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{a.fournisseurNom}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.severite === 'haute' ? 'bg-red-200 text-red-800' :
                        a.severite === 'moyenne' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {a.severite.charAt(0).toUpperCase() + a.severite.slice(1)} sévérité
                      </span>
                      <span className="text-xs opacity-70">{ALERTE_LABELS[a.type]}</span>
                    </div>
                    <p className="text-sm mt-0.5">{a.message}</p>
                  </div>
                  <Link href={`/fournisseurs/${a.fournisseurId}`}
                    className="flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100 whitespace-nowrap shrink-0">
                    Voir <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
