-- ============================================================
-- OSC7 - Gestion Fournisseurs - Schéma Supabase
-- ============================================================

-- Extension UUID
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
-- TRIGGERS - updated_at automatique
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

-- ============================================================
-- ROW LEVEL SECURITY (désactivé pour démarrage rapide)
-- Activer et configurer selon les besoins de sécurité
-- ============================================================
ALTER TABLE fournisseurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE commandes DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONNÉES INITIALES - FOURNISSEURS
-- ============================================================

-- Amazon France
INSERT INTO fournisseurs (id, nom, pays, type_fournisseur, contact, email, telephone, site_web, statut)
VALUES (
  'aaaaaaaa-0001-0001-0001-000000000001',
  'Amazon France',
  'France',
  'E-commerce généraliste',
  'Service client',
  'pro@amazon.fr',
  '09 70 00 00 00',
  'https://www.amazon.fr/business',
  true
);

-- UGAP
INSERT INTO fournisseurs (id, nom, pays, type_fournisseur, contact, email, telephone, site_web, statut)
VALUES (
  'aaaaaaaa-0002-0002-0002-000000000002',
  'UGAP',
  'France',
  'Centrale d''achat public',
  'Équipe commerciale',
  'contact@ugap.fr',
  '01 64 73 20 00',
  'https://www.ugap.fr',
  true
);

-- Fussier Outillage
INSERT INTO fournisseurs (id, nom, pays, type_fournisseur, contact, email, telephone, site_web, statut)
VALUES (
  'aaaaaaaa-0003-0003-0003-000000000003',
  'Fussier Outillage',
  'France',
  'Outillage et équipements',
  'M. Fussier',
  'contact@fussier-outillage.fr',
  '03 26 77 12 34',
  'https://www.fussier-outillage.fr',
  true
);

-- ERM (imprimante 3D Prusa)
INSERT INTO fournisseurs (id, nom, pays, type_fournisseur, contact, email, telephone, site_web, statut)
VALUES (
  'aaaaaaaa-0004-0004-0004-000000000004',
  'ERM - Prusa 3D',
  'République Tchèque',
  'Impression 3D et matériaux',
  'Support technique',
  'support@prusa3d.com',
  '+420 222 112 808',
  'https://www.prusa3d.com',
  true
);

-- RS Components
INSERT INTO fournisseurs (id, nom, pays, type_fournisseur, contact, email, telephone, site_web, statut)
VALUES (
  'aaaaaaaa-0005-0005-0005-000000000005',
  'RS Components',
  'Royaume-Uni',
  'Composants électroniques et industriels',
  'Commercial RS',
  'france@rs-components.com',
  '0820 000 130',
  'https://fr.rs-online.com',
  true
);

-- ============================================================
-- DONNÉES INITIALES - COMMANDES
-- ============================================================

-- === AMAZON FRANCE (livraisons 24h, petits montants, consommables) ===
INSERT INTO commandes (fournisseur_id, reference_commande, montant, date_commande, date_livraison_prevue, date_livraison_reelle, statut, notes)
VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'AMZ-2025-001', 245.80, '2025-01-10', '2025-01-11', '2025-01-11', 'livree', 'Fournitures bureau'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'AMZ-2025-002', 189.50, '2025-02-05', '2025-02-06', '2025-02-06', 'livree', 'Consommables informatique'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'AMZ-2025-003', 312.00, '2025-03-15', '2025-03-16', '2025-03-16', 'livree', 'Câbles et accessoires'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'AMZ-2025-004', 156.40, '2025-04-20', '2025-04-21', '2025-04-21', 'livree', 'Papeterie'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'AMZ-2025-005', 423.00, '2025-05-08', '2025-05-09', '2025-05-09', 'livree', 'Cartouches imprimante'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'AMZ-2026-001', 299.90, '2026-01-14', '2026-01-15', '2026-01-15', 'livree', 'Fournitures diverses'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'AMZ-2026-002', 534.00, '2026-03-02', '2026-03-03', NULL, 'en_cours', 'Équipements petits');

