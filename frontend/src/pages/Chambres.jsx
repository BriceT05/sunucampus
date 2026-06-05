import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import { chambresAPI, batimentsAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

const ETATS = ['disponible','occupee','en travaux'];
const TYPES = ['simple','double'];
const EMPTY = { id_bat:'', type:'simple', superficie:'', loyer_mensuel:'', etat:'disponible' };
const fmtCFA = n => new Intl.NumberFormat('fr-FR').format(n);

export default function Chambres() {
  const [chambres,   setChambres]  = useState([]);
  const [batiments,  setBatiments] = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [search,     setSearch]    = useState('');
  const [filterEtat, setFilterEtat]= useState('');
  const [filterBat,  setFilterBat] = useState('');
  const [modal,      setModal]     = useState({ open: false, mode: 'create', data: EMPTY });
  const [confirm,    setConfirm]   = useState({ open: false, id: null });
  const [saving,     setSaving]    = useState(false);
  const [deleting,   setDeleting]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)    params.search = search;
      if (filterEtat)params.etat   = filterEtat;
      if (filterBat) params.id_bat = filterBat;
      const [ch, bt] = await Promise.all([chambresAPI.getAll(params), batimentsAPI.getAll()]);
      setChambres(Array.isArray(ch.data) ? ch.data : []);
      setBatiments(Array.isArray(bt.data) ? bt.data : []);
    } catch (e) { toast.error(e.message); }
    finally     { setLoading(false); }
  }, [search, filterEtat, filterBat]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setModal({ open: true, mode: 'create', data: { ...EMPTY } });
  const openEdit   = c => setModal({ open: true, mode: 'edit', data: { ...c } });
  const closeModal = () => setModal(p => ({ ...p, open: false }));
  const setField   = (k, v) => setModal(p => ({ ...p, data: { ...p.data, [k]: v } }));

  const handleSave = async () => {
    const { data, mode } = modal;
    if (!data.id_bat || !data.loyer_mensuel) return toast.error('Bâtiment et loyer requis');
    setSaving(true);
    try {
      if (mode === 'create') await chambresAPI.create(data);
      else                   await chambresAPI.update(data.num_chambre, data);
      toast.success(mode === 'create' ? 'Chambre créée' : 'Chambre modifiée');
      closeModal(); load();
    } catch (e) { toast.error(e.message); }
    finally     { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await chambresAPI.delete(confirm.id);
      toast.success('Chambre supprimée');
      setConfirm({ open: false, id: null }); load();
    } catch (e) { toast.error(e.message); }
    finally     { setDeleting(false); }
  };

  const chambresList = Array.isArray(chambres) ? chambres : [];
  const counts = ETATS.reduce((acc, e) => ({ ...acc, [e]: chambresList.filter(c => c.etat === e).length }), {});

  const etatColor = {
    disponible:  'bg-emerald-400',
    occupee:     'bg-blue-500',
    'en travaux':'bg-amber-400',
  };

  return (
    <div className="space-y-5">
      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { etat:'disponible',  label:'Disponibles',  cls:'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { etat:'occupee',     label:'Occupées',     cls:'bg-blue-50 text-blue-700 border-blue-200' },
          { etat:'en travaux',  label:'En travaux',   cls:'bg-amber-50 text-amber-700 border-amber-200' },
        ].map(({ etat, label, cls }) => (
          <button
            key={etat} onClick={() => setFilterEtat(filterEtat === etat ? '' : etat)}
            className={`card border p-4 text-left transition-all hover:shadow-md ${cls} ${filterEtat === etat ? 'ring-2 ring-offset-2 ring-current' : ''}`}
          >
            <p className="text-3xl font-black">{counts[etat] || 0}</p>
            <p className="text-sm font-medium mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card card-body flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-48" value={filterBat} onChange={e => setFilterBat(e.target.value)}>
          <option value="">Tous les bâtiments</option>
          {batiments.map(b => <option key={b.id_bat} value={b.id_bat}>{b.nom}</option>)}
        </select>
        <button onClick={openCreate} className="btn-primary ml-auto"><Plus size={18} /> Ajouter</button>
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-44 rounded-2xl bg-slate-200 animate-pulse" />)}
        </div>
      ) : chambresList.length === 0 ? (
        <div className="card flex flex-col items-center py-20 gap-3">
          <BedDouble size={48} className="text-slate-300" />
          <p className="text-slate-400 text-lg">Aucune chambre trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {chambresList.map(c => (
            <div key={c.num_chambre} className="card hover:shadow-md transition-all group overflow-hidden">
              <div className={`h-2 ${etatColor[c.etat] || 'bg-slate-300'}`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-black text-slate-800">Ch. {c.num_chambre}</p>
                    <p className="text-xs text-slate-400 truncate">{c.nom_batiment}</p>
                  </div>
                  <Badge value={c.etat} />
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Type</span><span className="font-medium capitalize">{c.type}</span></div>
                  {c.superficie && <div className="flex justify-between text-sm"><span className="text-slate-500">Surface</span><span className="font-medium">{c.superficie} m²</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Loyer</span><span className="font-bold text-primary text-xs">{fmtCFA(c.loyer_mensuel)} F/mois</span></div>
                  {c.etat === 'occupee' && c.etudiant_nom && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 truncate">{c.etudiant_nom} {c.etudiant_prenom}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="btn-secondary btn-sm flex-1"><Pencil size={13} /> Modifier</button>
                  <button onClick={() => setConfirm({ open: true, id: c.num_chambre })} className="btn-icon text-red-400 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={closeModal} title={modal.mode === 'create' ? 'Nouvelle chambre' : 'Modifier la chambre'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Bâtiment *</label>
            <select className="select" value={modal.data.id_bat} onChange={e => setField('id_bat', e.target.value)}>
              <option value="">Sélectionner…</option>
              {batiments.map(b => <option key={b.id_bat} value={b.id_bat}>{b.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="select" value={modal.data.type} onChange={e => setField('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Superficie (m²)</label>
            <input type="number" className="input" step={0.5} placeholder="12.5" value={modal.data.superficie || ''} onChange={e => setField('superficie', e.target.value)} />
          </div>
          <div>
            <label className="label">Loyer mensuel (FCFA) *</label>
            <input type="number" className="input" placeholder="25000" value={modal.data.loyer_mensuel || ''} onChange={e => setField('loyer_mensuel', e.target.value)} />
          </div>
          <div>
            <label className="label">État</label>
            <select className="select" value={modal.data.etat} onChange={e => setField('etat', e.target.value)}>
              {ETATS.map(et => <option key={et} value={et}>{et}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={closeModal}>Annuler</button>
          <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : modal.mode === 'create' ? 'Créer' : 'Enregistrer'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete} loading={deleting}
        title="Supprimer la chambre"
        message="Cette chambre sera définitivement supprimée avec ses données associées."
      />
    </div>
  );
}
