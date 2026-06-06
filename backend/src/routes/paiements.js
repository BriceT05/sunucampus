const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { mois, annee, num_etudiant } = req.query;
    let sql = `
      SELECT p.*,
        e.nom, e.prenom,
        b.nom AS nom_batiment
      FROM paiement_loyer p
      JOIN etudiant    e ON e.num_etudiant = p.num_etudiant
      JOIN chambre     c ON c.num_chambre  = p.num_chambre
      JOIN batiment    b ON b.id_bat       = c.id_bat
      WHERE 1=1
    `;
    const params = [];
    if (mois)         { sql += ' AND p.mois = ?';         params.push(mois); }
    if (annee)        { sql += ' AND p.annee = ?';        params.push(annee); }
    if (num_etudiant) { sql += ' AND p.num_etudiant = ?'; params.push(num_etudiant); }
    sql += ' ORDER BY p.annee DESC, p.mois DESC, e.nom';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { num_etudiant, num_chambre, mois, annee, montant, date_paiement_effectif } = req.body;
  if (!num_etudiant || !num_chambre || !mois || !annee || !montant)
    return res.status(400).json({ error: 'Champs requis manquants' });
  try {
    const [result] = await db.query(
      'INSERT INTO paiement_loyer (mois, annee, montant, date_paiement_effectif, num_etudiant, num_chambre) VALUES (?,?,?,?,?,?)',
      [mois, annee, montant, date_paiement_effectif || null, num_etudiant, num_chambre]
    );
    const [[created]] = await db.query('SELECT * FROM paiement_loyer WHERE id_paiement = ?', [result.insertId]);
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { mois, annee, montant, date_paiement_effectif } = req.body;
  try {
    await db.query(
      'UPDATE paiement_loyer SET mois=?, annee=?, montant=?, date_paiement_effectif=? WHERE id_paiement=?',
      [mois, annee, montant, date_paiement_effectif || null, req.params.id]
    );
    const [[updated]] = await db.query('SELECT * FROM paiement_loyer WHERE id_paiement = ?', [req.params.id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM paiement_loyer WHERE id_paiement = ?', [req.params.id]);
    res.json({ message: 'Paiement supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
