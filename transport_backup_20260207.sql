-- MySQL dump 10.13  Distrib 9.0.1, for Win64 (x86_64)
--
-- Host: localhost    Database: transport
-- ------------------------------------------------------
-- Server version	9.0.1

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
-- Table structure for table `agent_payments`
--

DROP TABLE IF EXISTS `agent_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT (curdate()),
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `agent_payments_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_payments`
--

LOCK TABLES `agent_payments` WRITE;
/*!40000 ALTER TABLE `agent_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `agent_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agent_provinces`
--

DROP TABLE IF EXISTS `agent_provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_provinces` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `province_id` int NOT NULL,
  `assignment_date` date DEFAULT (curdate()),
  PRIMARY KEY (`assignment_id`),
  UNIQUE KEY `unique_agent_province` (`agent_id`,`province_id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `agent_provinces_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE CASCADE,
  CONSTRAINT `agent_provinces_ibfk_2` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`province_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_provinces`
--

LOCK TABLES `agent_provinces` WRITE;
/*!40000 ALTER TABLE `agent_provinces` DISABLE KEYS */;
INSERT INTO `agent_provinces` VALUES (1,1,1,'2026-02-06'),(3,2,3,'2026-02-06'),(4,3,4,'2026-02-06'),(5,4,5,'2026-02-06'),(6,3,3,'2026-02-07'),(7,4,4,'2026-02-07'),(8,4,1,'2026-02-07'),(9,4,3,'2026-02-07');
/*!40000 ALTER TABLE `agent_provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `agent_id` int NOT NULL AUTO_INCREMENT,
  `agent_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT '10.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`agent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,'John Doe',NULL,'123-456-7890',15.00,'2026-02-06 18:50:01'),(2,'Jane Smith',NULL,'987-654-3210',12.50,'2026-02-06 18:50:01'),(3,'Bob Wilson',NULL,'555-123-4567',10.00,'2026-02-06 18:50:01'),(4,'Alice Johnson',NULL,'444-555-6666',20.00,'2026-02-06 18:50:01');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `province_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`province_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'hassan','wali khan','0731574726','sdfgsdg',1,'2026-02-06 21:26:28');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `delivery_id` int NOT NULL AUTO_INCREMENT,
  `tracking_number` varchar(50) DEFAULT NULL,
  `agent_id` int NOT NULL,
  `province_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `commission_amount` decimal(10,2) DEFAULT NULL,
  `delivery_date` date DEFAULT (curdate()),
  `status` enum('pending','in_transit','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`delivery_id`),
  UNIQUE KEY `tracking_number` (`tracking_number`),
  KEY `agent_id` (`agent_id`),
  KEY `province_id` (`province_id`),
  KEY `fk_deliveries_customer` (`customer_id`),
  CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`),
  CONSTRAINT `deliveries_ibfk_2` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`province_id`),
  CONSTRAINT `fk_deliveries_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
INSERT INTO `deliveries` VALUES (1,'TRK001',1,1,NULL,7.50,'2026-02-06','pending','2026-02-06 18:50:03'),(2,'TRK002',2,3,NULL,3.75,'2026-02-06','pending','2026-02-06 18:50:03'),(3,'TRK003',3,4,NULL,1.00,'2026-02-06','pending','2026-02-06 18:50:03'),(4,'TRK004',4,5,NULL,20.00,'2026-02-06','pending','2026-02-06 18:50:03'),(5,'DEL1770413236504941',3,1,NULL,0.00,'2026-02-06','pending','2026-02-06 21:27:16');
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_items`
--

DROP TABLE IF EXISTS `delivery_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `delivery_id` int NOT NULL,
  `item_name` varchar(200) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `quantity` int DEFAULT '1',
  `total_cost` decimal(10,2) GENERATED ALWAYS AS ((`unit_cost` * `quantity`)) STORED,
  `item_description` text,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `commission_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `delivery_id` (`delivery_id`),
  CONSTRAINT `delivery_items_ibfk_1` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`delivery_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_items`
--

LOCK TABLES `delivery_items` WRITE;
/*!40000 ALTER TABLE `delivery_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinces` (
  `province_id` int NOT NULL AUTO_INCREMENT,
  `province_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`province_id`),
  UNIQUE KEY `unique_province_name` (`province_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'kabul','2026-02-06 18:50:01'),(3,'Province C','2026-02-06 18:50:01'),(4,'Province D','2026-02-06 18:50:01'),(5,'Province E','2026-02-06 18:50:01');
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-07  2:04:37
