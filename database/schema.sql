-- ============================================================
--  SunuCampus — Schéma Base de Données
--  Résidence Universitaire ESP/UCAD Dakar
-- ============================================================

CREATE DATABASE IF NOT EXISTS residence_univ
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE residence_univ;

-- --------------------------------------------------------
-- BATIMENT
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS BATIMENT (
  id_batiment    INT AUTO_INCREMENT PRIMARY KEY,
  nom_batiment   VARCHAR(100)  NOT NULL,
  adresse        VARCHAR(255),
  nombre_etages  INT           DEFAULT 0,
  date_construction DATE,
  description    TEXT,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- CHAMBRE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CHAMBRE (
  id_chambre     INT AUTO_INCREMENT PRIMARY KEY,
  id_batiment    INT           NOT NULL,
  numero_chambre VARCHAR(20)   NOT NULL,
  etage          INT           DEFAULT 0,
  type_chambre   ENUM('simple','double','triple') DEFAULT 'simple',
  capacite       INT           DEFAULT 1,
  surface_m2     DECIMAL(5,2),
  prix_mensuel   DECIMAL(10,2) NOT NULL,
  etat           ENUM('disponible','occupee','en_maintenance','hors_service') DEFAULT 'disponible',
  description    TEXT,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_batiment) REFERENCES BATIMENT(id_batiment) ON DELETE CASCADE,
  UNIQUE KEY uq_chambre (id_batiment, numero_chambre)
);

-- --------------------------------------------------------
-- ETUDIANT
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ETUDIANT (
  id_etudiant      INT AUTO_INCREMENT PRIMARY KEY,
  matricule        VARCHAR(20)  UNIQUE NOT NULL,
  nom              VARCHAR(100) NOT NULL,
  prenom           VARCHAR(100) NOT NULL,
  email            VARCHAR(150) UNIQUE,
  telephone        VARCHAR(20),
  date_naissance   DATE,
  filiere          VARCHAR(100),
  niveau           ENUM('L1','L2','L3','M1','M2','Doctorat') DEFAULT 'L1',
  annee_academique VARCHAR(20),
  photo_url        VARCHAR(500),
  date_inscription DATE         DEFAULT (CURRENT_DATE),
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- ATTRIBUTION
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ATTRIBUTION (
  id_attribution  INT AUTO_INCREMENT PRIMARY KEY,
  id_etudiant     INT NOT NULL,
  id_chambre      INT NOT NULL,
  date_attribution DATE NOT NULL,
  date_fin_prevue  DATE,
  date_fin_reelle  DATE,
  statut           ENUM('active','terminee','annulee') DEFAULT 'active',
  observations     TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_etudiant) ON DELETE CASCADE,
  FOREIGN KEY (id_chambre)  REFERENCES CHAMBRE(id_chambre)   ON DELETE CASCADE
);

-- --------------------------------------------------------
-- PAIEMENT_LOYER
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS PAIEMENT_LOYER (
  id_paiement         INT AUTO_INCREMENT PRIMARY KEY,
  id_attribution      INT NOT NULL,
  mois_concerne       DATE NOT NULL,
  montant_du          DECIMAL(10,2) NOT NULL,
  montant_paye        DECIMAL(10,2) DEFAULT 0,
  date_paiement       DATE,
  mode_paiement       ENUM('especes','virement','mobile_money','cheque') DEFAULT 'especes',
  statut              ENUM('paye','partiel','impaye','en_retard') DEFAULT 'impaye',
  reference_paiement  VARCHAR(100),
  observations        TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_attribution) REFERENCES ATTRIBUTION(id_attribution) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- INCIDENT
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS INCIDENT (
  id_incident       INT AUTO_INCREMENT PRIMARY KEY,
  id_chambre        INT NOT NULL,
  id_etudiant       INT,
  type_incident     ENUM('maintenance','securite','hygiene','bruit','autre') DEFAULT 'autre',
  titre             VARCHAR(200) NOT NULL,
  description       TEXT,
  date_signalement  DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_resolution   DATETIME,
  priorite          ENUM('faible','normale','haute','urgente') DEFAULT 'normale',
  statut            ENUM('signale','en_cours','resolu','ferme') DEFAULT 'signale',
  observations      TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_chambre)  REFERENCES CHAMBRE(id_chambre)   ON DELETE CASCADE,
  FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_etudiant) ON DELETE SET NULL
);

