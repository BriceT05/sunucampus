const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { search, filiere, niveau } = req.query;
    let sql = `
      SELECT e.*,
        c.num_chambre, b.nom AS nom_batiment
      FROM ETUDIANT e
      LEFT JOIN ATTRIBUTION a ON a.num_etudiant = e.num_etudiant
      LEFT JOIN CHAMBRE  c ON c.num_chambre = a.num_chambre
      LEFT JOIN BATIMENT b ON b.id_bat      = c.id_bat
      WHERE 1=1
    `;
    const params = [];
    if (search)  { sql += ' AND (e.nom LIKE ? OR e.prenom LIKE ? OR e.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (filiere) { sql += ' AND e.filiere = ?'; params.push(filiere); }
    if (niveau)  { sql += ' AND e.niveau = ?';  params.push(niveau); }
    sql += ' ORDER BY e.nom, e.prenom';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/filieres', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT filiere FROM ETUDIANT WHERE filiere IS NOT NULL ORDER BY filiere');
    res.json(rows.map(r => r.filiere));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [[etudiant]] = await db.query('SELECT * FROM ETUDIANT WHERE num_etudiant = ?', [req.params.id]);
    if (!etudiant) return res.status(404).json({ error: 'Étudiant introuvable' });

    const [attributions] = await db.query(`
      SELECT a.*, c.loyer_mensuel, c.type, b.nom AS nom_batiment
      FROM ATTRIBUTION a
      JOIN CHAMBRE  c ON c.num_chambre = a.num_chambre
      JOIN BATIMENT b ON b.id_bat      = c.id_bat
      WHERE a.num_etudiant = ? ORDER BY a.date_entree DESC
    `, [req.params.id]);

    const [paiements] = await db.query(`
      SELECT p.*, c.num_chambre, b.nom AS nom_batiment
      FROM PAIEMENT_LOYER p
      JOIN CHAMBRE     c ON c.num_chambre = p.num_chambre
      JOIN BATIMENT    b ON b.id_bat      = c.id_bat
      WHERE p.num_etudiant = ? ORDER BY p.annee DESC, p.mois DESC
    `, [req.params.id]);

    res.json({ ...etudiant, attributions, paiements });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { nom, prenom, filiere, niveau, telephone, email } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'nom et prenom requis' });
  try {
    const [result] = await db.query(
      'INSERT INTO ETUDIANT (nom, prenom, filiere, niveau, telephone, email) VALUES (?,?,?,?,?,?)',
      [nom, prenom, filiere || null, niveau || 'L1', telephone || null, email || null]
    );
    const [[created]] = await db.query('SELECT * FROM ETUDIANT WHERE num_etudiant = ?', [result.insertId]);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nom, prenom, filiere, niveau, telephone, email } = req.body;
  try {
    await db.query(
      'UPDATE ETUDIANT SET nom=?, prenom=?, filiere=?, niveau=?, telephone=?, email=? WHERE num_etudiant=?',
      [nom, prenom, filiere || null, niveau, telephone || null, email || null, req.params.id]
    );
    const [[updated]] = await db.query('SELECT * FROM ETUDIANT WHERE num_etudiant = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ETUDIANT WHERE num_etudiant = ?', [req.params.id]);
    res.json({ message: 'Étudiant supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
