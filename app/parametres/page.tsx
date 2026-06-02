'use client';

import { useState } from 'react';
import { Settings, Database, Info, ExternalLink, CheckCircle } from 'lucide-react';

export default function ParametresPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const connected = supabaseUrl && supabaseUrl !== 'your_supabase_project_url';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-1">Configuration du logiciel OSC7 Gestion Fournisseurs</p>
      </div>

      {/* Connexion Supabase */}
      <Section title="Connexion Supabase" icon={<Database size={18} />}>
        <div className="space-y-3">
          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${connected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
            <CheckCircle size={15} />
            {connected ? `Connecté à : ${supabaseUrl}` : 'Configuration requise — éditez le fichier .env.local'}
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>Pour configurer la connexion Supabase :</p>
            <ol className="list-decimal list-inside space-y-0.5 pl-2">
              <li>Créez un projet sur <a href="https://supabase.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">supabase.com</a></li>
              <li>Copiez l&apos;URL et la clé anonyme depuis <em>Settings → API</em></li>
              <li>Renseignez-les dans le fichier <code className="bg-slate-100 px-1 rounded">.env.local</code></li>
              <li>Exécutez le fichier <code className="bg-slate-100 px-1 rounded">supabase_schema.sql</code> dans l&apos;éditeur SQL Supabase</li>
            </ol>
          </div>
          <div className="bg-slate-900 text-green-400 font-mono text-xs p-3 rounded-lg">
            <div># .env.local</div>
            <div>NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...</div>
          </div>
        </div>
      </Section>

      {/* Règles métier */}
      <Section title="Règles métier" icon={<Settings size={18} />}>
        <div className="space-y-4 text-sm">
          <RuleItem title="Catégorisation des achats">
            <div className="grid grid-cols-2 gap-2 text-xs mt-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2"><span className="font-semibold text-blue-700">Consommable</span> — montant &lt; 800 €</div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2"><span className="font-semibold text-purple-700">Investissement</span> — montant ≥ 800 €</div>
            </div>
          </RuleItem>
          <RuleItem title="Indicateur de rapidité">
            <div className="grid grid-cols-3 gap-2 text-xs mt-1">
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center"><span className="font-semibold text-green-700">Rapide</span><br />délai &lt; 7 jours</div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center"><span className="font-semibold text-yellow-700">Normal</span><br />7 – 21 jours</div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center"><span className="font-semibold text-red-700">Lent</span><br />délai &gt; 21 jours</div>
            </div>
          </RuleItem>
          <RuleItem title="Pondération des notes">
            <div className="grid grid-cols-2 gap-2 text-xs mt-1">
              <div className="bg-slate-50 rounded-lg p-2">Qualité : <strong>40%</strong></div>
              <div className="bg-slate-50 rounded-lg p-2">Délai : <strong>35%</strong></div>
              <div className="bg-slate-50 rounded-lg p-2">Prix : <strong>15%</strong></div>
              <div className="bg-slate-50 rounded-lg p-2">Réactivité : <strong>10%</strong></div>
            </div>
          </RuleItem>
          <RuleItem title="Seuils d'alerte">
            <ul className="text-xs space-y-1 mt-1 text-slate-600">
              <li>🔴 Note globale &lt; 2,5/5</li>
              <li>🔴 Note qualité &lt; 2/5</li>
              <li>🔴 Fournisseur inactif</li>
              <li>🟠 Délai moyen &gt; 21 jours</li>
              <li>🟠 Commande ou cumul &gt; 25 000 €</li>
              <li>🟡 Fournisseur étranger</li>
            </ul>
          </RuleItem>
        </div>
      </Section>

      {/* À propos */}
      <Section title="À propos" icon={<Info size={18} />}>
        <div className="text-sm text-slate-600 space-y-1">
          <p><strong>OSC7 — Gestion Fournisseurs</strong> v1.0.0</p>
          <p>Application web de gestion et d&apos;évaluation des fournisseurs du projet OSC7.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <TechBadge>Next.js 14</TechBadge>
            <TechBadge>Supabase</TechBadge>
            <TechBadge>TypeScript</TechBadge>
            <TechBadge>Tailwind CSS</TechBadge>
            <TechBadge>Vercel</TechBadge>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-base">{icon}{title}</h2>
      {children}
    </div>
  );
}

function RuleItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-medium text-slate-700">{title}</div>
      {children}
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">{children}</span>;
}
