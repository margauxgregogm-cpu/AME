'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  Star,
  Bell,
  Settings,
} from 'lucide-react';

const nav = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/fournisseurs', label: 'Fournisseurs', icon: Building2 },
  { href: '/commandes', label: 'Commandes', icon: ShoppingCart },
  { href: '/evaluations', label: 'Évaluations', icon: Star },
  { href: '/alertes', label: 'Alertes', icon: Bell },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
];

export default function Sidebar({ alertCount = 0 }: { alertCount?: number }) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-slate-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">OSC7</div>
        <div className="text-lg font-bold text-white leading-tight">Gestion</div>
        <div className="text-lg font-bold text-blue-400 leading-tight">Fournisseurs</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
              {label === 'Alertes' && alertCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">v1.0.0 — OSC7</div>
      </div>
    </aside>
  );
}
