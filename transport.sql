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
-- Table structure for table `agent_delivery_bills`
--

DROP TABLE IF EXISTS `agent_delivery_bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_delivery_bills` (
  `bill_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `bill_date` date NOT NULL DEFAULT (curdate()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bill_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `agent_delivery_bills_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_delivery_bills`
--

LOCK TABLES `agent_delivery_bills` WRITE;
/*!40000 ALTER TABLE `agent_delivery_bills` DISABLE KEYS */;
INSERT INTO `agent_delivery_bills` VALUES (1,1,'2026-04-03','2026-04-03 13:36:59'),(2,1,'2026-04-03','2026-04-03 13:43:29'),(3,1,'2026-04-05','2026-04-05 16:30:08');
/*!40000 ALTER TABLE `agent_delivery_bills` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_payments`
--

LOCK TABLES `agent_payments` WRITE;
/*!40000 ALTER TABLE `agent_payments` DISABLE KEYS */;
INSERT INTO `agent_payments` VALUES (1,1,600.00,'2026-04-05',NULL,NULL,NULL,'','2026-04-05 16:55:15');
/*!40000 ALTER TABLE `agent_payments` ENABLE KEYS */;
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
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `province_id` int DEFAULT NULL,
  PRIMARY KEY (`agent_id`),
  UNIQUE KEY `province_id_2` (`province_id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `agents_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`province_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,'عبدالرحمن','077262345','2026-04-03 08:28:10',1);
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `batch_id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `batch_number` varchar(50) NOT NULL,
  `expiry_date` date NOT NULL,
  `quantity` int NOT NULL,
  `purchase_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`batch_id`),
  KEY `drug_id` (`drug_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`drug_id`),
  CONSTRAINT `batches_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  CONSTRAINT `batches_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'khan',NULL,'07865252',NULL,1,'2026-04-03 08:28:28'),(2,'شاهد',NULL,'073625267',NULL,1,'2026-04-03 13:41:27'),(3,'khan',NULL,'123',NULL,1,'2026-04-03 13:44:42'),(4,'khan',NULL,'123',NULL,1,'2026-04-03 13:44:54');
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
  `province_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `delivery_date` date DEFAULT (curdate()),
  `status` enum('pending','in_transit','delivered','cancelled','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `return_status` enum('none','partial_return','full_return') DEFAULT 'none',
  `return_fee_charged` decimal(10,2) DEFAULT '0.00',
  `return_date` date DEFAULT NULL,
  PRIMARY KEY (`delivery_id`),
  KEY `province_id` (`province_id`),
  KEY `fk_deliveries_customer` (`customer_id`),
  CONSTRAINT `deliveries_ibfk_2` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`province_id`),
  CONSTRAINT `fk_deliveries_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
