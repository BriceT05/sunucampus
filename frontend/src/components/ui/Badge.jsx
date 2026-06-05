const VARIANTS = {
  // etat chambre
  disponible:  'bg-emerald-100 text-emerald-700',
  occupee:     'bg-blue-100 text-blue-700',
  'en travaux':'bg-amber-100 text-amber-700',
  // priorité incident
  urgente:     'bg-red-100 text-red-700 ring-1 ring-red-200',
  moyenne:     'bg-orange-100 text-orange-700',
  faible:      'bg-slate-100 text-slate-600',
  // statut incident
  ouvert:      'bg-yellow-100 text-yellow-700',
  'en cours':  'bg-blue-100 text-blue-700',
  resolu:      'bg-emerald-100 text-emerald-700',
  // niveau
  L1: 'bg-indigo-100 text-indigo-700',
  L2: 'bg-indigo-100 text-indigo-700',
  L3: 'bg-indigo-100 text-indigo-700',
  M1: 'bg-purple-100 text-purple-700',
  M2: 'bg-purple-100 text-purple-700',
};

const LABELS = {
  disponible:  'Disponible',
  occupee:     'Occupée',
  'en travaux':'En travaux',
  urgente:     'Urgente',
  moyenne:     'Moyenne',
  faible:      'Faible',
  ouvert:      'Ouvert',
  'en cours':  'En cours',
  resolu:      'Résolu',
};

export default function Badge({ value, label, className = '' }) {
  const cls = VARIANTS[value] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`badge ${cls} ${className}`}>
      {label ?? LABELS[value] ?? value}
    </span>
  );
}
