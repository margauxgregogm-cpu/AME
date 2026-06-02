'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getNoteGlobale, noteColor, formatDate } from '@/lib/utils';
import StarRating from '@/components/StarRating';
import type { Evaluation, Fournisseur } from '@/lib/types';

type EvalAvecNom = Evaluation & { fournisseur_nom: string };

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<EvalAvecNom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: ev }, { data: f }] = await Promise.all([
        supabase.from('evaluations').select('*').order('date_evaluation', { ascending: false }),
        supabase.from('fournisseurs').select('id, nom'),
      ]);
      const fMap: Record<string, string> = {};
      ((f as Fournisseur[]) || []).forEach(fournisseur => { fMap[fournisseur.id] = fournisseur.nom; });
      setEvaluations(((ev as Evaluation[]) || []).map(e => ({
        ...e, fournisseur_nom: fMap[e.fournisseur_id] || '—',
      })));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Évaluations</h1>
          <p className="text-slate-500 text-sm mt-1">{evaluations.length} évaluation{evaluations.length !== 1 ? 's' : ''} enregistrée{evaluations.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/evaluations/nouvelle" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nouvelle évaluation
        </Link>
      </div>

      {/* Pondération */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-6 text-sm">
        <div className="font-semibold text-blue-800">Pondération :</div>
        <span className="text-blue-700">Qualité <strong>40%</strong></span>
        <span className="text-blue-700">Délai <strong>35%</strong></span>
        <span className="text-blue-700">Prix <strong>15%</strong></span>
        <span className="text-blue-700">Réactivité <strong>10%</strong></span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Fournisseur</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Qualité (40%)</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Délai (35%)</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Prix (15%)</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Réactivité (10%)</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Note globale</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Commentaire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {evaluations.map(ev => {
                const note = getNoteGlobale(ev.qualite, ev.delai, ev.prix, ev.reactivite);
                return (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <Link href={`/fournisseurs/${ev.fournisseur_id}`} className="hover:text-blue-600">
                        {ev.fournisseur_nom}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(ev.date_evaluation)}</td>
                    <td className="px-4 py-3"><ScoreBadge value={ev.qualite} /></td>
                    <td className="px-4 py-3"><ScoreBadge value={ev.delai} /></td>
                    <td className="px-4 py-3"><ScoreBadge value={ev.prix} /></td>
                    <td className="px-4 py-3"><ScoreBadge value={ev.reactivite} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xl font-bold ${noteColor(note)}`}>
                        {note.toFixed(2)}<span className="text-xs font-normal text-slate-400">/5</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate text-xs">
                      {ev.commentaire || '—'}
                    </td>
                  </tr>
                );
              })}
              {evaluations.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Aucune évaluation</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const color = value >= 4 ? 'bg-green-100 text-green-800' : value >= 2.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>{value.toFixed(1)}/5</span>;
}
