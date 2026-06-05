import { useEffect, useState } from 'react';
import { BedDouble, AlertTriangle, CreditCard, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { dashboardAPI } from '../services/api';

const fmtCFA = n => new Intl.NumberFormat('fr-FR').format(Number(n) || 0) + ' FCFA';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
      </div>
      <Skeleton className="h-80" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BedDouble}    label="Taux d'occupation"     value={`${stats.tauxOccupation}%`}         sub={`${stats.chambresOccupees} / ${stats.totalChambres} chambres`} color="blue" />
        <StatCard icon={BedDouble}    label="Chambres disponibles"  value={stats.chambresDisponibles}           sub="Libres immédiatement"                                            color="green" />
        <StatCard icon={CreditCard}   label="Loyers impayés (mois)" value={fmtCFA(stats.loyersImpayesMois)}    sub="Mois en cours"                                                   color="red" />
        <StatCard icon={AlertTriangle}label="Incidents urgents"     value={stats.incidentsUrgents}             sub="Non résolus"                                                     color="gold" />
      </div>

      {/* Graphique + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <div>
              <h3 className="section-title">Revenus — 6 derniers mois</h3>
              <p className="text-sm text-slate-400 mt-0.5">Loyers encaissés</p>
            </div>
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div className="card-body pt-0">
            {stats.revenus6Mois?.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-slate-400">Aucun paiement enregistré</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.revenus6Mois} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mois_libelle" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={v => (v / 1000) + 'k'} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    formatter={v => [fmtCFA(v), 'Perçu']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  <Bar dataKey="total_percu" name="Perçu" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Incidents actifs */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Incidents actifs</h3>
            <span className="badge bg-red-100 text-red-600">{stats.alertesRecentes?.length || 0}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.alertesRecentes?.length === 0 && (
              <p className="px-6 py-8 text-center text-slate-400 text-sm">Aucun incident actif</p>
            )}
            {stats.alertesRecentes?.map((inc, i) => (
              <div key={i} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    inc.priorite === 'urgente' ? 'bg-red-500' : inc.priorite === 'moyenne' ? 'bg-orange-400' : 'bg-blue-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 line-clamp-2">{inc.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{inc.nom_batiment} — Ch. {inc.num_chambre}</p>
                  </div>
                  <Badge value={inc.priorite} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre d'occupation */}
      <div className="card">
        <div className="card-header">
          <h3 className="section-title">Occupation globale</h3>
          <span className="text-2xl font-black text-primary">{stats.tauxOccupation}%</span>
        </div>
        <div className="card-body pt-2">
          <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.tauxOccupation}%`, background: 'linear-gradient(90deg,#1D4ED8,#3B82F6)' }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Total',       val: stats.totalChambres,      color: 'text-slate-700' },
              { label: 'Occupées',    val: stats.chambresOccupees,   color: 'text-primary' },
              { label: 'Disponibles', val: stats.chambresDisponibles,color: 'text-emerald-600' },
              { label: 'Taux',        val: stats.tauxOccupation + '%',color:'text-accent-dark' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-slate-50">
                <p className={`text-2xl font-black ${color}`}>{val}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
