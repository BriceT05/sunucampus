import { useEffect, useState, useCallback } from 'react';
import { Plus, CreditCard, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { paiementsAPI, attributionsAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const MOIS_NOMS = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const fmtCFA  = n => new Intl.NumberFormat('fr-FR').format(Number(n) || 0) + ' FCFA';
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const now = new Date();
const EMPTY = { num_etudiant:'', num_chambre:'', mois: now.getMonth() + 1, annee: now.getFullYear(), montant:'', date_paiement_effectif: now.toISOString().slice(0,10) };

export default function Paiements() {
  const [paiements,    setPaiements]    = useState([]);
  const [attributions, setAttributions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterMois,   setFilterMois]   = useState('');
  const [filterAnnee,  setFilterAnnee]  = useState('');
  const [modal,        setModal]        = useState({ open: false, mode: 'create', data: EMPTY });
  const [confirm,      setConfirm]      = useState({ open: false, id: null });
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMois)  params.mois  = filterMois;
      if (filterAnnee) params.annee = filterAnnee;
      const [pa, at] = await Promise.all([paiementsAPI.getAll(params), attributionsAPI.getAll()]);
      setPaiements(pa.data);
      setAttributions(at.data);
    } catch (e) { toast.error(e.message); }
    finally     { setLoading(false); }
  }, [filterMois, filterAnnee]);

  useEffect(() => { load(); }, [load]);

  const closeModal = () => setModal(p => ({ ...p, open: false }));
  const setField   = (k, v) => setModal(p => ({ ...p, data: { ...p.data, [k]: v } }));

  const onAttrChange = (id) => {
    const attr = attributions.find(a => `${a.num_etudiant}-${a.num_chambre}` === id);
    if (attr) setModal(p => ({ ...p, data: { ...p.data, num_etudiant: attr.num_etudiant, num_chambre: attr.num_chambre, montant: attr.loyer_mensuel } }));
  };

  const handleSave = async () => {
    const { data, mode } = modal;
    if (mode === 'create' && (!data.num_etudiant || !data.mois || !data.annee || !data.montant))
      return toast.error('Champs requis manquants');
    setSaving(true);
    try {
      if (mode === 'create') await paiementsAPI.create(data);
      else                   await paiementsAPI.update(data.id_paiement, data);
      toast.success(mode === 'create' ? 'Paiement enregistré' : 'Paiement modifié');
      closeModal(); load();
    } catch (e) { toast.error(e.message); }
    finally     { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await paiementsAPI.delete(confirm.id);
      toast.success('Paiement supprimé');
      setConfirm({ open: false, id: null }); load();
    } catch (e) { toast.error(e.message); }
    finally     { setDeleting(false); }
  };

  const totalMois = paiements.reduce((s, p) => s + Number(p.montant), 0);

  const annees = [...new Set(paiements.map(p => p.annee))].sort((a, b) => b - a);

  return (
    <div className="space-y-5">
      {/* Résumé */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 bg-blue-50 border-0">
          <p className="text-slate-500 text-sm mb-1">Total encaissé (filtres actifs)</p>
          <p className="text-2xl font-black text-primary">{fmtCFA(totalMois)}</p>
        </div>
        <div className="card p-5 bg-emerald-50 border-0">
          <p className="text-slate-500 text-sm mb-1">Nombre de paiements</p>
          <p className="text-2xl font-black text-emerald-600">{paiements.length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="card card-body flex flex-wrap gap-3">
        <select className="select w-44" value={filterMois} onChange={e => setFilterMois(e.target.value)}>
          <option value="">Tous les mois</option>
          {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{MOIS_NOMS[i+1]}</option>)}
        </select>
        <select className="select w-32" value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}>
          <option value="">Toutes années</option>
          {[2024,2025,2026].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={() => setModal({ open: true, mode: 'create', data: { ...EMPTY } })} className="btn-primary ml-auto">
          <Plus size={18} /> Enregistrer paiement
        </button>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title">Historique des paiements</h3>
          <span className="badge bg-primary/10 text-primary">{paiements.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Chambre</th>
                <th>Bâtiment</th>
                <th>Mois / Année</th>
                <th>Montant</th>
                <th>Date paiement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Chargement…</td></tr>
              ) : paiements.length === 0 ? (
                <tr><td colSpan={7}><div className="flex flex-col items-center py-16 gap-3">
                  <CreditCard size={40} className="text-slate-300" />
                  <p className="text-slate-400">Aucun paiement trouvé</p>
                </div></td></tr>
              ) : paiements.map(p => (
                <tr key={p.id_paiement}>
                  <td><div className="font-semibold text-slate-800">{p.nom} {p.prenom}</div></td>
                  <td className="text-sm font-medium">Ch. {p.num_chambre}</td>
                  <td className="text-sm text-slate-500">{p.nom_batiment}</td>
                  <td className="text-sm font-medium">{MOIS_NOMS[p.mois]} {p.annee}</td>
                  <td className="font-bold text-emerald-600">{fmtCFA(p.montant)}</td>
                  <td className="text-sm text-slate-500">{fmtDate(p.date_paiement_effectif)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ open:true, mode:'edit', data:{...p} })} className="btn-icon text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setConfirm({ open: true, id: p.id_paiement })} className="btn-icon text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modal.open} onClose={closeModal} title={modal.mode === 'create' ? 'Enregistrer un paiement' : 'Modifier le paiement'} size="md">
        <div className="space-y-4">
          {modal.mode === 'create' && (
            <div>
              <label className="label">Locataire (attribution) *</label>
              <select className="select" onChange={e => onAttrChange(e.target.value)} defaultValue="">
                <option value="">Sélectionner…</option>
                {attributions.map(a => (
                  <option key={`${a.num_etudiant}-${a.num_chambre}`} value={`${a.num_etudiant}-${a.num_chambre}`}>
                    {a.nom} {a.prenom} — Ch. {a.num_chambre} ({new Intl.NumberFormat('fr-FR').format(a.loyer_mensuel)} F)
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mois *</label>
              <select className="select" value={modal.data.mois} onChange={e => setField('mois', +e.target.value)}>
                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{MOIS_NOMS[i+1]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Année *</label>
              <input type="number" className="input" value={modal.data.annee} onChange={e => setField('annee', +e.target.value)} />
            </div>
            <div>
              <label className="label">Montant (FCFA) *</label>
              <input type="number" className="input" value={modal.data.montant} onChange={e => setField('montant', e.target.value)} />
            </div>
            <div>
              <label className="label">Date de paiement</label>
              <input type="date" className="input" value={modal.data.date_paiement_effectif || ''} onChange={e => setField('date_paiement_effectif', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={closeModal}>Annuler</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Valider'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete} loading={deleting}
        title="Supprimer le paiement"
        message="Ce paiement sera définitivement supprimé."
      />
    </div>
  );
}
