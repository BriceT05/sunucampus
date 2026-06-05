export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-primary text-white',    text: 'text-primary' },
    gold:   { bg: 'bg-amber-50',  icon: 'bg-accent text-white',     text: 'text-accent-dark' },
    green:  { bg: 'bg-emerald-50',icon: 'bg-emerald-500 text-white',text: 'text-emerald-600' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-500 text-white',    text: 'text-red-600' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-500 text-white', text: 'text-indigo-600' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`card ${c.bg} border-0 p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${c.icon} flex items-center justify-center shadow-sm`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className={`text-3xl font-black ${c.text} leading-none`}>{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-2">{sub}</p>}
    </div>
  );
}
