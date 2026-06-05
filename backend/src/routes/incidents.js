const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { statut, priorite } = req.query;
    let sql = `
      SELECT i.*, b.nom AS nom_batiment
      FROM INCIDENT i
      JOIN CHAMBRE  c ON c.num_chambre = i.num_chambre
      JOIN BATIMENT b ON b.id_bat      = c.id_bat
      WHERE 1=1
    `;
    const params = [];
    if (statut)   { sql += ' AND i.statut = ?';   params.push(statut); }
    if (priorite) { sql += ' AND i.priorite = ?'; params.push(priorite); }
    sql += ` ORDER BY FIELD(i.priorite,'urgente','moyenne','faible'), i.date_signalement DESC`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { num_chambre, description, priorite } = req.body;
  if (!num_chambre || !description) return res.status(400).json({ error: 'num_chambre et description requis' });
  try {
    const [result] = await db.query(
      'INSERT INTO INCIDENT (num_chambre, description, priorite) VALUES (?,?,?)',
      [num_chambre, description, priorite || 'faible']
    );
    const [[created]] = await db.query('SELECT * FROM INCIDENT WHERE id_incident = ?', [result.insertId]);
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { description, priorite, statut, date_resolution } = req.body;
  try {
    const [[existing]] = await db.query('SELECT * FROM INCIDENT WHERE id_incident = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Incident introuvable' });
    const resolutionDate = statut === 'resolu' && !existing.date_resolution
      ? new Date().toISOString().slice(0, 10)
      : date_resolution || existing.date_resolution;
    await db.query(
      'UPDATE INCIDENT SET description=?, priorite=?, statut=?, date_resolution=? WHERE id_incident=?',
      [description, priorite, statut, resolutionDate, req.params.id]
    );
    const [[updated]] = await db.query('SELECT * FROM INCIDENT WHERE id_incident = ?', [req.params.id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM INCIDENT WHERE id_incident = ?', [req.params.id]);
    res.json({ message: 'Incident supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