-- === UGAP (matériel informatique et équipements, délais 10-20 jours) ===
INSERT INTO commandes (fournisseur_id, reference_commande, montant, date_commande, date_livraison_prevue, date_livraison_reelle, statut, notes)
VALUES
  ('aaaaaaaa-0002-0002-0002-000000000002', 'UGAP-2025-011', 1250.00, '2025-02-01', '2025-02-15', '2025-02-14', 'livree', 'Ordinateurs portables x2'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'UGAP-2025-012', 3800.00, '2025-03-10', '2025-03-28', '2025-03-30', 'livree', 'Serveur NAS'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'UGAP-2025-013', 680.00, '2025-04-15', '2025-04-29', '2025-04-28', 'livree', 'Écrans x2'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'UGAP-2025-014', 5200.00, '2025-06-01', '2025-06-18', '2025-06-20', 'livree', 'Mobilier de bureau'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'UGAP-2026-001', 2100.00, '2026-01-20', '2026-02-05', '2026-02-06', 'livree', 'Imprimante multifonction'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 'UGAP-2026-002', 8900.00, '2026-02-15', '2026-03-08', NULL, 'en_cours', 'Équipements audiovisuels salle réunion');

-- === FUSSIER OUTILLAGE (outillage, délais 5-15 jours, montants variés) ===
INSERT INTO commandes (fournisseur_id, reference_commande, montant, date_commande, date_livraison_prevue, date_livraison_reelle, statut, notes)
VALUES
  ('aaaaaaaa-0003-0003-0003-000000000003', 'FUS-2025-001', 450.00, '2025-01-20', '2025-01-28', '2025-01-27', 'livree', 'Outillage atelier'),
  ('aaaaaaaa-0003-0003-0003-000000000003', 'FUS-2025-002', 1200.00, '2025-03-05', '2025-03-12', '2025-03-13', 'livree', 'Perceuse colonne'),
  ('aaaaaaaa-0003-0003-0003-000000000003', 'FUS-2025-003', 320.00, '2025-05-10', '2025-05-17', '2025-05-16', 'livree', 'Consommables atelier'),
  ('aaaaaaaa-0003-0003-0003-000000000003', 'FUS-2025-004', 890.00, '2025-07-14', '2025-07-22', '2025-07-25', 'livree', 'Meuleuse + disques'),
  ('aaaaaaaa-0003-0003-0003-000000000003', 'FUS-2026-001', 1650.00, '2026-01-08', '2026-01-16', '2026-01-15', 'livree', 'Établi professionnel'),
  ('aaaaaaaa-0003-0003-0003-000000000003', 'FUS-2026-002', 275.00, '2026-02-20', '2026-02-27', NULL, 'en_cours', 'Visserie et fixations');

-- === ERM / PRUSA 3D (étranger, délais 15-30 jours, matériel et filaments) ===
INSERT INTO commandes (fournisseur_id, reference_commande, montant, date_commande, date_livraison_prevue, date_livraison_reelle, statut, notes)
VALUES
  ('aaaaaaaa-0004-0004-0004-000000000004', 'ERM-2025-001', 899.00, '2025-02-10', '2025-03-05', '2025-03-02', 'livree', 'Imprimante 3D Prusa MK4'),
  ('aaaaaaaa-0004-0004-0004-000000000004', 'ERM-2025-002', 185.00, '2025-04-01', '2025-04-22', '2025-04-28', 'livree', 'Filaments PLA 2kg'),
  ('aaaaaaaa-0004-0004-0004-000000000004', 'ERM-2025-003', 320.00, '2025-06-15', '2025-07-08', '2025-07-06', 'livree', 'Pièces détachées + filaments'),
  ('aaaaaaaa-0004-0004-0004-000000000004', 'ERM-2025-004', 210.00, '2025-09-01', '2025-09-22', '2025-10-01', 'livree', 'Filaments PETG et résine'),
  ('aaaaaaaa-0004-0004-0004-000000000004', 'ERM-2026-001', 450.00, '2026-01-10', '2026-02-01', '2026-02-05', 'livree', 'Accessoires impression 3D'),
  ('aaaaaaaa-0004-0004-0004-000000000004', 'ERM-2026-002', 189.00, '2026-03-01', '2026-03-24', NULL, 'en_cours', 'Filaments multicolores');