-- ============================================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================================

INSERT INTO BATIMENT (nom_batiment, adresse, nombre_etages, date_construction) VALUES
('Bloc A — Sciences',     'Campus ESP, Route de l\'Aéroport, Dakar', 4, '2005-01-15'),
('Bloc B — Technologie',  'Campus ESP, Route de l\'Aéroport, Dakar', 3, '2008-06-20'),
('Bloc C — Innovation',   'Campus UCAD, Fann, Dakar',                5, '2015-09-01');

INSERT INTO CHAMBRE (id_batiment, numero_chambre, etage, type_chambre, capacite, surface_m2, prix_mensuel, etat) VALUES
(1,'A101',1,'simple',1,15.00,35000,'occupee'),
(1,'A102',1,'simple',1,15.00,35000,'disponible'),
(1,'A103',1,'double',2,22.00,45000,'occupee'),
(1,'A201',2,'simple',1,15.00,35000,'occupee'),
(1,'A202',2,'simple',1,15.00,35000,'en_maintenance'),
(1,'A203',2,'double',2,22.00,45000,'disponible'),
(2,'B101',1,'simple',1,16.00,38000,'occupee'),
(2,'B102',1,'double',2,24.00,48000,'disponible'),
(2,'B201',2,'simple',1,16.00,38000,'occupee'),
(2,'B202',2,'triple',3,30.00,55000,'disponible'),
(3,'C101',1,'simple',1,18.00,42000,'occupee'),
(3,'C102',1,'simple',1,18.00,42000,'disponible'),
(3,'C201',2,'double',2,26.00,52000,'occupee'),
(3,'C301',3,'simple',1,18.00,42000,'hors_service');

INSERT INTO ETUDIANT (matricule, nom, prenom, email, telephone, date_naissance, filiere, niveau, annee_academique) VALUES
('ESP2024001','DIALLO','Amadou',   'amadou.diallo@esp.sn',   '771234567','2001-03-15','Génie Informatique','L3','2024-2025'),
('ESP2024002','NDIAYE','Fatou',    'fatou.ndiaye@esp.sn',    '772345678','2002-07-22','Génie Civil',       'L2','2024-2025'),
('ESP2024003','SALL',  'Ousmane', 'ousmane.sall@esp.sn',    '773456789','2000-11-08','Génie Électrique',  'M1','2024-2025'),
('ESP2024004','BA',    'Aïssatou','aissatou.ba@esp.sn',      '774567890','2003-01-30','Génie Informatique','L1','2024-2025'),
('ESP2024005','CISSE', 'Ibrahima','ibrahima.cisse@esp.sn',   '775678901','2001-05-12','Génie Mécanique',   'L3','2024-2025'),
('UCAD2024001','FALL', 'Mariama', 'mariama.fall@ucad.edu.sn','776789012','2002-09-25','Sciences Éco.',     'L2','2024-2025'),
('UCAD2024002','GAYE', 'Moussa',  'moussa.gaye@ucad.edu.sn', '777890123','2000-04-18','Droit',             'L3','2024-2025'),
('ESP2024006','MBAYE', 'Sophie',  'sophie.mbaye@esp.sn',     '778901234','2001-12-03','Architecture',      'M2','2024-2025');

INSERT INTO ATTRIBUTION (id_etudiant, id_chambre, date_attribution, date_fin_prevue, statut) VALUES
(1,1, '2024-10-01','2025-07-31','active'),
(2,3, '2024-10-01','2025-07-31','active'),
(3,4, '2024-10-01','2025-07-31','active'),
(4,7, '2024-11-01','2025-07-31','active'),
(5,9, '2024-10-15','2025-07-31','active'),
(6,11,'2024-10-01','2025-07-31','active'),
(7,13,'2024-10-01','2025-07-31','active');

