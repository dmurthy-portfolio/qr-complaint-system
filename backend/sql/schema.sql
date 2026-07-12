-- =====================================================================
-- QR Complaint Management System - MySQL Schema
-- =====================================================================
-- Run this once to create the database and required tables:
--   mysql -u root -p < schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS complaint_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE complaint_system;

-- ---------------------------------------------------------------------
-- Table: complaints
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)      NOT NULL,
  mobile_number VARCHAR(20)       NULL,
  image_path    VARCHAR(255)      NOT NULL,
  status        ENUM('Pending', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table: admins
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Seeding the first admin user
-- ---------------------------------------------------------------------
-- Do NOT insert a bcrypt hash directly here. Passwords must be hashed
-- by bcrypt at creation time. After running this schema, create your
-- first admin account by running from the backend/ folder:
--
--   node utils/seedAdmin.js <username> <password>
--
-- Example:
--   node utils/seedAdmin.js admin "MyStrongPassword123!"
--
-- This inserts a properly bcrypt-hashed password into the admins table.
