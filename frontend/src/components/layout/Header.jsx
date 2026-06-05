import { useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';

const TITLES = {
  '/dashboard':    { title: 'Tableau de bord',   subtitle: 'Vue d\'ensemble de la résidence' },
  '/etudiants':    { title: 'Étudiants',          subtitle: 'Gestion des résidents' },
  '/chambres':     { title: 'Chambres',           subtitle: 'Gestion du parc immobilier' },
  '/attributions': { title: 'Attributions',       subtitle: 'Affectation des chambres' },
  '/paiements':    { title: 'Paiements',          subtitle: 'Suivi des loyers' },
  '/incidents':    { title: 'Incidents',          subtitle: 'Signalements et maintenances' },
  '/batiments':    { title: 'Bâtiments',          subtitle: 'Gestion des bâtiments' },
};

export default function Header() {
  const { pathname } = useLocation();
  const key   = '/' + pathname.split('/')[1];
  const info  = TITLES[key] || { title: 'SunuCampus', subtitle: '' };
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{info.title}</h1>
        <p className="text-sm text-slate-500 capitalize">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">Gestionnaire</p>
            <p className="text-xs text-slate-500">Résidence ESP/UCAD</p>
          </div>
        </div>
      </div>
    </header>
  );
}
