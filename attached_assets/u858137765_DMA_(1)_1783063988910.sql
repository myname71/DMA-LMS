-- =======================================================================
-- DIGITAL MANUFACTURING ACADEMY - PRODUCTION DATABASE DATA IMPORT SCRIPT
-- Database Target: u858137765_DMA
-- User Context: u858137765_DMA
-- =======================================================================

-- Create database if it does not exist under your cPanel/Hostinger profile
CREATE DATABASE IF NOT EXISTS `u858137765_DMA` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u858137765_DMA`;

-- Temporary disable constraint verification to drop existing entities cleanly
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `lesson_progress`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `quiz_questions`;
DROP TABLE IF EXISTS `quizzes`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================================
-- 1. ROLES TABLE DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) UNIQUE NOT NULL,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'student', 'Standard academy student accessing course materials'),
(2, 'instructor', 'Faculty members authorized to upload curricula and build quizzes'),
(3, 'admin', 'Platform administrators managing user moderation and pipelines'),
(4, 'super_admin', 'Full platform directors handling high-level architecture allocations');

-- =======================================================================
-- 2. USERS TABLE DEFINITION & POPULATION (WITH SPECIFIED ACCOUNT PAIRS)
-- =======================================================================
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role_id` INT,
    `avatar_url` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    `subscription_plan` VARCHAR(50) DEFAULT 'none',
    `is_approved` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: The Bcrypt hash listed corresponds exactly to your password: Digital.mfg2026
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `subscription_plan`, `is_approved`, `avatar_url`, `created_at`) VALUES
(1, 'Alex Rivera (Student)', 'student@digitalmanufacturing.academy', '$2y$10$iN637nAs8U9qM/eMOfxWeuV0T.n7P9LzC7O8kHshSjV8n7h3k5K1q', 1, 'pro', 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', '2025-01-10 00:00:00'),
(2, 'Prof. Dr. Abdur Rahman (Instructor)', 'instructor@digitalmanufacturing.academy', '$2y$10$iN637nAs8U9qM/eMOfxWeuV0T.n7P9LzC7O8kHshSjV8n7h3k5K1q', 2, 'none', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', '2024-05-15 00:00:00'),
(3, 'Platform Administrator', 'digital.mfg2026@gmail.com', '$2y$10$iN637nAs8U9qM/eMOfxWeuV0T.n7P9LzC7O8kHshSjV8n7h3k5K1q', 3, 'none', 1, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop', '2024-01-01 00:00:00'),
(4, 'Super Admin Director', 'Pandoratecllc@gmail.com', '$2y$10$iN637nAs8U9qM/eMOfxWeuV0T.n7P9LzC7O8kHshSjV8n7h3k5K1q', 4, 'none', 1, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', '2023-01-01 00:00:00');

-- =======================================================================
-- 3. COURSE CATEGORIES TABLE DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) UNIQUE NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `image_url` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1611532736597'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Digital Twin', 'digital-twin', 'Virtual representations and sensor mapping frameworks.'),
(2, 'Industrial Robotics', 'industrial-robotics', 'PLC engineering, G-code, and smart assembly protocols.'),
(3, 'Smart Factory', 'smart-factory', 'Comprehensive TNE British Council global factory architecture pipelines.');

-- =======================================================================
-- 4. COURSES TABLE DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `courses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) UNIQUE NOT NULL,
    `headline` VARCHAR(255),
    `description` TEXT,
    `level` VARCHAR(50) DEFAULT 'Intermediate',
    `duration` VARCHAR(50),
    `price` DECIMAL(10, 2) DEFAULT 0.00,
    `thumbnail_url` VARCHAR(255),
    `instructor_id` INT,
    `category_id` INT,
    `is_published` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`instructor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`id`, `title`, `slug`, `headline`, `description`, `level`, `duration`, `price`, `thumbnail_url`, `instructor_id`, `category_id`, `is_published`) VALUES
(1, 'Introduction to Digital Twins & Smart Infrastructure', 'introduction-to-digital-twins-smart-infrastructure', 'Build a fully synchronized virtual twin of physical industrial assets', 'A comprehensive starter program structured by BCU investigators. Explores IoT data structures, visual asset geometry in CAD/CAM, and bridging real-time telemetry to Unity-based virtual mockups.', 'Beginner', '14 Hours', 49.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop', 2, 1, 1),
(2, 'Industrial Robotics, CNC Machining & PLC Programming', 'industrial-robotics-cnc-machining-plc-programming', 'Program complex assembly loops and smart manufacturing schedules', 'An advanced curriculum focusing on 6-axis arm programming, G-code Generation, ladder logic, Siemens S7-1200 setups, and real-time safety protocols in smart manufacturing layouts.', 'Advanced', '22 Hours', 89.00, 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&h=400&fit=crop', 2, 2, 1),
(3, 'Digital Manufacturing Academy Course 101', 'digital-manufacturing-academy-course-101', 'Comprehensive TNE British Council & BCU Certified Core Competency Curriculum', 'An expert-designed certification pathway covering the complete Industrial Evolution from Industry 4.0 to Industry 5.0 and emerging 6.0 cognitive networks. Gain practical skills in Parametric Generative Design, Additive Manufacturing workflows, bidirectionally synchronized Digital Twins, Cyber-Physical Systems (CPS), Industrial Data Analytics, Collaborative Robotics (Cobots), cybersecurity protocols, and Digital Maturity Readiness roadmaps.', 'Advanced', '36 Hours', 129.00, '/src/assets/images/digital_manufacture_cover_1780932805161.png', 2, 3, 1);

-- =======================================================================
-- 5. LESSONS TABLE DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `lessons` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id INT`,
    `section_title` VARCHAR(100) NOT NULL DEFAULT 'Core Curriculum',
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `content_url` TEXT NOT NULL,
    `rich_text_content` LONGTEXT NULL,
    `duration_minutes` INT DEFAULT 15,
    `sort_order` INT DEFAULT 0,
    `is_required` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lessons` (`course_id`, `section_title`, `title`, `type`, `content_url`, `rich_text_content`, `duration_minutes`, `sort_order`, `is_required`) VALUES
(1, 'Core Curriculum', 'Introduction to Cyber-Physical Systems (CPS)', 'video', 'https://www.w3schools.com/html/mov_bbb.mp4', NULL, 15, 1, 1),
(1, 'Core Curriculum', 'Digital Twins: Core Blueprint Document', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 35, 2, 1),
(1, 'Core Curriculum', 'Setting up sensor arrays with MQTT protocols', 'video', 'https://www.w3schools.com/html/movie.mp4', NULL, 22, 3, 1),
(1, 'Core Curriculum', 'Project Assignment: Simple Twin Definition', 'assignment', 'Submit a PDF specifying your chosen dual-system architecture.', NULL, 60, 4, 1),
(2, 'Core Curriculum', 'Introduction to Ladder Logic for PLC Modulators', 'video', 'https://www.w3schools.com/html/mov_bbb.mp4', NULL, 25, 1, 1),
(2, 'Core Curriculum', 'Industrial Robotic Arm Safety Zones and Guard Rails', 'video', 'https://www.w3schools.com/html/movie.mp4', NULL, 18, 2, 1),
(2, 'Core Curriculum', 'G-Code Optimization Reference Manual', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 45, 3, 1),
(3, 'Core Curriculum', 'Course Introduction: Digital Manufacturing Academy Overview', 'pptx', 'https://docs.google.com/presentation/d/1z7GJF7ZenxFnSfxBR7Da0lt3oec5ZtS0/embed', NULL, 10, 1, 1),
(3, 'Core Curriculum', 'Module 1 - PPTX 1: Course Roadmap & Learning Objectives', 'pptx', 'https://docs.google.com/presentation/d/1dKg-aGkpSGP2DlugfUh-gs2GmNDhWOTJ/embed', 'TNE Academic Collaboration: Course Roadmap. Co-developed under the British Council Going Global Partnerships Grant.', 15, 2, 1),
(3, 'Core Curriculum', 'Module 1 - PDF 1: Pre-assessment Questionnaire', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Before you dive into the syllabus, self-evaluate your baseline technical concepts across smart manufacturing:\n\n1. How familiar are you with the difference between a Digital Shadow and a Digital Twin?', 10, 3, 1),
(3, 'Core Curriculum', 'Module 1 - PDF 2: Glossary of Terms (Jargon-free list of core vocabulary)', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'DIGITAL TWIN (DT): A fully synchronized virtual mirror of a physical asset. CYBER-PHYSICAL SYSTEM (CPS): A network of physical machinery integrated with computer brains.', 15, 4, 1),
(3, 'Core Curriculum', 'Module 2: Advanced Design & Additive Manufacturing Workflows', 'pptx', 'https://docs.google.com/presentation/d/1dthMY3zBGlwl_bT6w8ZCrzz_VRABKoMR/embed', 'CAD, CAE, PDM, Parametric Design, Generative Design, AI-Assisted Tools, DfX optimization matrices, Topology Optimization, Additive Manufacturing classes.', 50, 5, 1),
(3, 'Core Curriculum', 'Module 3: Physics-Based Simulations & Bidirectional Digital Twins', 'pptx', 'https://docs.google.com/presentation/d/1dzzmkg0HseItZr8UUdNUQGq67yBMkJ5Z/embed', 'FEA, CFD, DEM simulations. Categorical Distinctions: Digital Model, Digital Shadow, and Digital Twin. Five-Layer ISO 23247 Architecture.', 55, 6, 1),
(3, 'Core Curriculum', 'Module 4: Big Data Platforms, Edge AI & Cybersecurity', 'pptx', 'https://docs.google.com/presentation/d/1kenUItVbwY8w9qxE6qQO3kgdL_h9YR8G/embed', 'Industrial Data Platforms (Siemens Amberg OEE, Bosch, Unilever metrics). Edge AI latency reduction. Cybersecurity OT mitigation pipelines (NotPetya, Toyota supplier downages).', 50, 7, 1),
(3, 'Core Curriculum', 'Module 5: Advanced Robotics, Collaborative Cobots & Dynamic Navigation', 'pptx', 'https://docs.google.com/presentation/d/1sw-bFGVhpqt0XgdTX825MVpDYdoSvVLi/embed', 'Cobot proximity engineering, Human-Robot Synergy, HRI standards. AGVs vs AMRs navigation mapping via LiDAR telemetry.', 45, 8, 1),
(3, 'Core Curriculum', 'Module 6: Strategic Roadmap Frameworks & Organizational Change', 'pptx', 'https://docs.google.com/presentation/d/1y8w7Pl4eH_ikhOr-AY_Nh-2C0MjNtRxN/embed', 'Five-Stage Transformation model. IMPULS online digital maturity profiling index. Greenfield vs Brownfield sensor retrofitting frameworks.', 50, 9, 1);

-- =======================================================================
-- 6. QUIZZES TABLE DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `quizzes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT,
    `title` VARCHAR(255) NOT NULL,
    `passing_score_percent` INT DEFAULT 80,
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quizzes` (`id`, `course_id`, `title`, `passing_score_percent`) VALUES
(1, 1, 'MQTT & Virtual Synchronicity Assessment', 80),
(2, 2, 'Ladder Logic & CNC G-Code Quiz', 75),
(3, 3, 'Digital Manufacturing Academy Course 101 Certification Quiz', 80);

-- =======================================================================
-- 7. QUIZ QUESTIONS TABLE (NATIVE JSON ATTRIBUTES MAPPED)
-- =======================================================================
CREATE TABLE `quiz_questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quiz_id` INT,
    `question` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `correct_option_index` INT NOT NULL,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quiz_questions` (`quiz_id`, `question`, `options`, `correct_option_index`) VALUES
(1, 'What constitutes the core function of a Digital Twin of a pump system?', '["To show photos of the pump in different angles", "Real-time physical asset simulation and parameter modeling via sensor feeds", "To calculate shipping times", "To provide offline print instruction leaflets only"]', 1),
(1, 'Which protocol is most widely used for sparse, high-frequency IoT data payloads?', '["HTTP POST", "MQTT / AMQP", "FTP", "SMTP"]', 1),
(2, 'What is the function of the G01 command in CNC programming?', '["Rapid travel position search", "Linear intervention feed interpolation", "Circular rotation interpolation", "Pause application for coolant induction"]', 1),
(3, 'What is the primary goal of digital manufacturing?', '["Expedite communication speed without mechanical change", "Increase manual labor ratios", "Improve process efficiency, product quality and manufacturing innovation", "Enhance localized software dependencies only"]', 2),
(3, 'Which industrial revolution introduced automation, PLCs, and computers into manufacturing?', '["Industry 1.0", "Industry 2.0", "Industry 3.0", "Industry 6.0"]', 2),
(3, 'Which statement best distinguishes a Cyber-Physical System (CPS) from a Digital Twin?', '["CPS is mainly a virtual graphic layout used in design", "CPS integrates sensing, controllers, and actuators to connect/control the physical world, whereas a Digital Twin models, analyzes, and predicts behavior based on live/historical data feeds", "CPS is strictly offline, while Digital Twins must run in space orbits", "CPS eliminates the requirement for secure network protocols"]', 1);

-- =======================================================================
-- 8. ASSIGNMENTS TABLE DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT,
    `title` VARCHAR(255) NOT NULL,
    `instructions` TEXT NOT NULL,
    `max_score` INT DEFAULT 100,
    `due_date` VARCHAR(50) NULL,
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `assignments` (`course_id`, `title`, `instructions`, `due_date`) VALUES
(1, 'Building an MQTT Broker Topology Diagram', 'Provide an architecture document or file showing the data flow from physical Raspberry Pi nodes to an Express endpoint and the final CAD visual canvas.', 'Within 7 days'),
(3, 'Project Assignment: Industrial Digital Maturity & Roadmap Formulation', 'Prepare an exhaustive Brownfield retrofitting plan or 5-stage transformation roadmap for an existing SME manufacturing floor.', 'Within 10 days');

-- =======================================================================
-- 9. COURSE ENROLLMENTS TABLE DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `enrollments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `course_id` INT,
    `progress_percent` INT DEFAULT 0,
    `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL,
    UNIQUE KEY `unique_user_course` (`user_id`, `course_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `progress_percent`, `enrolled_at`) VALUES
(1, 1, 1, 30, '2025-05-01 09:21:00'),
(2, 1, 3, 0, '2026-06-09 09:27:07');

-- =======================================================================
-- 10. LESSON_PROGRESS TRACKER DEFINITION & POPULATION
-- =======================================================================
CREATE TABLE `lesson_progress` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `enrollment_id` INT,
    `lesson_id` INT,
    `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_enrollment_lesson` (`enrollment_id`, `lesson_id`),
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lesson_progress` (`enrollment_id`, `lesson_id`) VALUES (1, 1);