INSERT INTO PAIEMENT_LOYER (id_attribution, mois_concerne, montant_du, montant_paye, date_paiement, mode_paiement, statut) VALUES
(1,'2024-10-01',35000,35000,'2024-10-05','mobile_money','paye'),
(1,'2024-11-01',35000,35000,'2024-11-03','mobile_money','paye'),
(1,'2024-12-01',35000,35000,'2024-12-02','especes','paye'),
(1,'2025-01-01',35000,35000,'2025-01-06','mobile_money','paye'),
(1,'2025-02-01',35000,20000,'2025-02-10','especes','partiel'),
(1,'2025-03-01',35000,0,NULL,NULL,'impaye'),
(2,'2024-10-01',45000,45000,'2024-10-04','virement','paye'),
(2,'2024-11-01',45000,45000,'2024-11-05','virement','paye'),
(2,'2024-12-01',45000,45000,'2024-12-03','virement','paye'),
(2,'2025-01-01',45000,45000,'2025-01-04','virement','paye'),
(2,'2025-02-01',45000,45000,'2025-02-06','virement','paye'),
(2,'2025-03-01',45000,0,NULL,NULL,'impaye'),
(3,'2024-10-01',35000,35000,'2024-10-07','especes','paye'),
(3,'2024-11-01',35000,35000,'2024-11-08','especes','paye'),
(3,'2024-12-01',35000,35000,'2024-12-05','especes','paye'),
(3,'2025-01-01',35000,35000,'2025-01-09','mobile_money','paye'),
(3,'2025-02-01',35000,35000,'2025-02-07','mobile_money','paye'),
(3,'2025-03-01',35000,0,NULL,NULL,'en_retard'),
(4,'2024-11-01',38000,38000,'2024-11-02','mobile_money','paye'),
(4,'2024-12-01',38000,38000,'2024-12-01','mobile_money','paye'),
(4,'2025-01-01',38000,38000,'2025-01-05','mobile_money','paye'),
(4,'2025-02-01',38000,15000,'2025-02-15','especes','partiel'),
(4,'2025-03-01',38000,0,NULL,NULL,'impaye'),
(5,'2024-10-01',38000,38000,'2024-10-10','virement','paye'),
(5,'2024-11-01',38000,38000,'2024-11-09','virement','paye'),
(5,'2024-12-01',38000,38000,'2024-12-06','virement','paye'),
(5,'2025-01-01',38000,38000,'2025-01-08','virement','paye'),
(5,'2025-02-01',38000,38000,'2025-02-05','virement','paye'),
(5,'2025-03-01',38000,0,NULL,NULL,'impaye');

INSERT INTO INCIDENT (id_chambre, id_etudiant, type_incident, titre, description, priorite, statut) VALUES
(5, NULL, 'maintenance', 'Fuite d''eau au plafond',      'Fuite importante, risque d''inondation de la chambre du dessous', 'urgente',  'en_cours'),
(1, 1,    'maintenance', 'Climatiseur en panne',          'Le climatiseur ne fonctionne plus depuis 3 jours',                'haute',    'signale'),
(3, 2,    'hygiene',     'Problème de plomberie',         'La douche ne s''écoule plus correctement',                        'normale',  'en_cours'),
(7, 4,    'bruit',       'Nuisances sonores nocturnes',   'Bruit excessif la nuit venant du couloir',                        'normale',  'signale'),
(13,7,    'securite',    'Serrure défectueuse',           'La serrure de la porte principale ne fonctionne plus',            'urgente',  'signale'),
(9, 5,    'maintenance', 'Ampoules à remplacer',          'Plusieurs ampoules grillées dans la chambre',                     'faible',   'resolu');
