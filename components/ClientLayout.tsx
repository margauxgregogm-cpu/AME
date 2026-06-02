'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { supabase } from '@/lib/supabase';
import { genererAlertes, buildFournisseurStats } from '@/lib/utils';
import type { Fournisseur, Commande, Evaluation } from '@/lib/types';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    async function loadAlertCount() {
      try {
        const [{ data: fournisseurs }, { data: commandes }, { data: evaluations }] = await Promise.all([
          supabase.from('fournisseurs').select('*'),
          supabase.from('commandes').select('*'),
          supabase.from('evaluations').select('*'),
        ]);
        if (!fournisseurs) return;
        let count = 0;
        for (const f of fournisseurs as Fournisseur[]) {
          const fc = (commandes as Commande[] || []).filter(c => c.fournisseur_id === f.id);
          const fe = (evaluations as Evaluation[] || []).filter(e => e.fournisseur_id === f.id);
          count += genererAlertes(f, fc, fe).length;
        }
        setAlertCount(count);
      } catch {
        // Silently fail if Supabase not configured
      }
    }
    loadAlertCount();
  }, []);

  return (
    <div className="flex h-full min-h-screen bg-slate-50">
      <Sidebar alertCount={alertCount} />
      <main className="flex-1 ml-60 min-h-screen overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
