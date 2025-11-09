-- booking_system database
CREATE DATABASE IF NOT EXISTS `booking_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `booking_system`;

-- Users
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100),
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20),
  `date_of_birth` DATE,
  `registration_status` ENUM('active','inactive') DEFAULT 'active',
  `account_status` ENUM('enabled','disabled') DEFAULT 'enabled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Venues
CREATE TABLE `venues` (
  `venue_id` INT AUTO_INCREMENT PRIMARY KEY,
  `venue_name` VARCHAR(255) NOT NULL,
  `venue_type` VARCHAR(100),
  `capacity` INT DEFAULT 0,
  `contact_number` VARCHAR(50),
  `address` TEXT,
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `postal_code` VARCHAR(20),
  `facilities` TEXT
) ENGINE=InnoDB;

-- Screens
CREATE TABLE `screens` (
  `screen_id` INT AUTO_INCREMENT PRIMARY KEY,
  `venue_id` INT NOT NULL,
  `screen_name` VARCHAR(150),
  `screen_number` INT,
  `screen_type` VARCHAR(100),
  `sound_system` VARCHAR(100),
  `total_seats` INT DEFAULT 0,
  FOREIGN KEY (`venue_id`) REFERENCES `venues`(`venue_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seats
CREATE TABLE `seats` (
  `seat_id` INT AUTO_INCREMENT PRIMARY KEY,
  `screen_id` INT NOT NULL,
  `row_number` VARCHAR(10),
  `seat_number` VARCHAR(10),
  `seat_type` VARCHAR(50),
  `status` ENUM('available','blocked','unavailable') DEFAULT 'available',
  UNIQUE (`screen_id`, `row_number`, `seat_number`),
  FOREIGN KEY (`screen_id`) REFERENCES `screens`(`screen_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Events
CREATE TABLE `events` (
  `event_id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_name` VARCHAR(255) NOT NULL,
  `event_type` ENUM('movie','concert','other') DEFAULT 'movie',
  `description` TEXT,
  `language` VARCHAR(50),
  `release_date` DATE,
  `duration` INT,
  `rating` VARCHAR(20),
  `genre` VARCHAR(100),
  `status` ENUM('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB;

CREATE TABLE movies (
  movie_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(100),
  genre VARCHAR(100),
  release_date DATE,
  duration INT,
  rating VARCHAR(10),
  poster_url VARCHAR(500),
  trailer_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shows
CREATE TABLE `shows` (
  `show_id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `venue_id` INT NOT NULL,
  `screen_id` INT NOT NULL,
  `show_date` DATE NOT NULL,
  `show_time` TIME NOT NULL,
  `start_time` DATETIME,
  `end_time` DATETIME,
  `status` ENUM('scheduled','cancelled','completed') DEFAULT 'scheduled',
  FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE CASCADE,
  FOREIGN KEY (`venue_id`) REFERENCES `venues`(`venue_id`) ON DELETE CASCADE,
  FOREIGN KEY (`screen_id`) REFERENCES `screens`(`screen_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bookings
CREATE TABLE `bookings` (
  `booking_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `show_id` INT NOT NULL,
  `booking_date` DATE NOT NULL,
  `booking_time` TIME NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `number_of_tickets` INT DEFAULT 0,
  `booking_status` ENUM('reserved','confirmed','cancelled','refunded') DEFAULT 'reserved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`show_id`) REFERENCES `shows`(`show_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tickets
CREATE TABLE `tickets` (
  `ticket_id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `seat_id` INT NOT NULL,
  `ticket_type` VARCHAR(50) DEFAULT 'standard',
  `ticket_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `ticket_status` ENUM('issued','cancelled','refunded') DEFAULT 'issued',
  `qr_code` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
  FOREIGN KEY (`seat_id`) REFERENCES `seats`(`seat_id`)
) ENGINE=InnoDB;

-- Payments
CREATE TABLE `payments` (
  `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `payment_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('card','netbanking','wallet','cash') DEFAULT 'card',
  `gateway_used` VARCHAR(100),
  `transaction_id` VARCHAR(255),
  `payment_date` DATE,
  `payment_time` TIME,
  `payment_status` ENUM('pending','success','failed','refunded') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB;

-- Reviews
CREATE TABLE `reviews` (
  `review_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `event_id` INT,
  `show_id` INT,
  `rating` INT CHECK (`rating` BETWEEN 1 AND 5),
  `review_text` TEXT,
  `review_date` DATE,
  `review_time` TIME,
  `helpful_count` INT DEFAULT 0,
  `reviewer_type` VARCHAR(50),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`),
  FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`),
  FOREIGN KEY (`show_id`) REFERENCES `shows`(`show_id`)
) ENGINE=InnoDB;

-- Sample data
INSERT INTO `venues` (`venue_name`, `venue_type`, `capacity`, `contact_number`, `city`) VALUES
('Sunshine Multiplex','theatre',500,'+911234567890','Kochi'),
('City Arena','concert_hall',2000,'+911112223334','Kochi');

INSERT INTO `screens` (`venue_id`, `screen_name`, `screen_number`, `total_seats`) VALUES
(1,'Screen 1',1,100),
(1,'Screen 2',2,120);

-- Procedure to seed seats
DELIMITER $$
CREATE PROCEDURE `seed_seats_for_screen`(IN sid INT, IN rows_count INT, IN cols_count INT)
BEGIN
  DECLARE r INT DEFAULT 1;
  DECLARE c INT DEFAULT 1;
  SET r = 1;
  WHILE r <= rows_count DO
    SET c = 1;
    WHILE c <= cols_count DO
      INSERT IGNORE INTO `seats` (`screen_id`,`row_number`,`seat_number`,`seat_type`,`status`)
      VALUES (sid, CONCAT('R',r), LPAD(c,2,'0'), 'standard','available');
      SET c = c + 1;
    END WHILE;
    SET r = r + 1;
  END WHILE;
END$$
DELIMITER ;

CALL `seed_seats_for_screen`(1,10,10);
CALL `seed_seats_for_screen`(2,10,12);
DROP PROCEDURE IF EXISTS `seed_seats_for_screen`;