-- === RS COMPONENTS (étranger, délais 7-20 jours, composants électroniques) ===
INSERT INTO commandes (fournisseur_id, reference_commande, montant, date_commande, date_livraison_prevue, date_livraison_reelle, statut, notes)
VALUES
  ('aaaaaaaa-0005-0005-0005-000000000005', 'RS-2025-001', 380.00, '2025-01-15', '2025-01-25', '2025-01-23', 'livree', 'Composants électroniques'),
  ('aaaaaaaa-0005-0005-0005-000000000005', 'RS-2025-002', 1450.00, '2025-03-20', '2025-04-03', '2025-04-05', 'livree', 'Câbles industriels + connecteurs'),
  ('aaaaaaaa-0005-0005-0005-000000000005', 'RS-2025-003', 670.00, '2025-05-05', '2025-05-18', '2025-05-17', 'livree', 'Instruments de mesure'),
  ('aaaaaaaa-0005-0005-0005-000000000005', 'RS-2025-004', 2100.00, '2025-07-10', '2025-07-25', '2025-07-28', 'livree', 'Automates programmables'),
  ('aaaaaaaa-0005-0005-0005-000000000005', 'RS-2025-005', 890.00, '2025-10-01', '2025-10-15', '2025-10-14', 'livree', 'Relais et capteurs'),
  ('aaaaaaaa-0005-0005-0005-000000000005', 'RS-2026-001', 1200.00, '2026-02-10', '2026-02-25', NULL, 'en_cours', 'Module IoT et cartes Arduino');

-- ============================================================
-- DONNÉES INITIALES - ÉVALUATIONS
-- ============================================================

-- Amazon France : excellent fournisseur (24h, consommables)
INSERT INTO evaluations (fournisseur_id, qualite, delai, prix, reactivite, commentaire, date_evaluation)
VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 4.5, 5.0, 4.0, 5.0, 'Livraison 24h systématique, qualité produits bonne, prix compétitifs', '2025-06-01'),
  ('aaaaaaaa-0001-0001-0001-000000000001', 4.0, 5.0, 4.5, 5.0, 'Toujours rapide, retours simples, satisfaction globale élevée', '2025-12-01');

-- UGAP : bon fournisseur, délais acceptables
INSERT INTO evaluations (fournisseur_id, qualite, delai, prix, reactivite, commentaire, date_evaluation)
VALUES
  ('aaaaaaaa-0002-0002-0002-000000000002', 4.0, 3.0, 3.5, 3.5, 'Qualité professionnelle, délais parfois longs mais respectés', '2025-04-15'),
  ('aaaaaaaa-0002-0002-0002-000000000002', 4.5, 3.5, 3.0, 4.0, 'Très bonne qualité matériel, prix centrale d''achat avantageux', '2025-10-01');

-- Fussier Outillage : bon local, délais corrects
INSERT INTO evaluations (fournisseur_id, qualite, delai, prix, reactivite, commentaire, date_evaluation)
VALUES
  ('aaaaaaaa-0003-0003-0003-000000000003', 4.0, 3.5, 3.0, 4.0, 'Outillage professionnel de qualité, délais une semaine environ', '2025-04-01'),
  ('aaaaaaaa-0003-0003-0003-000000000003', 3.5, 4.0, 3.0, 3.5, 'Bon rapport qualité/prix, réactif pour les commandes urgentes', '2025-10-15');

-- ERM Prusa 3D : étranger, délais longs mais qualité
INSERT INTO evaluations (fournisseur_id, qualite, delai, prix, reactivite, commentaire, date_evaluation)
VALUES
  ('aaaaaaaa-0004-0004-0004-000000000004', 5.0, 2.0, 3.5, 2.5, 'Imprimantes Prusa excellentes, délais très longs depuis la Tchéquie', '2025-04-15'),
  ('aaaaaaaa-0004-0004-0004-000000000004', 4.5, 2.5, 3.0, 3.0, 'Qualité irréprochable mais fournisseur étranger, délais 3-4 semaines', '2025-11-01');

-- RS Components : étranger UK, délais moyens
INSERT INTO evaluations (fournisseur_id, qualite, delai, prix, reactivite, commentaire, date_evaluation)
VALUES
  ('aaaaaaaa-0005-0005-0005-000000000005', 4.0, 3.0, 2.5, 3.5, 'Large catalogue, prix élevés, délais UK corrects', '2025-04-20'),
  ('aaaaaaaa-0005-0005-0005-000000000005', 3.5, 3.0, 2.0, 3.0, 'Bon choix composants mais coûteux. Retards parfois à la douane', '2025-11-15');
