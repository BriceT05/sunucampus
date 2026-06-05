-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: residence_univ
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attribution`
--

DROP TABLE IF EXISTS `attribution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribution` (
  `num_etudiant` int NOT NULL,
  `num_chambre` int NOT NULL,
  `date_entree` date NOT NULL,
  `date_sortie_prevue` date NOT NULL,
  `caution_versee` decimal(10,2) NOT NULL,
  PRIMARY KEY (`num_etudiant`,`num_chambre`),
  KEY `fk_attr_cham` (`num_chambre`),
  CONSTRAINT `fk_attr_cham` FOREIGN KEY (`num_chambre`) REFERENCES `chambre` (`num_chambre`) ON DELETE CASCADE,
  CONSTRAINT `fk_attr_etu` FOREIGN KEY (`num_etudiant`) REFERENCES `etudiant` (`num_etudiant`) ON DELETE CASCADE,
  CONSTRAINT `attribution_chk_1` CHECK ((`caution_versee` >= 0)),
  CONSTRAINT `chk_dates_attr` CHECK ((`date_sortie_prevue` > `date_entree`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribution`
--

LOCK TABLES `attribution` WRITE;
/*!40000 ALTER TABLE `attribution` DISABLE KEYS */;
INSERT INTO `attribution` VALUES (1,1,'2025-10-01','2026-07-31',25000.00),(2,2,'2025-11-15','2026-08-15',25000.00),(3,4,'2025-10-01','2026-06-30',40000.00),(4,5,'2025-09-01','2026-07-01',40000.00),(5,8,'2025-10-20','2026-07-20',25000.00),(6,10,'2025-11-01','2026-09-01',24000.00),(7,11,'2025-10-01','2026-07-31',27000.00),(8,13,'2025-12-01','2026-08-31',42000.00),(9,14,'2025-10-15','2026-06-15',42000.00),(10,16,'2025-09-15','2026-07-15',27000.00),(11,18,'2025-11-01','2026-08-01',27000.00),(12,20,'2025-10-01','2026-07-31',42000.00),(13,21,'2025-12-15','2026-09-15',28000.00),(14,22,'2025-10-01','2026-06-30',28000.00),(15,24,'2025-09-01','2026-07-01',44000.00),(16,26,'2025-11-20','2026-08-20',28000.00),(17,27,'2025-10-01','2026-07-31',44000.00),(18,30,'2025-10-01','2026-06-05',46000.00),(19,1,'2024-10-01','2025-07-31',25000.00),(20,11,'2024-09-15','2025-06-15',27000.00),(21,13,'2024-11-01','2025-08-01',42000.00),(22,4,'2024-10-20','2025-07-20',40000.00),(23,8,'2024-09-01','2025-06-30',25000.00),(24,16,'2024-11-15','2025-08-15',27000.00),(25,21,'2024-10-01','2025-07-31',28000.00);
/*!40000 ALTER TABLE `attribution` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batiment`
--

DROP TABLE IF EXISTS `batiment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batiment` (
  `id_bat` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nb_etages` tinyint NOT NULL,
  `annee_construction` year NOT NULL,
  PRIMARY KEY (`id_bat`),
  CONSTRAINT `batiment_chk_1` CHECK ((`nb_etages` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batiment`
--

LOCK TABLES `batiment` WRITE;
/*!40000 ALTER TABLE `batiment` DISABLE KEYS */;
INSERT INTO `batiment` VALUES (1,'Bâtiment A ? Cheikh Anta Diop','Campus UCAD, Route de Ouakam, Dakar',4,1985),(2,'Bâtiment B ? Léopold Sédar Senghor','Campus UCAD, Route de Ouakam, Dakar',5,1998),(3,'Bâtiment C ? Aline Sitoé Diatta','Campus UCAD, Avenue Bourguiba, Dakar',3,2010);
/*!40000 ALTER TABLE `batiment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chambre`
--

DROP TABLE IF EXISTS `chambre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chambre` (
  `num_chambre` int NOT NULL AUTO_INCREMENT,
  `type` enum('simple','double') COLLATE utf8mb4_unicode_ci NOT NULL,
  `superficie` decimal(6,2) NOT NULL,
  `loyer_mensuel` decimal(10,2) NOT NULL,
  `etat` enum('disponible','occupee','en travaux') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'disponible',
  `id_bat` int NOT NULL,
  PRIMARY KEY (`num_chambre`),
  KEY `fk_chambre_bat` (`id_bat`),
  CONSTRAINT `fk_chambre_bat` FOREIGN KEY (`id_bat`) REFERENCES `batiment` (`id_bat`) ON DELETE CASCADE,
  CONSTRAINT `chambre_chk_1` CHECK ((`superficie` > 0)),
  CONSTRAINT `chambre_chk_2` CHECK ((`loyer_mensuel` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chambre`
--

LOCK TABLES `chambre` WRITE;
/*!40000 ALTER TABLE `chambre` DISABLE KEYS */;
INSERT INTO `chambre` VALUES (1,'simple',12.00,25000.00,'occupee',1),(2,'simple',12.00,25000.00,'occupee',1),(3,'simple',12.00,25000.00,'disponible',1),(4,'double',18.50,40000.00,'occupee',1),(5,'double',18.50,40000.00,'occupee',1),(6,'double',18.50,40000.00,'disponible',1),(7,'simple',12.00,25000.00,'en travaux',1),(8,'simple',12.00,25000.00,'occupee',1),(9,'double',20.00,42000.00,'disponible',1),(10,'simple',11.50,24000.00,'occupee',1),(11,'simple',13.00,27000.00,'occupee',2),(12,'simple',13.00,27000.00,'disponible',2),(13,'double',20.00,42000.00,'occupee',2),(14,'double',20.00,42000.00,'occupee',2),(15,'simple',13.00,27000.00,'en travaux',2),(16,'simple',13.00,27000.00,'occupee',2),(17,'double',22.00,45000.00,'disponible',2),(18,'simple',13.00,27000.00,'occupee',2),(19,'simple',13.00,27000.00,'disponible',2),(20,'double',20.00,42000.00,'occupee',2),(21,'simple',14.00,28000.00,'occupee',3),(22,'simple',14.00,28000.00,'occupee',3),(23,'double',21.00,44000.00,'disponible',3),(24,'double',21.00,44000.00,'occupee',3),(25,'simple',14.00,28000.00,'disponible',3),(26,'simple',14.00,28000.00,'occupee',3),(27,'double',21.00,44000.00,'occupee',3),(28,'simple',14.00,28000.00,'en travaux',3),(29,'simple',14.00,28000.00,'disponible',3),(30,'double',23.00,46000.00,'occupee',3);
/*!40000 ALTER TABLE `chambre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etudiant`
--

DROP TABLE IF EXISTS `etudiant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etudiant` (
  `num_etudiant` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filiere` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niveau` enum('L1','L2','L3','M1','M2') COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`num_etudiant`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etudiant`
--

LOCK TABLES `etudiant` WRITE;
/*!40000 ALTER TABLE `etudiant` DISABLE KEYS */;
INSERT INTO `etudiant` VALUES (1,'Diallo','Mamadou','GLSI','L2','771234501','mamadou.diallo@esp.sn'),(2,'Ndiaye','Fatou','GI','L1','771234502','fatou.ndiaye@esp.sn'),(3,'Sow','Ibrahima','GLSI','L3','771234503','ibrahima.sow@esp.sn'),(4,'Ba','Aissatou','Telecom','L2','771234504','aissatou.ba@esp.sn'),(5,'Fall','Cheikh','GI','L1','771234505','cheikh.fall@esp.sn'),(6,'Mbaye','Rokhaya','GLSI','M1','771234506','rokhaya.mbaye@esp.sn'),(7,'Sarr','Omar','GI','L2','771234507','omar.sarr@esp.sn'),(8,'Kane','Mariama','Telecom','L3','771234508','mariama.kane@esp.sn'),(9,'Thiaw','Abdou','GLSI','L1','771234509','abdou.thiaw@esp.sn'),(10,'Diop','Bineta','GI','M2','771234510','bineta.diop@esp.sn'),(11,'Gueye','Pape','GLSI','L2','771234511','pape.gueye@esp.sn'),(12,'Cisse','Ndéye','Telecom','L1','771234512','ndeye.cisse@esp.sn'),(13,'Diouf','Seydou','GI','L3','771234513','seydou.diouf@esp.sn'),(14,'Lo','Aminata','GLSI','M1','771234514','aminata.lo@esp.sn'),(15,'Ndoye','Babacar','Telecom','L2','771234515','babacar.ndoye@esp.sn'),(16,'Toure','Khadidiatou','GI','L1','771234516','khadidiatou.toure@esp.sn'),(17,'Badji','Lamine','GLSI','L3','771234517','lamine.badji@esp.sn'),(18,'Faye','Dieynaba','Telecom','M2','771234518','dieynaba.faye@esp.sn'),(19,'Diagne','Moussa','GI','L2','771234519','moussa.diagne@esp.sn'),(20,'Sy','Sokhna','GLSI','L1','771234520','sokhna.sy@esp.sn'),(21,'Niang','Serigne','Telecom','L3','771234521','serigne.niang@esp.sn'),(22,'Mane','Yaye','GI','M1','771234522','yaye.mane@esp.sn'),(23,'Camara','Assane','GLSI','L2','771234523','assane.camara@esp.sn'),(24,'Sene','Ndéye Coumba','Telecom','L1','771234524','ndeye.sene@esp.sn'),(25,'Dembele','Ousseynou','GI','L3','771234525','ousseynou.dembele@esp.sn');
/*!40000 ALTER TABLE `etudiant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incident`
--

DROP TABLE IF EXISTS `incident`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incident` (
  `id_incident` int NOT NULL AUTO_INCREMENT,
  `num_chambre` int NOT NULL,
  `date_signalement` date NOT NULL DEFAULT (curdate()),
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priorite` enum('faible','moyenne','urgente') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'faible',
  `statut` enum('ouvert','en cours','resolu') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ouvert',
  `date_resolution` date DEFAULT NULL,
  PRIMARY KEY (`id_incident`),
  KEY `fk_incident_cham` (`num_chambre`),
  CONSTRAINT `fk_incident_cham` FOREIGN KEY (`num_chambre`) REFERENCES `chambre` (`num_chambre`) ON DELETE CASCADE,
  CONSTRAINT `chk_resolution` CHECK (((`date_resolution` is null) or (`date_resolution` >= `date_signalement`)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident`
--

LOCK TABLES `incident` WRITE;
/*!40000 ALTER TABLE `incident` DISABLE KEYS */;
INSERT INTO `incident` VALUES (1,7,'2026-01-10','Fuite d\'eau sous le lavabo','urgente','resolu','2026-01-12'),(2,15,'2026-02-05','Prise électrique défectueuse','moyenne','resolu','2026-02-08'),(3,28,'2026-02-20','Porte qui ne ferme plus correctement','faible','en cours',NULL),(4,2,'2026-03-01','Fissure au plafond','moyenne','ouvert',NULL),(5,5,'2026-03-15','Climatiseur hors service','urgente','en cours',NULL),(6,13,'2026-04-02','Fenêtre cassée','moyenne','ouvert',NULL),(7,20,'2026-04-10','Ampoule de salle de bain grillée','faible','resolu','2026-04-11'),(8,1,'2026-04-20','Robinet qui fuit','faible','ouvert',NULL),(9,24,'2026-05-03','Inondation suite à pluie - plafond','urgente','ouvert',NULL),(10,11,'2026-05-15','Serrure bloquée de l\'intérieur','urgente','en cours',NULL);
/*!40000 ALTER TABLE `incident` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paiement_loyer`
--

DROP TABLE IF EXISTS `paiement_loyer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paiement_loyer` (
  `id_paiement` int NOT NULL AUTO_INCREMENT,
  `mois` tinyint NOT NULL,
  `annee` year NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_paiement_effectif` date NOT NULL,
  `num_etudiant` int NOT NULL,
  `num_chambre` int NOT NULL,
  PRIMARY KEY (`id_paiement`),
  UNIQUE KEY `uq_paiement` (`num_etudiant`,`num_chambre`,`mois`,`annee`),
  CONSTRAINT `fk_paiement_attr` FOREIGN KEY (`num_etudiant`, `num_chambre`) REFERENCES `attribution` (`num_etudiant`, `num_chambre`) ON DELETE CASCADE,
  CONSTRAINT `paiement_loyer_chk_1` CHECK ((`mois` between 1 and 12)),
  CONSTRAINT `paiement_loyer_chk_2` CHECK ((`montant` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paiement_loyer`
--

LOCK TABLES `paiement_loyer` WRITE;
/*!40000 ALTER TABLE `paiement_loyer` DISABLE KEYS */;
INSERT INTO `paiement_loyer` VALUES (1,10,2025,25000.00,'2025-10-03',1,1),(2,11,2025,25000.00,'2025-11-04',1,1),(3,12,2025,25000.00,'2025-12-02',1,1),(4,1,2026,25000.00,'2026-01-05',1,1),(5,2,2026,25000.00,'2026-02-03',1,1),(6,3,2026,25000.00,'2026-03-04',1,1),(7,10,2025,25000.00,'2025-10-04',2,2),(8,11,2025,25000.00,'2025-11-03',2,2),(9,12,2025,25000.00,'2025-12-05',2,2),(10,1,2026,25000.00,'2026-01-04',2,2),(11,2,2026,25000.00,'2026-02-05',2,2),(12,3,2026,25000.00,'2026-03-10',2,2),(13,10,2025,40000.00,'2025-10-02',3,4),(14,11,2025,40000.00,'2025-11-02',3,4),(15,12,2025,40000.00,'2025-12-03',3,4),(16,1,2026,40000.00,'2026-01-03',3,4),(17,2,2026,40000.00,'2026-02-04',3,4),(18,3,2026,40000.00,'2026-03-03',3,4),(19,10,2025,40000.00,'2025-10-03',4,5),(20,11,2025,40000.00,'2025-11-04',4,5),(21,12,2025,40000.00,'2025-12-04',4,5),(22,1,2026,40000.00,'2026-01-05',4,5),(23,10,2025,25000.00,'2025-10-01',5,8),(24,11,2025,25000.00,'2025-11-03',5,8),(25,12,2025,25000.00,'2025-12-01',5,8),(26,1,2026,25000.00,'2026-01-02',5,8),(27,2,2026,25000.00,'2026-02-03',5,8),(28,3,2026,25000.00,'2026-03-01',5,8),(29,10,2025,24000.00,'2025-10-04',6,10),(30,11,2025,24000.00,'2025-11-04',6,10),(31,12,2025,24000.00,'2025-12-04',6,10),(32,1,2026,24000.00,'2026-01-04',6,10),(33,2,2026,24000.00,'2026-02-04',6,10),(34,10,2025,27000.00,'2025-10-03',7,11),(35,11,2025,27000.00,'2025-11-03',7,11),(36,12,2025,27000.00,'2025-12-03',7,11),(37,1,2026,27000.00,'2026-01-03',7,11),(38,2,2026,27000.00,'2026-02-03',7,11),(39,3,2026,27000.00,'2026-03-03',7,11),(40,10,2025,42000.00,'2025-10-05',8,13),(41,11,2025,42000.00,'2025-11-05',8,13),(42,12,2025,42000.00,'2025-12-05',8,13),(43,1,2026,42000.00,'2026-01-05',8,13),(44,10,2025,42000.00,'2025-10-02',9,14),(45,11,2025,42000.00,'2025-11-02',9,14),(46,12,2025,42000.00,'2025-12-02',9,14),(47,1,2026,42000.00,'2026-01-02',9,14),(48,2,2026,42000.00,'2026-02-02',9,14),(49,3,2026,42000.00,'2026-03-02',9,14);
/*!40000 ALTER TABLE `paiement_loyer` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 20:00:35
