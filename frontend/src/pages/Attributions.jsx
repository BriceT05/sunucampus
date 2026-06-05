import { useEffect, useState, useCallback } from 'react';
import { Plus, ClipboardList, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { attributionsAPI, etudiantsAPI, chambresAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const fmtCFA = n => new Intl.NumberFormat('fr-FR').format(n);
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const EMPTY = { num_etudiant:'', num_chambre:'', date_entree: new Date().toISOString().slice(0,10), date_sortie_prevue:'', caution_versee:'' };

export default function Attributions() {
  const [attributions, setAttributions] = useState([]);
  const [etudiants,    setEtudiants]    = useState([]);
  const [chambres,     setChambres]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState({ open: false, data: EMPTY });
  const [confirmEnd,   setConfirmEnd]   = useState({ open: false, num_etudiant: null, num_chambre: null });
  const [saving,       setSaving]       = useState(false);
  const [ending,       setEnding]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [at, et, ch] = await Promise.all([
        attributionsAPI.getAll(),
        etudiantsAPI.getAll(),
        chambresAPI.getAll({ etat: 'disponible' }),
      ]);
      setAttributions(at.data);
      setEtudiants(et.data.filter(e => !e.num_chambre));
      setChambres(ch.data);
    } catch (e) { toast.error(e.message); }
    finally     { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const { data } = modal;
    if (!data.num_etudiant || !data.num_chambre || !data.date_entree)
      return toast.error('Étudiant, chambre et date requis');
    setSaving(true);
    try {
      await attributionsAPI.create(data);
      toast.success('Attribution créée');
      setModal(p => ({ ...p, open: false })); load();
    } catch (e) { toast.error(e.message); }
    finally     { setSaving(false); }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      await attributionsAPI.terminer(confirmEnd.num_etudiant, confirmEnd.num_chambre);
      toast.success('Attribution terminée, chambre libérée');
      setConfirmEnd({ open: false, num_etudiant: null, num_chambre: null }); load();
    } catch (e) { toast.error(e.message); }
    finally     { setEnding(false); }
  };

  const setField = (k, v) => setModal(p => ({ ...p, data: { ...p.data, [k]: v } }));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setModal({ open: true, data: { ...EMPTY } })} className="btn-primary">
          <Plus size={18} /> Nouvelle attribution
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title">Attributions en cours</h3>
          <span className="badge bg-primary/10 text-primary">{attributions.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Chambre</th>
                <th>Bâtiment</th>
                <th>Date entrée</th>
                <th>Date fin</th>
                <th>Caution</th>
                <th>Loyer/mois</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">Chargement…</td></tr>
              ) : attributions.length === 0 ? (
                <tr><td colSpan={8}><div className="flex flex-col items-center py-16 gap-3">
                  <ClipboardList size={40} className="text-slate-300" />
                  <p className="text-slate-400">Aucune attribution en cours</p>
                </div></td></tr>
              ) : attributions.map(a => (
                <tr key={`${a.num_etudiant}-${a.num_chambre}`}>
                  <td>
                    <div className="font-semibold text-slate-800">{a.nom} {a.prenom}</div>
                    <div className="text-xs text-slate-400">{a.filiere} · {a.niveau}</div>
                  </td>
                  <td className="font-semibold">Ch. {a.num_chambre}</td>
                  <td className="text-sm text-slate-500">{a.nom_batiment}</td>
                  <td className="text-sm">{fmtDate(a.date_entree)}</td>
                  <td className="text-sm">{fmtDate(a.date_sortie_prevue)}</td>
                  <td className="text-sm font-medium">{fmtCFA(a.caution_versee)} F</td>
                  <td className="text-sm font-bold text-primary">{fmtCFA(a.loyer_mensuel)} F</td>
                  <td>
                    <button
                      onClick={() => setConfirmEnd({ open: true, num_etudiant: a.num_etudiant, num_chambre: a.num_chambre })}
                      className="btn-sm btn-secondary text-red-500 hover:border-red-200"
                    >
                      <LogOut size={13} /> Libérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal(p => ({ ...p, open: false }))} title="Nouvelle attribution" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Étudiant *</label>
            <select className="select" value={modal.data.num_etudiant} onChange={e => setField('num_etudiant', e.target.value)}>
              <option value="">Sélectionner un étudiant sans chambre…</option>
              {etudiants.map(e => <option key={e.num_etudiant} value={e.num_etudiant}>{e.nom} {e.prenom} — {e.filiere}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Chambre disponible *</label>
            <select className="select" value={modal.data.num_chambre} onChange={e => setField('num_chambre', e.target.value)}>
              <option value="">Sélectionner une chambre…</option>
              {chambres.map(c => <option key={c.num_chambre} value={c.num_chambre}>Ch. {c.num_chambre} — {c.nom_batiment} ({fmtCFA(c.loyer_mensuel)} F/mois)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date d'entrée *</label>
              <input type="date" className="input" value={modal.data.date_entree} onChange={e => setField('date_entree', e.target.value)} />
            </div>
            <div>
              <label className="label">Date de sortie prévue</label>
              <input type="date" className="input" value={modal.data.date_sortie_prevue} onChange={e => setField('date_sortie_prevue', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Caution versée (FCFA)</label>
            <input type="number" className="input" placeholder="25000" value={modal.data.caution_versee} onChange={e => setField('caution_versee', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={() => setModal(p => ({ ...p, open: false }))}>Annuler</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Créer l\'attribution'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmEnd.open}
        onClose={() => setConfirmEnd({ open: false, num_etudiant: null, num_chambre: null })}
        onConfirm={handleEnd} loading={ending}
        title="Libérer la chambre"
        message="L'attribution sera supprimée et la chambre repassera en statut 'disponible'. Cette action est irréversible."
      />
    </div>
  );
}
