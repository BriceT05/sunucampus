import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL, timeout: 30000 });

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || err.message || 'Erreur réseau';
    return Promise.reject(new Error(msg));
  }
);

export const dashboardAPI = { getStats: () => api.get('/dashboard/stats') };

export const batimentsAPI = {
  getAll:  ()      => api.get('/batiments'),
  getById: id      => api.get(`/batiments/${id}`),
  create:  data    => api.post('/batiments', data),
  update:  (id, d) => api.put(`/batiments/${id}`, d),
  delete:  id      => api.delete(`/batiments/${id}`),
};

export const chambresAPI = {
  getAll:  (params) => api.get('/chambres', { params }),
  getById: id       => api.get(`/chambres/${id}`),
  create:  data     => api.post('/chambres', data),
  update:  (id, d)  => api.put(`/chambres/${id}`, d),
  delete:  id       => api.delete(`/chambres/${id}`),
};

export const etudiantsAPI = {
  getAll:      (params) => api.get('/etudiants', { params }),
  getById:     id       => api.get(`/etudiants/${id}`),
  getFilieres: ()       => api.get('/etudiants/filieres'),
  create:      data     => api.post('/etudiants', data),
  update:      (id, d)  => api.put(`/etudiants/${id}`, d),
  delete:      id       => api.delete(`/etudiants/${id}`),
};

export const attributionsAPI = {
  getAll:   ()                          => api.get('/attributions'),
  create:   data                        => api.post('/attributions', data),
  terminer: (num_etudiant, num_chambre) => api.delete(`/attributions/${num_etudiant}/${num_chambre}`),
};

export const paiementsAPI = {
  getAll:  (params) => api.get('/paiements', { params }),
  create:  data     => api.post('/paiements', data),
  update:  (id, d)  => api.put(`/paiements/${id}`, d),
  delete:  id       => api.delete(`/paiements/${id}`),
};

export const incidentsAPI = {
  getAll:  (params) => api.get('/incidents', { params }),
  create:  data     => api.post('/incidents', data),
  update:  (id, d)  => api.put(`/incidents/${id}`, d),
  delete:  id       => api.delete(`/incidents/${id}`),
};

export default api;
