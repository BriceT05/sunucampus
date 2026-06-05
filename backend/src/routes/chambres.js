const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { etat, id_bat, search } = req.query;
    let sql = `
      SELECT c.*, b.nom AS nom_batiment,
        e.nom AS etudiant_nom, e.prenom AS etudiant_prenom
      FROM CHAMBRE c
      JOIN BATIMENT b ON b.id_bat = c.id_bat
      LEFT JOIN ATTRIBUTION a ON a.num_chambre = c.num_chambre
      LEFT JOIN ETUDIANT    e ON e.num_etudiant = a.num_etudiant
      WHERE 1=1
    `;
    const params = [];
    if (etat)   { sql += ' AND c.etat = ?';    params.push(etat); }
    if (id_bat) { sql += ' AND c.id_bat = ?';  params.push(id_bat); }
    if (search) { sql += ' AND (b.nom LIKE ? OR c.num_chambre LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY b.nom, c.num_chambre';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [[chambre]] = await db.query(`
      SELECT c.*, b.nom AS nom_batiment FROM CHAMBRE c
      JOIN BATIMENT b ON b.id_bat = c.id_bat
      WHERE c.num_chambre = ?
    `, [req.params.id]);
    if (!chambre) return res.status(404).json({ error: 'Chambre introuvable' });

    const [attributions] = await db.query(`
      SELECT a.*, e.nom, e.prenom, e.filiere
      FROM ATTRIBUTION a JOIN ETUDIANT e ON e.num_etudiant = a.num_etudiant
      WHERE a.num_chambre = ? ORDER BY a.date_entree DESC
    `, [req.params.id]);

    const [incidents] = await db.query(
      'SELECT * FROM INCIDENT WHERE num_chambre = ? ORDER BY date_signalement DESC',
      [req.params.id]
    );
    res.json({ ...chambre, attributions, incidents });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { id_bat, type, superficie, loyer_mensuel, etat } = req.body;
  if (!id_bat || !loyer_mensuel) return res.status(400).json({ error: 'id_bat et loyer_mensuel requis' });
  try {
    const [result] = await db.query(
      'INSERT INTO CHAMBRE (id_bat, type, superficie, loyer_mensuel, etat) VALUES (?,?,?,?,?)',
      [id_bat, type || 'simple', superficie || null, loyer_mensuel, etat || 'disponible']
    );
    const [[created]] = await db.query('SELECT * FROM CHAMBRE WHERE num_chambre = ?', [result.insertId]);
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { id_bat, type, superficie, loyer_mensuel, etat } = req.body;
  try {
    await db.query(
      'UPDATE CHAMBRE SET id_bat=?, type=?, superficie=?, loyer_mensuel=?, etat=? WHERE num_chambre=?',
      [id_bat, type, superficie, loyer_mensuel, etat, req.params.id]
    );
    const [[updated]] = await db.query('SELECT * FROM CHAMBRE WHERE num_chambre = ?', [req.params.id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM CHAMBRE WHERE num_chambre = ?', [req.params.id]);
    res.json({ message: 'Chambre supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
