'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Trash2, Globe, MapPin, Mail, Phone, ExternalLink,
  AlertTriangle, Package, Calendar, Star, CheckCircle, XCircle, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  buildFournisseurStats, formatMontant, formatDate, noteColor,
  rapiditeColor, getCategorie, getDelaiReel, getNoteGlobale,
  statutColor, statutLabel, severiteColor
} from '@/lib/utils';
import StarRating from '@/components/StarRating';
import type { Fournisseur, Commande, Evaluation, FournisseurStats } from '@/lib/types';

export default function FournisseurDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [stats, setStats] = useState<FournisseurStats | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: f }, { data: c }, { data: ev }] = await Promise.all([
        supabase.from('fournisseurs').select('*').eq('id', id).single(),
        supabase.from('commandes').select('*').eq('fournisseur_id', id).order('date_commande', { ascending: false }),
        supabase.from('evaluations').select('*').eq('fournisseur_id', id).order('date_evaluation', { ascending: false }),
      ]);
      if (f) {
        const fournisseur = f as Fournisseur;
        const cmdList = (c as Commande[]) || [];
        const evList = (ev as Evaluation[]) || [];
        setStats(buildFournisseurStats(fournisseur, cmdList, evList));
        setCommandes(cmdList);
        setEvaluations(evList);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Supprimer le fournisseur "${stats?.fournisseur.nom}" ? Cette action est irréversible.`)) return;
    setDeleting(true);
    await supabase.from('fournisseurs').delete().eq('id', id);
    router.push('/fournisseurs');
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!stats) return <div className="text-center py-16 text-slate-400">Fournisseur introuvable</div>;

  const { fournisseur } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/fournisseurs" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{fournisseur.nom}</h1>
              {fournisseur.est_etranger && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Globe size={12} /> Fournisseur étranger
                </span>
              )}
              {fournisseur.statut ? (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> Actif
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <XCircle size={12} /> Inactif
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">{fournisseur.type_fournisseur || 'Fournisseur'} · {fournisseur.pays}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/fournisseurs/${id}/modifier`}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit size={14} /> Modifier
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos + stats */}
        <div className="space-y-4">
          {/* Infos contact */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-3">Informations</h2>
            {fournisseur.contact && <InfoRow icon={<Package size={14} />} label="Contact" value={fournisseur.contact} />}
            {fournisseur.email && <InfoRow icon={<Mail size={14} />} label="Email" value={fournisseur.email} />}
            {fournisseur.telephone && <InfoRow icon={<Phone size={14} />} label="Téléphone" value={fournisseur.telephone} />}
            {fournisseur.site_web && (
              <InfoRow icon={<ExternalLink size={14} />} label="Site web"
                value={<a href={fournisseur.site_web} target="_blank" rel="noopener" className="text-blue-600 hover:underline truncate">{fournisseur.site_web}</a>} />
            )}
            <InfoRow icon={fournisseur.est_etranger ? <Globe size={14} /> : <MapPin size={14} />} label="Pays" value={fournisseur.pays} />
          </div>

          {/* KPIs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Indicateurs</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Note globale</span>
                {stats.noteGlobale !== null ? (
                  <span className={`text-xl font-bold ${noteColor(stats.noteGlobale)}`}>{stats.noteGlobale.toFixed(2)}<span className="text-xs text-slate-400 font-normal">/5</span></span>
                ) : <span className="text-slate-400 text-sm">—</span>}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Délai moyen</span>
                <div className="text-right">
                  {stats.delaiMoyen !== null ? (
                    <div>
                      <span className="font-semibold text-slate-800">{stats.delaiMoyen}j</span>
                      {stats.rapidite && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${rapiditeColor(stats.rapidite)}`}>{stats.rapidite}</span>}
                    </div>
                  ) : <span className="text-slate-400 text-sm">—</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Montant total</span>
                <span className="font-semibold text-slate-800">{formatMontant(stats.montantTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Nb commandes</span>
                <span className="font-semibold text-slate-800">{stats.nbCommandes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau central + droit */}
        <div className="lg:col-span-2 space-y-4">
          {/* Alertes */}
          {stats.alertes.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500" /> Alertes ({stats.alertes.length})
              </h2>
              <div className="space-y-2">
                {stats.alertes.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 text-sm p-3 rounded-lg border ${severiteColor(a.severite)}`}>
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{a.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Évaluations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Star size={16} className="text-amber-400" /> Évaluations</h2>
              <Link href={`/evaluations/nouvelle?fournisseur=${id}`} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                <Plus size={12} /> Évaluer
              </Link>
            </div>
            {evaluations.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucune évaluation</p>
            ) : (
              <div className="space-y-3">
                {evaluations.map(ev => {
                  const note = getNoteGlobale(ev.qualite, ev.delai, ev.prix, ev.reactivite);
                  return (
                    <div key={ev.id} className="border border-slate-100 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs text-slate-400">{formatDate(ev.date_evaluation)}</span>
                        <span className={`text-lg font-bold ${noteColor(note)}`}>{note.toFixed(2)}<span className="text-xs font-normal text-slate-400">/5</span></span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <ScoreRow label="Qualité (40%)" value={ev.qualite} />
                        <ScoreRow label="Délai (35%)" value={ev.delai} />
                        <ScoreRow label="Prix (15%)" value={ev.prix} />
                        <ScoreRow label="Réactivité (10%)" value={ev.reactivite} />
                      </div>
                      {ev.commentaire && <p className="text-xs text-slate-500 mt-2 italic">{ev.commentaire}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Commandes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> Commandes</h2>
              <Link href={`/commandes/nouvelle?fournisseur=${id}`} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                <Plus size={12} /> Ajouter
              </Link>
            </div>
            {commandes.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucune commande</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="text-left pb-2">Référence</th>
                      <th className="text-left pb-2">Montant</th>
                      <th className="text-left pb-2">Catégorie</th>
                      <th className="text-left pb-2">Délai réel</th>
                      <th className="text-left pb-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {commandes.map(c => {
                      const delai = getDelaiReel(c.date_commande, c.date_livraison_reelle);
                      const cat = getCategorie(c.montant);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-2 font-medium text-slate-700">{c.reference_commande || '—'}</td>
                          <td className="py-2 font-semibold">{formatMontant(c.montant)}</td>
                          <td className="py-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${cat === 'Consommable' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                              {cat}
                            </span>
                          </td>
                          <td className="py-2">{delai !== null ? `${delai}j` : '—'}</td>
                          <td className="py-2">
                            <span className={`px-1.5 py-0.5 rounded-full ${statutColor(c.statut)}`}>{statutLabel(c.statut)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm text-slate-700 truncate">{value}</div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-1">
        <div className="w-16 bg-slate-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${value >= 4 ? 'bg-green-500' : value >= 2.5 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${(value / 5) * 100}%` }} />
        </div>
        <span className="font-semibold text-slate-700 w-6 text-right">{value}</span>
      </div>
    </div>
  );
}
