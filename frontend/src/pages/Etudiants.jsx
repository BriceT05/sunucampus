import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { etudiantsAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

const NIVEAUX = ['L1','L2','L3','M1','M2'];
const EMPTY   = { nom:'', prenom:'', filiere:'', niveau:'L1', telephone:'', email:'' };

export default function Etudiants() {
  const navigate = useNavigate();
  const [etudiants,     setEtudiants]     = useState([]);
  const [filieres,      setFilieres]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterNiveau,  setFilterNiveau]  = useState('');
  const [modal,         setModal]         = useState({ open: false, mode: 'create', data: EMPTY });
  const [confirm,       setConfirm]       = useState({ open: false, id: null });
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)        params.search  = search;
      if (filterFiliere) params.filiere = filterFiliere;
      if (filterNiveau)  params.niveau  = filterNiveau;
      const [et, fi] = await Promise.all([etudiantsAPI.getAll(params), etudiantsAPI.getFilieres()]);
      setEtudiants(Array.isArray(et.data) ? et.data : []);
      setFilieres(Array.isArray(fi.data) ? fi.data : []);
    } catch (e) { toast.error(e.message); }
    finally     { setLoading(false); }
  }, [search, filterFiliere, filterNiveau]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setModal({ open: true, mode: 'create', data: { ...EMPTY } });
  const openEdit   = e  => setModal({ open: true, mode: 'edit',   data: { ...e } });
  const closeModal = () => setModal(p => ({ ...p, open: false }));
  const setField   = (k, v) => setModal(p => ({ ...p, data: { ...p.data, [k]: v } }));

  const handleSave = async () => {
    const { data, mode } = modal;
    if (!data.nom || !data.prenom) return toast.error('Nom et prénom requis');
    setSaving(true);
    try {
      if (mode === 'create') await etudiantsAPI.create(data);
      else                   await etudiantsAPI.update(data.num_etudiant, data);
      toast.success(mode === 'create' ? 'Étudiant créé' : 'Étudiant modifié');
      closeModal(); load();
    } catch (e) { toast.error(e.message); }
    finally     { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await etudiantsAPI.delete(confirm.id);
      toast.success('Étudiant supprimé');
      setConfirm({ open: false, id: null }); load();
    } catch (e) { toast.error(e.message); }
    finally     { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="card card-body flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Rechercher par nom, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-44" value={filterFiliere} onChange={e => setFilterFiliere(e.target.value)}>
          <option value="">Toutes filières</option>
          {filieres.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="select w-36" value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)}>
          <option value="">Tout niveau</option>
          {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={openCreate} className="btn-primary ml-auto"><Plus size={18} /> Ajouter</button>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title">Étudiants résidents</h3>
          <span className="badge bg-primary/10 text-primary">{etudiants.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom complet</th>
                <th>Filière / Niveau</th>
                <th>Contact</th>
                <th>Chambre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Chargement…</td></tr>
              ) : etudiants.length === 0 ? (
                <tr><td colSpan={6}><div className="flex flex-col items-center py-16 gap-3">
                  <GraduationCap size={40} className="text-slate-300" />
                  <p className="text-slate-400">Aucun étudiant trouvé</p>
                </div></td></tr>
              ) : etudiants.map(e => (
                <tr key={e.num_etudiant}>
                  <td className="font-mono text-sm text-slate-400">{e.num_etudiant}</td>
                  <td>
                    <div className="font-semibold text-slate-800">{e.nom} {e.prenom}</div>
                    <div className="text-xs text-slate-400">{e.email}</div>
                  </td>
                  <td>
                    <div className="text-sm">{e.filiere}</div>
                    <Badge value={e.niveau} className="mt-1" />
                  </td>
                  <td className="text-sm text-slate-500">{e.telephone || '—'}</td>
                  <td>
                    {e.num_chambre
                      ? <span className="badge bg-blue-100 text-blue-700">Ch. {e.num_chambre} — {e.nom_batiment}</span>
                      : <span className="text-slate-400 text-sm">Non logé</span>
                    }
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/etudiants/${e.num_etudiant}`)} className="btn-icon text-slate-400 hover:text-primary hover:bg-primary/10" title="Voir fiche">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEdit(e)} className="btn-icon text-slate-400 hover:text-amber-600 hover:bg-amber-50" title="Modifier">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setConfirm({ open: true, id: e.num_etudiant })} className="btn-icon text-slate-400 hover:text-red-500 hover:bg-red-50" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={closeModal} title={modal.mode === 'create' ? 'Nouvel étudiant' : 'Modifier l\'étudiant'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nom *</label>
            <input className="input" placeholder="DIALLO" value={modal.data.nom} onChange={e => setField('nom', e.target.value)} />
          </div>
          <div>
            <label className="label">Prénom *</label>
            <input className="input" placeholder="Mamadou" value={modal.data.prenom} onChange={e => setField('prenom', e.target.value)} />
          </div>
          <div>
            <label className="label">Filière</label>
            <input className="input" placeholder="GLSI, GI, GC…" value={modal.data.filiere || ''} onChange={e => setField('filiere', e.target.value)} />
          </div>
          <div>
            <label className="label">Niveau</label>
            <select className="select" value={modal.data.niveau || 'L1'} onChange={e => setField('niveau', e.target.value)}>
              {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" placeholder="77 xxx xx xx" value={modal.data.telephone || ''} onChange={e => setField('telephone', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="prenom.nom@esp.sn" value={modal.data.email || ''} onChange={e => setField('email', e.target.value)} />
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
        title="Supprimer l'étudiant"
        message="L'étudiant et toutes ses données associées seront supprimés définitivement."
      />
    </div>
  );
}
