-- CampusFind — full MySQL schema (run: mysql -u root -p < database/schema.sql)
DROP DATABASE IF EXISTS campusfind;
CREATE DATABASE campusfind CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusfind;

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Student','Staff','Admin') NOT NULL DEFAULT 'Student',
  roll_number VARCHAR(30) NULL,
  department VARCHAR(60) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE items (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  type ENUM('Lost','Found') NOT NULL,
  category ENUM('ID Card','Phone','Wallet','Books','Bags','Keys','Electronics','Other') NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  item_date DATE NOT NULL,
  location VARCHAR(200) NOT NULL,
  description TEXT NULL,
  image_url MEDIUMTEXT NULL,
  brand VARCHAR(80) NULL,
  color VARCHAR(40) NULL,
  identifying_marks VARCHAR(255) NULL,      -- private: hidden from non-owners on Found items
  current_holder VARCHAR(120) NULL,
  offer_amount DECIMAL(10,2) NULL,          -- optional reward offered by the owner (never required)
  offer_message VARCHAR(255) NULL,
  status ENUM('Open','Claimed','Handed Over','Archived') NOT NULL DEFAULT 'Open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_items_type (type), INDEX idx_items_status (status), INDEX idx_items_category (category),
  FULLTEXT INDEX ft_items_search (name, description, location)
) ENGINE=InnoDB;

CREATE TABLE claims (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,             -- claimant
  item_id VARCHAR(36) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  proof VARCHAR(500) NULL,
  offer_amount DECIMAL(10,2) NULL,          -- optional thank-you offer from claimant (never required)
  offer_message VARCHAR(255) NULL,
  owner_response ENUM('Pending','Yes','No') NOT NULL DEFAULT 'Pending',  -- finder's Yes/No
  status ENUM('Pending','In Review','Approved','Handed Over','Rejected') NOT NULL DEFAULT 'Pending',
  reviewed_by VARCHAR(36) NULL,
  review_notes VARCHAR(500) NULL,
  resolved_at DATETIME NULL,
  date_submitted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_claims_status (status)
) ENGINE=InnoDB;

CREATE TABLE claim_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  claim_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL,
  by_name VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- One-time handover QR tokens (only a SHA-256 hash is stored)
CREATE TABLE handover_tokens (
  id VARCHAR(36) PRIMARY KEY,
  claim_id VARCHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  used_by VARCHAR(36) NULL,
  invalidated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  claim_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_claim (claim_id, id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message VARCHAR(500) NOT NULL,
  link VARCHAR(200) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB;

CREATE TABLE item_matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lost_item_id VARCHAR(36) NOT NULL,
  found_item_id VARCHAR(36) NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_match (lost_item_id, found_item_id),
  FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE activity_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  action VARCHAR(60) NOT NULL,
  entity VARCHAR(30) NOT NULL,
  entity_id VARCHAR(36) NULL,
  details VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE VIEW v_dashboard_stats AS
SELECT (SELECT COUNT(*) FROM items WHERE type='Lost') AS lost_items,
       (SELECT COUNT(*) FROM items WHERE type='Found') AS found_items,
       (SELECT COUNT(*) FROM claims WHERE status IN ('Pending','In Review')) AS open_claims,
       (SELECT COUNT(*) FROM claims WHERE status='Handed Over') AS handed_over;

DELIMITER //
CREATE TRIGGER trg_claim_status_log AFTER UPDATE ON claims FOR EACH ROW
BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO activity_log (user_id, action, entity, entity_id, details)
    VALUES (NEW.reviewed_by, CONCAT('CLAIM_', UPPER(REPLACE(NEW.status,' ','_'))), 'claim', NEW.id, CONCAT(OLD.status,' -> ',NEW.status));
  END IF;
END//
DELIMITER ;
