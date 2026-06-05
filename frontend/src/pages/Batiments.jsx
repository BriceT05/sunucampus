import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { batimentsAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const EMPTY = { nom:'', adresse:'', nb_etages:0, annee_construction:'' };

export default function Batiments() {
  const [batiments, setBatiments] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState({ open: false, mode: 'create', data: EMPTY });
  const [confirm,   setConfirm]   = useState({ open: false, id: null });
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await batimentsAPI.getAll(); setBatiments(Array.isArray(r.data) ? r.data : []); }
    catch (e) { toast.error(e.message); }
    finally   { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => setModal({ open: true, mode: 'create', data: { ...EMPTY } });
  const openEdit   = b => setModal({ open: true, mode: 'edit', data: { ...b } });
  const closeModal = () => setModal(p => ({ ...p, open: false }));
  const setField   = (k, v) => setModal(p => ({ ...p, data: { ...p.data, [k]: v } }));

  const handleSave = async () => {
    if (!modal.data.nom) return toast.error('Nom du bâtiment requis');
    setSaving(true);
    try {
      if (modal.mode === 'create') await batimentsAPI.create(modal.data);
      else                         await batimentsAPI.update(modal.data.id_bat, modal.data);
      toast.success(modal.mode === 'create' ? 'Bâtiment créé' : 'Bâtiment modifié');
      closeModal(); load();
    } catch (e) { toast.error(e.message); }
    finally     { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await batimentsAPI.delete(confirm.id);
      toast.success('Bâtiment supprimé');
      setConfirm({ open: false, id: null }); load();
    } catch (e) { toast.error(e.message); }
    finally     { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Nouveau bâtiment</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-slate-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batiments.map(b => (
            <div key={b.id_bat} className="card overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-3 bg-gradient-to-r from-primary to-primary-light" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b)} className="btn-icon text-slate-400 hover:text-amber-600 hover:bg-amber-50"><Pencil size={16} /></button>
                    <button onClick={() => setConfirm({ open: true, id: b.id_bat })} className="btn-icon text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{b.nom}</h3>
                <p className="text-sm text-slate-400 mb-4 truncate">{b.adresse || 'Adresse non renseignée'}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-primary">{b.nb_chambres || 0}</p>
                    <p className="text-xs text-slate-400">Chambres</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-emerald-600">{b.nb_disponibles || 0}</p>
                    <p className="text-xs text-slate-400">Disponibles</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-blue-600">{b.nb_occupees || 0}</p>
                    <p className="text-xs text-slate-400">Occupées</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-amber-600">{b.nb_travaux || 0}</p>
                    <p className="text-xs text-slate-400">En travaux</p>
                  </div>
                </div>
                {b.nb_etages > 0 && <p className="text-xs text-slate-400">{b.nb_etages} étage{b.nb_etages > 1 ? 's' : ''} · Construit en {b.annee_construction}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={closeModal} title={modal.mode === 'create' ? 'Nouveau bâtiment' : 'Modifier le bâtiment'} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Nom *</label>
            <input className="input" placeholder="Bâtiment A — Cheikh Anta Diop" value={modal.data.nom} onChange={e => setField('nom', e.target.value)} />
          </div>
          <div>
            <label className="label">Adresse</label>
            <input className="input" placeholder="Campus UCAD, Dakar" value={modal.data.adresse || ''} onChange={e => setField('adresse', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre d'étages</label>
              <input type="number" className="input" min={0} value={modal.data.nb_etages} onChange={e => setField('nb_etages', +e.target.value)} />
            </div>
            <div>
              <label className="label">Année de construction</label>
              <input type="number" className="input" placeholder="1985" value={modal.data.annee_construction || ''} onChange={e => setField('annee_construction', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={closeModal}>Annuler</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : modal.mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete} loading={deleting}
        title="Supprimer le bâtiment"
        message="Le bâtiment et toutes ses chambres seront définitivement supprimés."
      />
    </div>
  );
}
