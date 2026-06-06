const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*,
        COUNT(c.num_chambre)                AS nb_chambres,
        SUM(c.etat = 'occupee')             AS nb_occupees,
        SUM(c.etat = 'disponible')          AS nb_disponibles,
        SUM(c.etat = 'en travaux')          AS nb_travaux
      FROM batiment b
      LEFT JOIN chambre c ON c.id_bat = b.id_bat
      GROUP BY b.id_bat
      ORDER BY b.nom
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [[bat]] = await db.query('SELECT * FROM batiment WHERE id_bat = ?', [req.params.id]);
    if (!bat) return res.status(404).json({ error: 'Bâtiment introuvable' });
    const [chambres] = await db.query('SELECT * FROM chambre WHERE id_bat = ? ORDER BY num_chambre', [req.params.id]);
    res.json({ ...bat, chambres });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { nom, adresse, nb_etages, annee_construction } = req.body;
  if (!nom) return res.status(400).json({ error: 'nom requis' });
  try {
    const [result] = await db.query(
      'INSERT INTO batiment (nom, adresse, nb_etages, annee_construction) VALUES (?,?,?,?)',
      [nom, adresse || null, nb_etages || 0, annee_construction || null]
    );
    const [[created]] = await db.query('SELECT * FROM batiment WHERE id_bat = ?', [result.insertId]);
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { nom, adresse, nb_etages, annee_construction } = req.body;
  try {
    await db.query(
      'UPDATE batiment SET nom=?, adresse=?, nb_etages=?, annee_construction=? WHERE id_bat=?',
      [nom, adresse || null, nb_etages, annee_construction || null, req.params.id]
    );
    const [[updated]] = await db.query('SELECT * FROM batiment WHERE id_bat = ?', [req.params.id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM batiment WHERE id_bat = ?', [req.params.id]);
    res.json({ message: 'Bâtiment supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
