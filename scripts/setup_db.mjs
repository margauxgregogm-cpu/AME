/**
 * Script de création des tables et insertion des données initiales.
 * Utilise l'API REST Supabase via fetch.
 */

const SUPABASE_URL = 'https://fluseyscdejwxzgbbmgv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aPXp-pFDwk97oHWUDcjddg_0Z5-AbLa';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function insert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`INSERT ${table}: ${err}`);
  }
  console.log(`  ✓ ${table} — ${rows.length} ligne(s) insérée(s)`);
}

async function checkTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, { headers });
  return res.ok;
}

// ─── Données fournisseurs ─────────────────────────────────────────────────────

const fournisseurs = [
  {
    id: 'aaaaaaaa-0001-0001-0001-000000000001',
    nom: 'Amazon France',
    pays: 'France',
    type_fournisseur: 'E-commerce généraliste',
    contact: 'Service client',
    email: 'pro@amazon.fr',
    telephone: '09 70 00 00 00',
    site_web: 'https://www.amazon.fr/business',
    statut: true,
  },
  {
    id: 'aaaaaaaa-0002-0002-0002-000000000002',
    nom: 'UGAP',
    pays: 'France',
    type_fournisseur: "Centrale d'achat public",
    contact: 'Équipe commerciale',
    email: 'contact@ugap.fr',
    telephone: '01 64 73 20 00',
    site_web: 'https://www.ugap.fr',
    statut: true,
  },
  {
    id: 'aaaaaaaa-0003-0003-0003-000000000003',
    nom: 'Fussier Outillage',
    pays: 'France',
    type_fournisseur: 'Outillage et équipements',
    contact: 'M. Fussier',
    email: 'contact@fussier-outillage.fr',
    telephone: '03 26 77 12 34',
    site_web: 'https://www.fussier-outillage.fr',
    statut: true,
  },
  {
    id: 'aaaaaaaa-0004-0004-0004-000000000004',
    nom: 'ERM - Prusa 3D',
    pays: 'République Tchèque',
    type_fournisseur: 'Impression 3D et matériaux',
    contact: 'Support technique',
    email: 'support@prusa3d.com',
    telephone: '+420 222 112 808',
    site_web: 'https://www.prusa3d.com',
    statut: true,
  },
  {
    id: 'aaaaaaaa-0005-0005-0005-000000000005',
    nom: 'RS Components',
    pays: 'Royaume-Uni',
    type_fournisseur: 'Composants électroniques et industriels',
    contact: 'Commercial RS',
    email: 'france@rs-components.com',
    telephone: '0820 000 130',
    site_web: 'https://fr.rs-online.com',
    statut: true,
  },
];

// ─── Données commandes ────────────────────────────────────────────────────────

