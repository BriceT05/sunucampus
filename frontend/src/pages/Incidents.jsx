import { useEffect, useState, useCallback } from 'react';
import { Plus, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { incidentsAPI, chambresAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

const PRIORITES = ['faible','moyenne','urgente'];
const STATUTS   = ['ouvert','en cours','resolu'];
const EMPTY     = { num_chambre:'', description:'', priorite:'faible', statut:'ouvert' };
const fmtDate   = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

export default function Incidents() {
  const [incidents,    setIncidents]   = useState([]);
  const [chambres,     setChambres]    = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [filterStatut, setFilterStatut]= useState('');
  const [filterPrio,   setFilterPrio]  = useState('');
  const [modal,        setModal]       = useState({ open: false, mode: 'create', data: EMPTY });
  const [confirm,      setConfirm]     = useState({ open: false, id: null });
  const [saving,       setSaving]      = useState(false);
  const [deleting,     setDeleting]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatut) params.statut   = filterStatut;
      if (filterPrio)   params.priorite = filterPrio;
      const [inc, ch] = await Promise.all([incidentsAPI.getAll(params), chambresAPI.getAll()]);
      setIncidents(inc.data);
      setChambres(ch.data);
    } catch (e) { toast.error(e.message); }
    finally     { setLoading(false); }
  }, [filterStatut, filterPrio]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setModal({ open: true, mode: 'create', data: { ...EMPTY } });
  const openEdit   = i => setModal({ open: true, mode: 'edit', data: { ...i, date_resolution: i.date_resolution?.slice(0,10) || '' } });
  const closeModal = () => setModal(p => ({ ...p, open: false }));
  const setField   = (k, v) => setModal(p => ({ ...p, data: { ...p.data, [k]: v } }));

  const handleSave = async () => {
    const { data, mode } = modal;
    if (!data.num_chambre || !data.description) return toast.error('Chambre et description requis');
    setSaving(true);
    try {
      if (mode === 'create') await incidentsAPI.create(data);
      else                   await incidentsAPI.update(data.id_incident, data);
      toast.success(mode === 'create' ? 'Incident signalé' : 'Incident mis à jour');
      closeModal(); load();
    } catch (e) { toast.error(e.message); }
    finally     { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await incidentsAPI.delete(confirm.id);
      toast.success('Incident supprimé');
      setConfirm({ open: false, id: null }); load();
    } catch (e) { toast.error(e.message); }
    finally     { setDeleting(false); }
  };

  const urgentCount = incidents.filter(i => i.priorite === 'urgente' && i.statut !== 'resolu').length;

  return (
    <div className="space-y-5">
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertTriangle size={22} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-semibold">
            {urgentCount} incident{urgentCount > 1 ? 's' : ''} urgent{urgentCount > 1 ? 's' : ''} — intervention requise
          </p>
        </div>
      )}

      <div className="card card-body flex flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUTS].map(s => (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${filterStatut === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === '' ? 'Tous' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['', ...PRIORITES].map(p => (
            <button key={p} onClick={() => setFilterPrio(p)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${filterPrio === p
                ? p === 'urgente' ? 'bg-red-500 text-white' : p === 'moyenne' ? 'bg-orange-500 text-white' : 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p === '' ? 'Toutes priorités' : p}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="btn-primary ml-auto"><Plus size={18} /> Signaler</button>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title">Incidents signalés</h3>
          <span className="badge bg-primary/10 text-primary">{incidents.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>Description</th>
                <th>Chambre</th>
                <th>Bâtiment</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Signalé le</th>
                <th>Résolu le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">Chargement…</td></tr>
              ) : incidents.length === 0 ? (
                <tr><td colSpan={8}><div className="flex flex-col items-center py-16 gap-3">
                  <AlertTriangle size={40} className="text-slate-300" />
                  <p className="text-slate-400">Aucun incident</p>
                </div></td></tr>
              ) : incidents.map(i => (
                <tr key={i.id_incident} className={i.priorite === 'urgente' && i.statut !== 'resolu' ? 'bg-red-50/40' : ''}>
                  <td className="max-w-xs">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2">{i.description}</p>
                  </td>
                  <td className="text-sm font-medium">Ch. {i.num_chambre}</td>
                  <td className="text-sm text-slate-500">{i.nom_batiment}</td>
                  <td><Badge value={i.priorite} /></td>
                  <td><Badge value={i.statut} /></td>
                  <td className="text-xs text-slate-500">{fmtDate(i.date_signalement)}</td>
                  <td className="text-xs text-slate-500">{fmtDate(i.date_resolution)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(i)} className="btn-icon text-slate-400 hover:text-amber-600 hover:bg-amber-50"><Pencil size={15} /></button>
                      <button onClick={() => setConfirm({ open: true, id: i.id_incident })} className="btn-icon text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={closeModal} title={modal.mode === 'create' ? 'Signaler un incident' : 'Modifier l\'incident'} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Chambre *</label>
            <select className="select" value={modal.data.num_chambre} onChange={e => setField('num_chambre', e.target.value)}>
              <option value="">Sélectionner…</option>
              {chambres.map(c => <option key={c.num_chambre} value={c.num_chambre}>Ch. {c.num_chambre} — {c.nom_batiment}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={3} placeholder="Décrivez l'incident…" value={modal.data.description} onChange={e => setField('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priorité</label>
              <select className="select" value={modal.data.priorite} onChange={e => setField('priorite', e.target.value)}>
                {PRIORITES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            {modal.mode === 'edit' && (
              <div>
                <label className="label">Statut</label>
                <select className="select" value={modal.data.statut} onChange={e => setField('statut', e.target.value)}>
                  {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          {modal.mode === 'edit' && modal.data.statut === 'resolu' && (
            <div>
              <label className="label">Date de résolution</label>
              <input type="date" className="input" value={modal.data.date_resolution || ''} onChange={e => setField('date_resolution', e.target.value)} />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={closeModal}>Annuler</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : modal.mode === 'create' ? 'Signaler' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete} loading={deleting}
        title="Supprimer l'incident"
        message="Cet incident sera définitivement supprimé."
      />
    </div>
  );
}
