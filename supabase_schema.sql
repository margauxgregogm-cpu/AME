-- ============================================================
-- OSC7 - Gestion Fournisseurs - Schéma Supabase
-- Structure uniquement — aucune donnée
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE FOURNISSEURS
-- ============================================================
CREATE TABLE IF NOT EXISTS fournisseurs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nom TEXT NOT NULL,
  pays TEXT NOT NULL DEFAULT 'France',
  type_fournisseur TEXT,
  contact TEXT,
  email TEXT,
  telephone TEXT,
  site_web TEXT,
  statut BOOLEAN DEFAULT true,
  est_etranger BOOLEAN GENERATED ALWAYS AS (pays != 'France') STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE COMMANDES
-- ============================================================
CREATE TABLE IF NOT EXISTS commandes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE CASCADE,
  reference_commande TEXT,
  montant DECIMAL(12,2) NOT NULL,
  date_commande DATE NOT NULL,
  date_livraison_prevue DATE,
  date_livraison_reelle DATE,
  statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'livree', 'annulee', 'en_retard')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE EVALUATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE CASCADE,
  qualite DECIMAL(3,1) NOT NULL CHECK (qualite >= 0 AND qualite <= 5),
  delai DECIMAL(3,1) NOT NULL CHECK (delai >= 0 AND delai <= 5),
  prix DECIMAL(3,1) NOT NULL CHECK (prix >= 0 AND prix <= 5),
  reactivite DECIMAL(3,1) NOT NULL CHECK (reactivite >= 0 AND reactivite <= 5),
  commentaire TEXT,
  date_evaluation DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TRIGGER - updated_at automatique sur fournisseurs
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fournisseurs_updated_at
  BEFORE UPDATE ON fournisseurs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