const commandes = [
  // Amazon France – livraisons 24h, consommables < 800€
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', reference_commande: 'AMZ-2025-001', montant: 245.80, date_commande: '2025-01-10', date_livraison_prevue: '2025-01-11', date_livraison_reelle: '2025-01-11', statut: 'livree', notes: 'Fournitures bureau' },
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', reference_commande: 'AMZ-2025-002', montant: 189.50, date_commande: '2025-02-05', date_livraison_prevue: '2025-02-06', date_livraison_reelle: '2025-02-06', statut: 'livree', notes: 'Consommables informatique' },
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', reference_commande: 'AMZ-2025-003', montant: 312.00, date_commande: '2025-03-15', date_livraison_prevue: '2025-03-16', date_livraison_reelle: '2025-03-16', statut: 'livree', notes: 'Câbles et accessoires' },
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', reference_commande: 'AMZ-2025-004', montant: 156.40, date_commande: '2025-04-20', date_livraison_prevue: '2025-04-21', date_livraison_reelle: '2025-04-21', statut: 'livree', notes: 'Papeterie' },
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', reference_commande: 'AMZ-2025-005', montant: 423.00, date_commande: '2025-05-08', date_livraison_prevue: '2025-05-09', date_livraison_reelle: '2025-05-09', statut: 'livree', notes: 'Cartouches imprimante' },
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', reference_commande: 'AMZ-2026-001', montant: 299.90, date_commande: '2026-01-14', date_livraison_prevue: '2026-01-15', date_livraison_reelle: '2026-01-15', statut: 'livree', notes: 'Fournitures diverses' },
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', reference_commande: 'AMZ-2026-002', montant: 534.00, date_commande: '2026-03-02', date_livraison_prevue: '2026-03-03', date_livraison_reelle: null, statut: 'en_cours', notes: 'Équipements petits' },

  // UGAP – matériel, délais 10-20 jours
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', reference_commande: 'UGAP-2025-011', montant: 1250.00, date_commande: '2025-02-01', date_livraison_prevue: '2025-02-15', date_livraison_reelle: '2025-02-14', statut: 'livree', notes: 'Ordinateurs portables x2' },
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', reference_commande: 'UGAP-2025-012', montant: 3800.00, date_commande: '2025-03-10', date_livraison_prevue: '2025-03-28', date_livraison_reelle: '2025-03-30', statut: 'livree', notes: 'Serveur NAS' },
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', reference_commande: 'UGAP-2025-013', montant: 680.00, date_commande: '2025-04-15', date_livraison_prevue: '2025-04-29', date_livraison_reelle: '2025-04-28', statut: 'livree', notes: 'Écrans x2' },
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', reference_commande: 'UGAP-2025-014', montant: 5200.00, date_commande: '2025-06-01', date_livraison_prevue: '2025-06-18', date_livraison_reelle: '2025-06-20', statut: 'livree', notes: 'Mobilier de bureau' },
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', reference_commande: 'UGAP-2026-001', montant: 2100.00, date_commande: '2026-01-20', date_livraison_prevue: '2026-02-05', date_livraison_reelle: '2026-02-06', statut: 'livree', notes: 'Imprimante multifonction' },
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', reference_commande: 'UGAP-2026-002', montant: 8900.00, date_commande: '2026-02-15', date_livraison_prevue: '2026-03-08', date_livraison_reelle: null, statut: 'en_cours', notes: 'Équipements audiovisuels salle réunion' },

  // Fussier Outillage – délais 5-15 jours
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', reference_commande: 'FUS-2025-001', montant: 450.00, date_commande: '2025-01-20', date_livraison_prevue: '2025-01-28', date_livraison_reelle: '2025-01-27', statut: 'livree', notes: 'Outillage atelier' },
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', reference_commande: 'FUS-2025-002', montant: 1200.00, date_commande: '2025-03-05', date_livraison_prevue: '2025-03-12', date_livraison_reelle: '2025-03-13', statut: 'livree', notes: 'Perceuse colonne' },
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', reference_commande: 'FUS-2025-003', montant: 320.00, date_commande: '2025-05-10', date_livraison_prevue: '2025-05-17', date_livraison_reelle: '2025-05-16', statut: 'livree', notes: 'Consommables atelier' },
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', reference_commande: 'FUS-2025-004', montant: 890.00, date_commande: '2025-07-14', date_livraison_prevue: '2025-07-22', date_livraison_reelle: '2025-07-25', statut: 'livree', notes: 'Meuleuse + disques' },
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', reference_commande: 'FUS-2026-001', montant: 1650.00, date_commande: '2026-01-08', date_livraison_prevue: '2026-01-16', date_livraison_reelle: '2026-01-15', statut: 'livree', notes: 'Établi professionnel' },
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', reference_commande: 'FUS-2026-002', montant: 275.00, date_commande: '2026-02-20', date_livraison_prevue: '2026-02-27', date_livraison_reelle: null, statut: 'en_cours', notes: 'Visserie et fixations' },

  // ERM Prusa – étranger, délais 20-30 jours
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', reference_commande: 'ERM-2025-001', montant: 899.00, date_commande: '2025-02-10', date_livraison_prevue: '2025-03-05', date_livraison_reelle: '2025-03-02', statut: 'livree', notes: 'Imprimante 3D Prusa MK4' },
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', reference_commande: 'ERM-2025-002', montant: 185.00, date_commande: '2025-04-01', date_livraison_prevue: '2025-04-22', date_livraison_reelle: '2025-04-28', statut: 'livree', notes: 'Filaments PLA 2kg' },
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', reference_commande: 'ERM-2025-003', montant: 320.00, date_commande: '2025-06-15', date_livraison_prevue: '2025-07-08', date_livraison_reelle: '2025-07-06', statut: 'livree', notes: 'Pièces détachées + filaments' },
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', reference_commande: 'ERM-2025-004', montant: 210.00, date_commande: '2025-09-01', date_livraison_prevue: '2025-09-22', date_livraison_reelle: '2025-10-01', statut: 'livree', notes: 'Filaments PETG et résine' },
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', reference_commande: 'ERM-2026-001', montant: 450.00, date_commande: '2026-01-10', date_livraison_prevue: '2026-02-01', date_livraison_reelle: '2026-02-05', statut: 'livree', notes: 'Accessoires impression 3D' },
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', reference_commande: 'ERM-2026-002', montant: 189.00, date_commande: '2026-03-01', date_livraison_prevue: '2026-03-24', date_livraison_reelle: null, statut: 'en_cours', notes: 'Filaments multicolores' },

  // RS Components – étranger UK, délais 7-20 jours
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', reference_commande: 'RS-2025-001', montant: 380.00, date_commande: '2025-01-15', date_livraison_prevue: '2025-01-25', date_livraison_reelle: '2025-01-23', statut: 'livree', notes: 'Composants électroniques' },
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', reference_commande: 'RS-2025-002', montant: 1450.00, date_commande: '2025-03-20', date_livraison_prevue: '2025-04-03', date_livraison_reelle: '2025-04-05', statut: 'livree', notes: 'Câbles industriels + connecteurs' },
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', reference_commande: 'RS-2025-003', montant: 670.00, date_commande: '2025-05-05', date_livraison_prevue: '2025-05-18', date_livraison_reelle: '2025-05-17', statut: 'livree', notes: 'Instruments de mesure' },
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', reference_commande: 'RS-2025-004', montant: 2100.00, date_commande: '2025-07-10', date_livraison_prevue: '2025-07-25', date_livraison_reelle: '2025-07-28', statut: 'livree', notes: 'Automates programmables' },
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', reference_commande: 'RS-2025-005', montant: 890.00, date_commande: '2025-10-01', date_livraison_prevue: '2025-10-15', date_livraison_reelle: '2025-10-14', statut: 'livree', notes: 'Relais et capteurs' },
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', reference_commande: 'RS-2026-001', montant: 1200.00, date_commande: '2026-02-10', date_livraison_prevue: '2026-02-25', date_livraison_reelle: null, statut: 'en_cours', notes: 'Module IoT et cartes Arduino' },
];

