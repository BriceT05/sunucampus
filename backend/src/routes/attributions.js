const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*,
        e.nom, e.prenom, e.filiere, e.niveau,
        c.type, c.loyer_mensuel,
        b.nom AS nom_batiment
      FROM attribution a
      JOIN etudiant e ON e.num_etudiant = a.num_etudiant
      JOIN chambre  c ON c.num_chambre  = a.num_chambre
      JOIN batiment b ON b.id_bat       = c.id_bat
      ORDER BY a.date_entree DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { num_etudiant, num_chambre, date_entree, date_sortie_prevue, caution_versee } = req.body;
  if (!num_etudiant || !num_chambre || !date_entree)
    return res.status(400).json({ error: 'num_etudiant, num_chambre et date_entree requis' });
  try {
    const [[existingEtud]] = await db.query(
      'SELECT num_etudiant FROM attribution WHERE num_etudiant = ?', [num_etudiant]
    );
    if (existingEtud) return res.status(409).json({ error: 'Cet étudiant a déjà une chambre attribuée' });

    const [[existingChambre]] = await db.query(
      'SELECT num_chambre FROM attribution WHERE num_chambre = ?', [num_chambre]
    );
    if (existingChambre) return res.status(409).json({ error: 'Cette chambre est déjà attribuée' });

    await db.query(
      'INSERT INTO attribution (num_etudiant, num_chambre, date_entree, date_sortie_prevue, caution_versee) VALUES (?,?,?,?,?)',
      [num_etudiant, num_chambre, date_entree, date_sortie_prevue || null, caution_versee || 0]
    );
    await db.query("UPDATE chambre SET etat = 'occupee' WHERE num_chambre = ?", [num_chambre]);

    const [[created]] = await db.query(`
      SELECT a.*, e.nom, e.prenom, c.loyer_mensuel, b.nom AS nom_batiment
      FROM attribution a
      JOIN etudiant e ON e.num_etudiant = a.num_etudiant
      JOIN chambre  c ON c.num_chambre  = a.num_chambre
      JOIN batiment b ON b.id_bat       = c.id_bat
      WHERE a.num_etudiant = ? AND a.num_chambre = ?
    `, [num_etudiant, num_chambre]);
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Terminer une attribution : libère la chambre et supprime l'attribution
router.delete('/:num_etudiant/:num_chambre', async (req, res) => {
  const { num_etudiant, num_chambre } = req.params;
  try {
    await db.query(
      'DELETE FROM attribution WHERE num_etudiant = ? AND num_chambre = ?',
      [num_etudiant, num_chambre]
    );
    await db.query("UPDATE chambre SET etat = 'disponible' WHERE num_chambre = ?", [num_chambre]);
    res.json({ message: 'Attribution terminée, chambre libérée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