INSERT INTO `deliveries` VALUES (1,1,1,'2026-04-03','in_transit','2026-04-03 08:28:56','none',0.00,NULL),(3,1,1,'2026-04-03','delivered','2026-04-03 12:50:32','none',0.00,NULL),(4,1,1,'2026-04-03','rejected','2026-04-03 12:56:49','none',0.00,NULL),(5,1,1,'2026-04-03','cancelled','2026-04-03 12:57:36','none',0.00,NULL),(6,1,1,'2026-04-03','in_transit','2026-04-03 12:58:54','none',0.00,NULL),(7,1,2,'2026-04-03','in_transit','2026-04-03 13:42:12','none',0.00,NULL),(8,1,1,'2026-04-03','delivered','2026-04-03 14:36:15','none',0.00,NULL),(9,1,1,'2026-04-05','rejected','2026-04-05 16:27:44','none',0.00,NULL);
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_agent_assignments`
--

DROP TABLE IF EXISTS `delivery_agent_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_agent_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `delivery_id` int NOT NULL,
  `agent_id` int NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `assigned_date` date NOT NULL DEFAULT (curdate()),
  `status` enum('pending','transaction','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bill_id` int DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  UNIQUE KEY `unique_delivery_agent` (`delivery_id`,`agent_id`),
  KEY `agent_id` (`agent_id`),
  KEY `bill_id` (`bill_id`),
  CONSTRAINT `delivery_agent_assignments_ibfk_1` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`delivery_id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_agent_assignments_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_agent_assignments_ibfk_3` FOREIGN KEY (`bill_id`) REFERENCES `agent_delivery_bills` (`bill_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_agent_assignments`
--

LOCK TABLES `delivery_agent_assignments` WRITE;
/*!40000 ALTER TABLE `delivery_agent_assignments` DISABLE KEYS */;
INSERT INTO `delivery_agent_assignments` VALUES (2,3,1,0.00,'2026-04-03','pending','2026-04-03 13:36:59','2026-04-03 13:36:59',1),(3,4,1,0.00,'2026-04-03','pending','2026-04-03 13:36:59','2026-04-03 13:36:59',1),(4,5,1,0.00,'2026-04-03','pending','2026-04-03 13:36:59','2026-04-03 13:36:59',1),(5,6,1,0.00,'2026-04-03','pending','2026-04-03 13:36:59','2026-04-03 13:36:59',1),(6,7,1,0.00,'2026-04-03','pending','2026-04-03 13:43:29','2026-04-03 13:43:29',2),(7,8,1,0.00,'2026-04-05','pending','2026-04-05 16:30:08','2026-04-05 16:30:08',3),(8,9,1,0.00,'2026-04-05','pending','2026-04-05 16:30:08','2026-04-05 16:30:08',3);
/*!40000 ALTER TABLE `delivery_agent_assignments` ENABLE KEYS */;
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
  `commission_amount` decimal(10,2) DEFAULT NULL,
  `fess` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `delivery_id` (`delivery_id`),
  CONSTRAINT `delivery_items_ibfk_1` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`delivery_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_items`
--

LOCK TABLES `delivery_items` WRITE;
/*!40000 ALTER TABLE `delivery_items` DISABLE KEYS */;
INSERT INTO `delivery_items` (`item_id`, `delivery_id`, `item_name`, `unit_cost`, `quantity`, `item_description`, `commission_amount`, `fess`) VALUES (2,1,'mobile',500.00,1,'',0.00,0.00),(4,3,'compter',600.00,1,'',50.00,100.00),(5,4,'asdf',455.00,1,'500',46.00,455.00),(6,5,'asdf',455.00,1,'500',46.00,455.00),(7,6,'computer',500.00,1,'',50.00,100.00),(8,7,'آیفون ۱۷',35000.00,1,'',50.00,100.00),(9,8,'compute',500.00,1,'',50.00,100.00),(10,9,'pakistan',500.00,1,'',50.00,100.00);
/*!40000 ALTER TABLE `delivery_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drugs`
--

DROP TABLE IF EXISTS `drugs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drugs` (
  `drug_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `generic_name` varchar(255) DEFAULT NULL,
  `description` text,
  `barcode` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dosage_form` varchar(100) DEFAULT NULL,
  `strength` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `storage_condition` enum('room','cold','frozen') DEFAULT 'room',
  `expiry_date` date DEFAULT NULL,
  PRIMARY KEY (`drug_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drugs`
--

LOCK TABLES `drugs` WRITE;
/*!40000 ALTER TABLE `drugs` DISABLE KEYS */;
/*!40000 ALTER TABLE `drugs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `expense_id` int NOT NULL AUTO_INCREMENT,
  `expense_description` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`expense_id`),
  KEY `idx_expense_date` (`expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `loan_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `received_amount` decimal(10,2) NOT NULL,
  `loan_balance` decimal(10,2) GENERATED ALWAYS AS ((`total_amount` - `received_amount`)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `return_date` date DEFAULT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `note_id` int NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`note_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text,
  PRIMARY KEY (`payment_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `prescription_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `doctor_name` varchar(255) NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `notes` text,
  PRIMARY KEY (`prescription_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'کابل','2026-04-03 08:27:56');
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `purchase_id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `purchase_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`purchase_id`),
  KEY `drug_id` (`drug_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`drug_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `sale_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sale_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transactions`
--

DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `quantity_change` int NOT NULL,
  `earning` decimal(10,2) NOT NULL,
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `discount` decimal(10,0) DEFAULT NULL,
  `customerName` varchar(50) DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `sale_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `totalAmount` decimal(10,2) GENERATED ALWAYS AS ((`quantity_change` * (`sale_price` - ifnull(`discount`,0)))) STORED,
  `transaction_type` enum('sale','return') DEFAULT 'sale',
  PRIMARY KEY (`transaction_id`),
  KEY `drug_id` (`drug_id`),
  KEY `fk_customer` (`customer_id`),
  CONSTRAINT `fk_customer_cascade` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `stock_transactions_ibfk_1` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`drug_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--

LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `address` text,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `roles` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 20:44:46