// ─── Données évaluations ──────────────────────────────────────────────────────

const evaluations = [
  // Amazon France : excellent (24h, tout bon)
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', qualite: 4.5, delai: 5.0, prix: 4.0, reactivite: 5.0, commentaire: 'Livraison 24h systématique, qualité bonne, prix compétitifs', date_evaluation: '2025-06-01' },
  { fournisseur_id: 'aaaaaaaa-0001-0001-0001-000000000001', qualite: 4.0, delai: 5.0, prix: 4.5, reactivite: 5.0, commentaire: 'Toujours rapide, retours simples, satisfaction élevée', date_evaluation: '2025-12-01' },

  // UGAP : bon, délais acceptables
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', qualite: 4.0, delai: 3.0, prix: 3.5, reactivite: 3.5, commentaire: 'Qualité professionnelle, délais parfois longs mais respectés', date_evaluation: '2025-04-15' },
  { fournisseur_id: 'aaaaaaaa-0002-0002-0002-000000000002', qualite: 4.5, delai: 3.5, prix: 3.0, reactivite: 4.0, commentaire: 'Très bonne qualité matériel, prix centrale achat avantageux', date_evaluation: '2025-10-01' },

  // Fussier : bon local
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', qualite: 4.0, delai: 3.5, prix: 3.0, reactivite: 4.0, commentaire: 'Outillage professionnel, délais environ une semaine', date_evaluation: '2025-04-01' },
  { fournisseur_id: 'aaaaaaaa-0003-0003-0003-000000000003', qualite: 3.5, delai: 4.0, prix: 3.0, reactivite: 3.5, commentaire: 'Bon rapport qualité/prix, réactif pour urgences', date_evaluation: '2025-10-15' },

  // ERM Prusa : qualité top, délais très longs
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', qualite: 5.0, delai: 2.0, prix: 3.5, reactivite: 2.5, commentaire: 'Imprimantes Prusa excellentes, délais très longs depuis la Tchéquie', date_evaluation: '2025-04-15' },
  { fournisseur_id: 'aaaaaaaa-0004-0004-0004-000000000004', qualite: 4.5, delai: 2.5, prix: 3.0, reactivite: 3.0, commentaire: 'Qualité irréprochable, fournisseur étranger, 3-4 semaines', date_evaluation: '2025-11-01' },

  // RS Components : large catalogue, prix élevés
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', qualite: 4.0, delai: 3.0, prix: 2.5, reactivite: 3.5, commentaire: 'Large catalogue, prix élevés, délais UK corrects', date_evaluation: '2025-04-20' },
  { fournisseur_id: 'aaaaaaaa-0005-0005-0005-000000000005', qualite: 3.5, delai: 3.0, prix: 2.0, reactivite: 3.0, commentaire: 'Bon choix composants mais coûteux. Retards parfois à la douane', date_evaluation: '2025-11-15' },
];

// ─── Exécution ────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Configuration de la base de données OSC7...\n');

  // Vérification de la connexion
  const ok = await checkTable('fournisseurs');
  if (!ok) {
    console.error('❌ La table "fournisseurs" n\'existe pas encore.');
    console.error('\nÀ faire dans le dashboard Supabase :');
    console.error('→ https://supabase.com/dashboard/project/fluseyscdejwxzgbbmgv/sql/new');
    console.error('\nColler et exécuter uniquement la partie DDL du fichier supabase_schema.sql');
    console.error('(les blocs CREATE TABLE, CREATE EXTENSION, CREATE FUNCTION, CREATE TRIGGER)\n');
    process.exit(1);
  }

  console.log('✓ Connexion Supabase OK\n');

  try {
    console.log('📦 Insertion des fournisseurs...');
    await insert('fournisseurs', fournisseurs);

    console.log('\n📋 Insertion des commandes...');
    await insert('commandes', commandes);

    console.log('\n⭐ Insertion des évaluations...');
    await insert('evaluations', evaluations);

    console.log('\n✅ Base de données configurée avec succès !');
    console.log('   L\'application est prête sur http://localhost:3000\n');
  } catch (err) {
    console.error('\n❌ Erreur :', err.message);
    process.exit(1);
  }
}

main();
