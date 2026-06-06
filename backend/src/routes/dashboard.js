const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/stats', async (_req, res) => {
  try {
    const [[{ total: totalChambres }]]       = await db.query('SELECT COUNT(*) AS total FROM chambre');
    const [[{ total: chambresOccupees }]]    = await db.query("SELECT COUNT(*) AS total FROM chambre WHERE etat = 'occupee'");
    const [[{ total: chambresDisponibles }]] = await db.query("SELECT COUNT(*) AS total FROM chambre WHERE etat = 'disponible'");
    const [[{ total: incidentsUrgents }]]    = await db.query("SELECT COUNT(*) AS total FROM incident WHERE priorite = 'urgente' AND statut != 'resolu'");

    const curMois  = new Date().getMonth() + 1;
    const curAnnee = new Date().getFullYear();

    const [[{ attendus }]] = await db.query(`
      SELECT COALESCE(SUM(c.loyer_mensuel), 0) AS attendus
      FROM attribution a
      JOIN chambre c ON c.num_chambre = a.num_chambre
      WHERE a.date_sortie_prevue >= CURDATE() AND a.date_entree <= CURDATE()
    `);
    const [[{ percus }]] = await db.query(
      'SELECT COALESCE(SUM(montant), 0) AS percus FROM paiement_loyer WHERE mois = ? AND annee = ?',
      [curMois, curAnnee]
    );
    const loyersImpayesMois = Math.max(0, Number(attendus) - Number(percus));

    const [revenus6Mois] = await db.query(`
      SELECT mois, annee,
        SUM(montant) AS total_percu,
        CONCAT(
          ELT(mois,'Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'),
          ' ', annee
        ) AS mois_libelle
      FROM paiement_loyer
      WHERE STR_TO_DATE(CONCAT(annee,'-',LPAD(mois,2,'0'),'-01'),'%Y-%m-%d')
            >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY annee, mois
      ORDER BY annee, mois
    `);

    const [alertesRecentes] = await db.query(`
      SELECT i.id_incident, i.description, i.priorite, i.statut, i.date_signalement,
             i.num_chambre, b.nom AS nom_batiment
      FROM incident i
      JOIN chambre  c ON c.num_chambre = i.num_chambre
      JOIN batiment b ON b.id_bat      = c.id_bat
      WHERE i.statut != 'resolu'
      ORDER BY FIELD(i.priorite,'urgente','moyenne','faible'), i.date_signalement DESC
      LIMIT 5
    `);

    const tauxOccupation = totalChambres > 0 ? Math.round((chambresOccupees / totalChambres) * 100) : 0;

    res.json({
      totalChambres, chambresOccupees, chambresDisponibles, tauxOccupation,
      loyersImpayesMois, incidentsUrgents, revenus6Mois, alertesRecentes,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
