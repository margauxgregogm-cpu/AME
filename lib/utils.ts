import type { Commande, Evaluation, Fournisseur, Alerte, FournisseurStats } from './types';

export function getCategorie(montant: number): string {
  return montant < 800 ? 'Consommable' : 'Investissement';
}

export function getDelaiReel(dateCommande: string, dateLivraisonReelle: string | null): number | null {
  if (!dateLivraisonReelle) return null;
  const start = new Date(dateCommande);
  const end = new Date(dateLivraisonReelle);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getNoteGlobale(qualite: number, delai: number, prix: number, reactivite: number): number {
  return Math.round((qualite * 0.4 + delai * 0.35 + prix * 0.15 + reactivite * 0.10) * 100) / 100;
}

export function getRapidite(delaiMoyen: number): 'Rapide' | 'Normal' | 'Lent' {
  if (delaiMoyen < 7) return 'Rapide';
  if (delaiMoyen <= 21) return 'Normal';
  return 'Lent';
}

export function getDelaiMoyen(commandes: Commande[]): number | null {
  const livrees = commandes.filter(c => c.date_livraison_reelle);
  if (livrees.length === 0) return null;
  const delais = livrees.map(c => getDelaiReel(c.date_commande, c.date_livraison_reelle)!).filter(d => d >= 0);
  if (delais.length === 0) return null;
  return Math.round(delais.reduce((a, b) => a + b, 0) / delais.length);
}

export function getMontantTotal(commandes: Commande[]): number {
  return commandes.reduce((sum, c) => sum + Number(c.montant), 0);
}

export function getNoteMoyenne(evaluations: Evaluation[]): number | null {
  if (evaluations.length === 0) return null;
  const notes = evaluations.map(e => getNoteGlobale(e.qualite, e.delai, e.prix, e.reactivite));
  return Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 100) / 100;
}

export function getQualiteMoyenne(evaluations: Evaluation[]): number | null {
  if (evaluations.length === 0) return null;
  return Math.round((evaluations.reduce((s, e) => s + e.qualite, 0) / evaluations.length) * 100) / 100;
}

export function genererAlertes(
  fournisseur: Fournisseur,
  commandes: Commande[],
  evaluations: Evaluation[]
): Alerte[] {
  const alertes: Alerte[] = [];
  const noteGlobale = getNoteMoyenne(evaluations);
  const qualiteMoyenne = getQualiteMoyenne(evaluations);
  const delaiMoyen = getDelaiMoyen(commandes);
  const montantTotal = getMontantTotal(commandes);
  const maxCommande = commandes.length > 0 ? Math.max(...commandes.map(c => Number(c.montant))) : 0;

  if (noteGlobale !== null && noteGlobale < 2.5) {
    alertes.push({
      type: 'note_basse',
      message: `Note globale insuffisante : ${noteGlobale.toFixed(2)}/5`,
      severite: 'haute',
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
    });
  }

  if (qualiteMoyenne !== null && qualiteMoyenne < 2) {
    alertes.push({
      type: 'qualite_basse',
      message: `Note qualité critique : ${qualiteMoyenne.toFixed(2)}/5`,
      severite: 'haute',
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
    });
  }

  if (delaiMoyen !== null && delaiMoyen > 21) {
    alertes.push({
      type: 'lent',
      message: `Fournisseur lent : délai moyen ${delaiMoyen} jours`,
      severite: 'moyenne',
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
    });
  }

  if (montantTotal > 25000 || maxCommande > 25000) {
    alertes.push({
      type: 'montant_eleve',
      message: `Cumul ${montantTotal.toLocaleString('fr-FR')} € — consultation de plusieurs fournisseurs recommandée`,
      severite: 'moyenne',
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
    });
  }

  if (fournisseur.est_etranger) {
    alertes.push({
      type: 'etranger',
      message: `Fournisseur étranger (${fournisseur.pays})`,
      severite: 'basse',
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
    });
  }

  if (!fournisseur.statut) {
    alertes.push({
      type: 'inactif',
      message: 'Fournisseur inactif',
      severite: 'haute',
      fournisseurId: fournisseur.id,
      fournisseurNom: fournisseur.nom,
    });
  }

  return alertes;
}

export function buildFournisseurStats(
  fournisseur: Fournisseur,
  commandes: Commande[],
  evaluations: Evaluation[]
): FournisseurStats {
  const delaiMoyen = getDelaiMoyen(commandes);
  return {
    fournisseur,
    noteGlobale: getNoteMoyenne(evaluations),
    delaiMoyen,
    rapidite: delaiMoyen !== null ? getRapidite(delaiMoyen) : null,
    montantTotal: getMontantTotal(commandes),
    nbCommandes: commandes.length,
    alertes: genererAlertes(fournisseur, commandes, evaluations),
  };
}

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR');
}

export function noteColor(note: number): string {
  if (note >= 4) return 'text-green-600';
  if (note >= 2.5) return 'text-yellow-600';
  return 'text-red-600';
}

export function rapiditeColor(r: string): string {
  if (r === 'Rapide') return 'bg-green-100 text-green-800';
  if (r === 'Normal') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export function statutColor(statut: string): string {
  switch (statut) {
    case 'livree': return 'bg-green-100 text-green-800';
    case 'en_cours': return 'bg-blue-100 text-blue-800';
    case 'en_retard': return 'bg-red-100 text-red-800';
    case 'annulee': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export function statutLabel(statut: string): string {
  switch (statut) {
    case 'livree': return 'Livrée';
    case 'en_cours': return 'En cours';
    case 'en_retard': return 'En retard';
    case 'annulee': return 'Annulée';
    default: return statut;
  }
}

export function severiteColor(s: string): string {
  switch (s) {
    case 'haute': return 'bg-red-100 text-red-800 border-red-200';
    case 'moyenne': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'basse': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
