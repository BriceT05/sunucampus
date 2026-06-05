import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, BedDouble, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { etudiantsAPI } from '../services/api';
import Badge from '../components/ui/Badge';

const fmtCFA  = n => new Intl.NumberFormat('fr-FR').format(Number(n) || 0) + ' FCFA';
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const MOIS_NOMS = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function EtudiantDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    etudiantsAPI.getById(id)
      .then(r => setData(r.data))
      .catch(e => { toast.error(e.message); navigate('/etudiants'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Chargement…</div>;
  if (!data)   return null;

  const totalPaye = data.paiements?.reduce((s, p) => s + Number(p.montant), 0) || 0;
  const attribution = data.attributions?.[0];

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => navigate('/etudiants')} className="btn-ghost">
        <ArrowLeft size={18} /> Retour aux étudiants
      </button>

      {/* En-tête */}
      <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {data.prenom?.[0]}{data.nom?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-slate-800">{data.prenom} {data.nom}</h2>
          <p className="text-slate-500 text-sm">Étudiant #{data.num_etudiant}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge value={data.niveau} />
            {data.filiere && <span className="badge bg-slate-100 text-slate-600">{data.filiere}</span>}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
            {data.email     && <span className="flex items-center gap-1.5"><Mail  size={14}/>{data.email}</span>}
            {data.telephone && <span className="flex items-center gap-1.5"><Phone size={14}/>{data.telephone}</span>}
          </div>
        </div>
        {attribution && (
          <div className="bg-blue-50 rounded-2xl p-4 text-center flex-shrink-0">
            <BedDouble size={24} className="text-primary mx-auto mb-1" />
            <p className="text-lg font-black text-primary">Ch. {attribution.num_chambre}</p>
            <p className="text-xs text-slate-500">{attribution.nom_batiment}</p>
            <p className="text-xs text-primary font-semibold mt-1">{fmtCFA(attribution.loyer_mensuel)}/mois</p>
          </div>
        )}
      </div>

      {/* Stats paiements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 bg-emerald-50 border-0 text-center">
          <p className="text-2xl font-black text-emerald-600">{fmtCFA(totalPaye)}</p>
          <p className="text-sm text-slate-500 mt-1">Total payé</p>
        </div>
        <div className="card p-5 bg-blue-50 border-0 text-center">
          <p className="text-2xl font-black text-primary">{data.paiements?.length || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Paiements enregistrés</p>
        </div>
      </div>

      {/* Historique paiements */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title flex items-center gap-2"><CreditCard size={18}/>Historique des paiements</h3>
          <span className="badge bg-primary/10 text-primary">{data.paiements?.length || 0}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr><th>Mois / Année</th><th>Chambre</th><th>Bâtiment</th><th>Montant</th><th>Date paiement</th></tr>
            </thead>
            <tbody>
              {!data.paiements?.length ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Aucun paiement</td></tr>
              ) : data.paiements.map(p => (
                <tr key={p.id_paiement}>
                  <td className="font-semibold">{MOIS_NOMS[p.mois]} {p.annee}</td>
                  <td className="text-sm">Ch. {p.num_chambre}</td>
                  <td className="text-sm text-slate-500">{p.nom_batiment}</td>
                  <td className="font-bold text-emerald-600">{fmtCFA(p.montant)}</td>
                  <td className="text-sm text-slate-500">{fmtDate(p.date_paiement_effectif)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique attributions */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title flex items-center gap-2"><BedDouble size={18}/>Attributions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr><th>Chambre</th><th>Bâtiment</th><th>Type</th><th>Entrée</th><th>Sortie prévue</th><th>Caution</th></tr>
            </thead>
            <tbody>
              {!data.attributions?.length ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Aucune attribution</td></tr>
              ) : data.attributions.map(a => (
                <tr key={`${a.num_etudiant}-${a.num_chambre}`}>
                  <td className="font-semibold">Ch. {a.num_chambre}</td>
                  <td>{a.nom_batiment}</td>
                  <td className="capitalize">{a.type}</td>
                  <td className="text-sm text-slate-500">{fmtDate(a.date_entree)}</td>
                  <td className="text-sm text-slate-500">{fmtDate(a.date_sortie_prevue)}</td>
                  <td className="text-sm">{fmtCFA(a.caution_versee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
