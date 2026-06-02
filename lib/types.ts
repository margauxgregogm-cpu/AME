export interface Fournisseur {
  id: string;
  nom: string;
  pays: string;
  type_fournisseur: string | null;
  contact: string | null;
  email: string | null;
  telephone: string | null;
  site_web: string | null;
  statut: boolean;
  est_etranger: boolean;
  created_at: string;
  updated_at: string;
}

export interface Commande {
  id: string;
  fournisseur_id: string;
  reference_commande: string | null;
  montant: number;
  date_commande: string;
  date_livraison_prevue: string | null;
  date_livraison_reelle: string | null;
  statut: 'en_cours' | 'livree' | 'annulee' | 'en_retard';
  notes: string | null;
  created_at: string;
  fournisseurs?: Fournisseur;
}

export interface Evaluation {
  id: string;
  fournisseur_id: string;
  qualite: number;
  delai: number;
  prix: number;
  reactivite: number;
  commentaire: string | null;
  date_evaluation: string;
  created_at: string;
  fournisseurs?: Fournisseur;
}

export interface FournisseurStats {
  fournisseur: Fournisseur;
  noteGlobale: number | null;
  delaiMoyen: number | null;
  rapidite: 'Rapide' | 'Normal' | 'Lent' | null;
  montantTotal: number;
  nbCommandes: number;
  alertes: Alerte[];
}

export interface Alerte {
  type: 'note_basse' | 'qualite_basse' | 'lent' | 'montant_eleve' | 'etranger' | 'inactif';
  message: string;
  severite: 'haute' | 'moyenne' | 'basse';
  fournisseurId: string;
  fournisseurNom: string;
}
