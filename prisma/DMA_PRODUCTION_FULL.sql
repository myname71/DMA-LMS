-- =======================================================================
-- DIGITAL MANUFACTURING ACADEMY — COMPLETE PRODUCTION DATABASE SCRIPT
-- Database Target : u858137765_DMA
-- Generated       : 2026-06-29
-- Instructions    : Run this entire file in Hostinger phpMyAdmin → SQL tab
--                   or via: mysql -u u858137765_DMA -p u858137765_DMA < DMA_PRODUCTION_FULL.sql
-- =======================================================================

CREATE DATABASE IF NOT EXISTS `u858137765_DMA`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `u858137765_DMA`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `lesson_progress`;
DROP TABLE IF EXISTS `quiz_attempts`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `quiz_questions`;
DROP TABLE IF EXISTS `quizzes`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `custom_roles`;
DROP TABLE IF EXISTS `invites`;
DROP TABLE IF EXISTS `theme_settings`;
DROP TABLE IF EXISTS `withdrawal_requests`;
DROP TABLE IF EXISTS `bank_accounts`;
DROP TABLE IF EXISTS `assignment_submissions`;
DROP TABLE IF EXISTS `cms_content`;
DROP TABLE IF EXISTS `learning_paths`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `media_items`;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. ROLES
-- =====================================================================
CREATE TABLE `roles` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(50)  UNIQUE NOT NULL,
  `description` TEXT,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'student',     'Standard academy student accessing course materials'),
(2, 'instructor',  'Faculty members authorized to upload curricula and build quizzes'),
(3, 'admin',       'Platform administrators managing user moderation and pipelines'),
(4, 'super_admin', 'Full platform directors handling high-level architecture allocations');

-- =====================================================================
-- 2. USERS
--    Passwords below use bcryptjs ($2b$) compatible with Node.js server.
--    All accounts: password = Dmamfg.2026
-- =====================================================================
CREATE TABLE `users` (
  `id`                INT AUTO_INCREMENT PRIMARY KEY,
  `name`              VARCHAR(255) NOT NULL,
  `email`             VARCHAR(255) UNIQUE NOT NULL,
  `password_hash`     VARCHAR(255) NOT NULL,
  `role_id`           INT,
  `avatar_url`        VARCHAR(512) DEFAULT '',
  `subscription_plan` VARCHAR(50)  DEFAULT 'none',
  `is_approved`       BOOLEAN DEFAULT TRUE,
  `suspended`         BOOLEAN DEFAULT FALSE,
  `bio`               TEXT,
  `specialization`    VARCHAR(255),
  `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL,
  INDEX `idx_email`   (`email`),
  INDEX `idx_role`    (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users`
  (`name`, `email`, `password_hash`, `role_id`, `subscription_plan`, `is_approved`, `suspended`, `avatar_url`, `created_at`)
VALUES
-- Super Admin (Pandora Tech) — primary owner
('Pandora Tech (Super Admin)',
 'pandoratecllc@gmail.com',
 '$2b$10$3fzX8CImm22JmQZiJ93tHOBHFdwcWcG2Har2XT8V29QeYVsnQ/Ebe',
 4, 'premium', 1, 0,
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
 '2023-01-01 00:00:00'),

-- Admin — digitalmfg.2026
('Digital Mfg Admin',
 'digitalmfg.2026@gmail.com',
 '$2b$10$rOpkGRrm2myZaxmta8C58eqU9PSCwehcn4L3v48.T.4nZ9vUyuqwe',
 3, 'premium', 1, 0,
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
 '2024-01-01 00:00:00'),

-- Instructor — Prof. Abdur Rahman
('Prof. Dr. Abdur Rahman (Instructor)',
 'instructor@digitalmanufacturing.academy',
 '$2b$10$N0b0ZBzDuKK0K/RgJjksnuixh2BZHYNpFEXPXwg2OI3di2FZIw/s.',
 2, 'none', 1, 0,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
 '2024-05-15 00:00:00'),

-- Demo student account
('Alex Rivera (Student)',
 'student@digitalmanufacturing.academy',
 '$2b$10$N0b0ZBzDuKK0K/RgJjksnuixh2BZHYNpFEXPXwg2OI3di2FZIw/s.',
 1, 'pro', 1, 0,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
 '2025-01-10 00:00:00'),

-- Demo admin account
('Sarah Connor (Admin)',
 'admin@digitalmanufacturing.academy',
 '$2b$10$ElMWqyvMAaK5vlRagjxRQecl7PdiEHGaOWx8/XX2PBn7B6wMbMBYm',
 3, 'none', 1, 0,
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
 '2024-01-01 00:00:00'),

-- Demo super_admin account
('Director James Smith (Super Admin)',
 'superadmin@digitalmanufacturing.academy',
 '$2b$10$N0b0ZBzDuKK0K/RgJjksnuixh2BZHYNpFEXPXwg2OI3di2FZIw/s.',
 4, 'none', 1, 0,
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
 '2023-01-01 00:00:00');

-- =====================================================================
-- 3. CATEGORIES
-- =====================================================================
CREATE TABLE `categories` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(100) UNIQUE NOT NULL,
  `slug`        VARCHAR(100) NOT NULL,
  `description` TEXT,
  `image_url`   VARCHAR(512) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Digital Twin',      'digital-twin',      'Virtual representations and sensor mapping frameworks.'),
(2, 'Industrial Robotics','industrial-robotics','PLC engineering, G-code, and smart assembly protocols.'),
(3, 'Smart Factory',     'smart-factory',     'Comprehensive TNE British Council global factory architecture pipelines.');

-- =====================================================================
-- 4. COURSES
-- =====================================================================
CREATE TABLE `courses` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `title`            VARCHAR(512) NOT NULL,
  `slug`             VARCHAR(512) UNIQUE NOT NULL,
  `headline`         VARCHAR(512),
  `description`      TEXT,
  `level`            VARCHAR(50) DEFAULT 'Intermediate',
  `duration`         VARCHAR(50),
  `price`            DECIMAL(10,2) DEFAULT 0.00,
  `thumbnail_url`    VARCHAR(512),
  `instructor_id`    INT,
  `category_id`      INT,
  `enrollment_count` INT DEFAULT 0,
  `rating_average`   DECIMAL(3,2) DEFAULT 0.00,
  `is_published`     BOOLEAN DEFAULT FALSE,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`instructor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`category_id`)  REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_instructor` (`instructor_id`),
  INDEX `idx_published`  (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- instructor_id = 3 → Prof. Dr. Abdur Rahman
INSERT INTO `courses`
  (`id`, `title`, `slug`, `headline`, `description`, `level`, `duration`, `price`,
   `thumbnail_url`, `instructor_id`, `category_id`, `enrollment_count`, `rating_average`, `is_published`)
VALUES
(1,
 'Introduction to Digital Twins & Smart Infrastructure',
 'introduction-to-digital-twins-smart-infrastructure',
 'Build a fully synchronized virtual twin of physical industrial assets',
 'A comprehensive starter program structured by BCU investigators. Explores IoT data structures, visual asset geometry in CAD/CAM, and bridging real-time telemetry to Unity-based virtual mockups.',
 'Beginner', '14 Hours', 49.00,
 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
 3, 1, 1620, 4.80, 1),

(2,
 'Industrial Robotics, CNC Machining & PLC Programming',
 'industrial-robotics-cnc-machining-plc-programming',
 'Program complex assembly loops and smart manufacturing schedules',
 'An advanced curriculum focusing on 6-axis arm programming, G-code Generation, ladder logic, Siemens S7-1200 setups, and real-time safety protocols in smart manufacturing layouts.',
 'Advanced', '22 Hours', 89.00,
 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&h=400&fit=crop',
 3, 2, 940, 4.70, 1),

(3,
 'Digital Manufacturing Academy Course 101',
 'digital-manufacturing-academy-course-101',
 'Comprehensive TNE British Council & BCU Certified Core Competency Curriculum',
 'An expert-designed certification pathway covering the complete Industrial Evolution from Industry 4.0 to Industry 5.0 and emerging 6.0 cognitive networks. Gain practical skills in Parametric Generative Design, Additive Manufacturing workflows, bidirectionally synchronized Digital Twins, Cyber-Physical Systems (CPS), Industrial Data Analytics, Collaborative Robotics (Cobots), cybersecurity protocols, and Digital Maturity Readiness roadmaps.',
 'Advanced', '36 Hours', 0.00,
 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
 3, 3, 3400, 4.90, 1);

-- =====================================================================
-- 5. LESSONS  (bug-fixed: `course_id` INT — not `` `course_id INT` ``)
-- =====================================================================
CREATE TABLE `lessons` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `course_id`        INT,
  `section_title`    VARCHAR(100) NOT NULL DEFAULT 'Core Curriculum',
  `title`            VARCHAR(512) NOT NULL,
  `type`             VARCHAR(50)  NOT NULL,
  `content_url`      TEXT NOT NULL,
  `rich_text_content` LONGTEXT,
  `duration_minutes` INT DEFAULT 15,
  `sort_order`       INT DEFAULT 0,
  `is_required`      BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lessons`
  (`course_id`, `section_title`, `title`, `type`, `content_url`, `rich_text_content`, `duration_minutes`, `sort_order`, `is_required`)
VALUES
-- Course 1: Digital Twins
(1,'Core Curriculum','Introduction to Cyber-Physical Systems (CPS)','video',
 'https://www.w3schools.com/html/mov_bbb.mp4', NULL, 15, 1, 1),
(1,'Core Curriculum','Digital Twins: Core Blueprint Document','pdf',
 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 35, 2, 1),
(1,'Core Curriculum','Setting up sensor arrays with MQTT protocols','video',
 'https://www.w3schools.com/html/movie.mp4', NULL, 22, 3, 1),
(1,'Core Curriculum','Project Assignment: Simple Twin Definition','assignment',
 'Submit a PDF specifying your chosen dual-system architecture.', NULL, 60, 4, 1),

-- Course 2: Industrial Robotics
(2,'Core Curriculum','Introduction to Ladder Logic for PLC Modulators','video',
 'https://www.w3schools.com/html/mov_bbb.mp4', NULL, 25, 1, 1),
(2,'Core Curriculum','Industrial Robotic Arm Safety Zones and Guard Rails','video',
 'https://www.w3schools.com/html/movie.mp4', NULL, 18, 2, 1),
(2,'Core Curriculum','G-Code Optimization Reference Manual','pdf',
 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 45, 3, 1),

-- Course 3: DMA 101
(3,'Core Curriculum','Course Introduction: Digital Manufacturing Academy Overview','pptx',
 'https://docs.google.com/presentation/d/1z7GJF7ZenxFnSfxBR7Da0lt3oec5ZtS0/embed?start=false&loop=false&delayms=3000',
 NULL, 10, 1, 1),

(3,'Core Curriculum','Module 1 - PPTX 1: Course Roadmap & Learning Objectives','pptx',
 'https://docs.google.com/presentation/d/1dKg-aGkpSGP2DlugfUh-gs2GmNDhWOTJ/embed?start=false&loop=false&delayms=3000',
 'TNE Academic Collaboration: Course Roadmap. Co-developed under the British Council Going Global Partnerships Grant by Birmingham City University (BCU) and AIUB Bangladesh. Faculty: Prof Javaid Butt, Md. Ashikul Alam Khan, Muhammad Adnan (BCU); Prof. Dr. Abdur Rahman (AIUB).',
 15, 2, 1),

(3,'Core Curriculum','Module 1 - PDF 1: Pre-assessment Questionnaire','pdf',
 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
 'Before you dive into the syllabus, self-evaluate your baseline technical concepts across smart manufacturing:\n\n1. How familiar are you with the difference between a Digital Shadow and a Digital Twin?\n   [ ] Unfamiliar (Only understand basic CAD models)\n   [ ] Basic (Understand one-way physical-to-digital sensor feed)\n   [ ] Advanced (Can design two-way automated command integrations)\n\n2. What is your experience level with industrial IoT protocols?\n   [ ] None\n   [ ] Basic (Know HTTP methods and server requests)\n   [ ] Intermediate (Have configured local MQTT, OPC-UA, or AMQP brokers)\n\n3. Do you have physical working experience with PLC controllers (e.g., Siemens S7-1200)?\n   [ ] Yes, I program Ladder Logic routinely\n   [ ] No, but I understand the theory of relays',
 10, 3, 1),

(3,'Core Curriculum','Module 1 - PDF 2: Glossary of Terms (Jargon-free list of core vocabulary)','pdf',
 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
 'JARGON-FREE GLOSSARY OF SMART FACTORY VOCABULARY\n\n- DIGITAL TWIN (DT): A fully synchronized virtual mirror of a physical asset. Unlike static CAD drawings, Digital Twins continuously receive live sensor streams AND send control feedback.\n\n- CYBER-PHYSICAL SYSTEM (CPS): A network of physical machinery integrated with computer brains and sensors to monitor, compute, and actuate processes.\n\n- INDUSTRIAL INTERNET OF THINGS (IIOT): The network of industrial machines equipped with smart telemetry tags connected via network brokers.\n\n- MQTT PROTOCOL: A lightweight publish-subscribe network protocol ideal for sending tiny telemetry data packets from remote machines to monitoring dashboards.\n\n- COBOT (COLLABORATIVE ROBOT): Special robots built with advanced force and proximity sensors designed to work safely beside human operators on assembly lines.\n\n- TOPOLOGY OPTIMISATION: An algorithm-driven CAD approach that removes redundant weight from an engineering part while keeping it fully structural.',
 15, 4, 1),

(3,'Core Curriculum','Module 2: Advanced Design & Additive Manufacturing Workflows','pptx',
 'https://docs.google.com/presentation/d/1dthMY3zBGlwl_bT6w8ZCrzz_VRABKoMR/embed?start=false&loop=false&delayms=3000',
 'MODULE 2: DESIGN & ADVANCED MANUFACTURING\n\nCORE DESIGN TECHNOLOGIES:\n- CAD (Computer-Aided Design): Enables precise 3D modelling and geometric definition.\n- CAE (Computer-Aided Engineering): Validates designs through advanced simulation and analysis.\n- PDM (Product Data Management): Ensures seamless collaboration and version control.\n\nPARAMETRIC, GENERATIVE & AI-ASSISTED DESIGN:\n- Parametric Design: Rule-based modelling that automatically updates geometry when parameters change.\n- Generative Design: Algorithm-driven exploration of thousands of design alternatives.\n- AI-Assisted Tools: Machine learning algorithms that predict performance and suggest improvements.\n\nADDITIVE MANUFACTURING CLASSES:\n- Powder Bed Fusion (PBF): Metal/polymer laser sintering.\n- Directed Energy Deposition (DED): Wire/powder feed for large-scale repair.\n- Binder Jetting: High-speed multi-material printing.\n- Material Extrusion (FDM): Thermoplastic layer deposition.',
 50, 5, 1),

(3,'Core Curriculum','Module 3: Physics-Based Simulations & Bidirectional Digital Twins','pptx',
 'https://docs.google.com/presentation/d/1dzzmkg0HseItZr8UUdNUQGq67yBMkJ5Z/embed?start=false&loop=false&delayms=3000',
 'MODULE 3: SIMULATIONS & DIGITAL TWINS\n\nPHYSICS-BASED SIMULATIONS:\n- Finite Element Analysis (FEA): Predicts structural behaviour under load to optimize durability.\n- Computational Fluid Dynamics (CFD): Models fluid flow and heat transfer inside manufacturing processes.\n- Discrete Element Method (DEM): Simulates granular materials and particle interactions.\n\nCATEGORICAL DISTINCTION:\n- DIGITAL MODEL: Physical and digital objects are decoupled. Data flow is asynchronous (manual).\n- DIGITAL SHADOW: Direct near real-time automated data flow from physical to digital (but NOT vice versa).\n- DIGITAL TWIN: Seamless, fully automated real-time bidirectional data flow between physical and digital objects.\n\nFIVE-LAYER ARCHITECTURE (ISO 23247):\n- PHYSICAL LAYER: CNCs, robots, sensors, operators.\n- DATA LAYER: logs, environmental inputs, records.\n- MODEL LAYER: CADs, FEAs, statistical and ML layers.\n- ANALYTICS LAYER: AI intelligence, prediction models.\n- APPLICATION LAYER: dashboards, alerts, maintenance.',
 55, 6, 1),

(3,'Core Curriculum','Module 4: Big Data Platforms, Edge AI & Cybersecurity','pptx',
 'https://docs.google.com/presentation/d/1kenUItVbwY8w9qxE6qQO3kgdL_h9YR8G/embed?start=false&loop=false&delayms=3000',
 'MODULE 4: DATA, AI & CYBERSECURITY IN MFG\n\nINDUSTRIAL DATA ANALYTICS:\nTreats factory data as a strategic asset. Includes machine sensors, PLCs, cycle times, and supply chain logistics.\n\nINDUSTRIAL DATA PLATFORMS EVIDENCE:\n- Siemens Amberg: 50+ million data points/day. Over 99.9% product quality, 75% process automation.\n- Bosch Connected Industry: Reduced unplanned downtime by 25% and improved OEE by 5-10%.\n- Unilever Smart Factories: 15-20% reduction in energy consumption, 10-15% production efficiency gains.\n\nAI APPLICATIONS IN ACTION:\n- General Electric: Predictive maintenance achieved 20% reduction in maintenance costs.\n- BMW: Computer vision quality checks achieved 30% faster inspection.\n- Caterpillar: ML analytics reduced unplanned downtime by 45%.\n\nCYBERSECURITY THREATS:\n- Ransomware (locks production, demands payout)\n- Malware infiltration of PLCs and SCADA\n- OT network breaches (NotPetya impacted Maersk, causing $300M loss)\n- Insider threats from misconfigured remote access',
 50, 7, 1),

(3,'Core Curriculum','Module 5: Advanced Robotics, Collaborative Cobots & Dynamic Navigation','pptx',
 'https://docs.google.com/presentation/d/1sw-bFGVhpqt0XgdTX825MVpDYdoSvVLi/embed?start=false&loop=false&delayms=3000',
 'MODULE 5: ADVANCED ROBOTICS & INTELLIGENT MFG\n\nCOLLABORATIVE ROBOTS (COBOTS):\n- Purpose-built to work safely alongside human operators.\n- Equipped with force-sensing and active proximity sensors.\n- Human-Robot Synergy: Combines human creativity with robotic precision.\n\nAUTONOMOUS ROBOTS — AMRs VS AGVs:\n- AGVs (Automated Guided Vehicles): Follow strict predefined routes using magnetic tape or tracks. Rigid routing.\n- AMRs (Autonomous Mobile Robots): Use LiDAR sensors, cameras, and AI to navigate dynamically and bypass obstacles.\n\nREAL-WORLD CASE STUDIES:\n- Unilever Khanpur Factory: IoT-based utility monitoring tracking real-time steam, water, and energy consumption.\n- Ford Cologne Assembly: Cobots alongside human operators, reducing physical strain and boosting output.',
 45, 8, 1),

(3,'Core Curriculum','Module 6: Strategic Roadmap Frameworks & Organizational Change','pptx',
 'https://docs.google.com/presentation/d/1y8w7Pl4eH_ikhOr-AY_Nh-2C0MjNtRxN/embed?start=false&loop=false&delayms=3000',
 'MODULE 6: STRATEGY, CHANGE & DIGITAL MATURITY\n\nFIVE-STAGE TRANSFORMATION MODEL:\n1. AWARENESS: Leadership digital vision workshops. Baseline benchmarking.\n2. CAPABILITY BUILDING: Targeted technical training. Pilot projects on limited production lines.\n3. INTEGRATION: Full-scale platform deployment. Legacy system modernization via APIs.\n4. OPTIMISATION: AI-driven continuous improvement. Smart supply chain integration.\n5. LEADERSHIP: Export of best-practice models. Cross-sector knowledge transfer.\n\nDIGITAL MATURITY ASSESSMENT:\n- IMPULS Online Index: 6-dimension benchmarking (Smart Factory, Operations, Strategy, Employees, Products, IT).\n- EFQM Excellence Model: European framework for organizational performance.\n\nGREENFIELD VS BROWNFIELD:\n- Greenfield: New facility design from scratch — full IoT and digital twin integration from day 1.\n- Brownfield: Retrofitting existing legacy factories with sensors, gateways, and cloud connectivity.',
 50, 9, 1);

-- =====================================================================
-- 6. QUIZZES
-- =====================================================================
CREATE TABLE `quizzes` (
  `id`                   INT AUTO_INCREMENT PRIMARY KEY,
  `course_id`            INT,
  `title`                VARCHAR(512) NOT NULL,
  `passing_score_percent` INT DEFAULT 80,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quizzes` (`id`, `course_id`, `title`, `passing_score_percent`) VALUES
(1, 1, 'MQTT & Virtual Synchronicity Assessment', 80),
(2, 2, 'Ladder Logic & CNC G-Code Quiz', 75),
(3, 3, 'Digital Manufacturing Academy Course 101 — Certification Quiz', 80);

-- =====================================================================
-- 7. QUIZ QUESTIONS
-- =====================================================================
CREATE TABLE `quiz_questions` (
  `id`                   INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id`              INT,
  `question`             TEXT NOT NULL,
  `options`              JSON NOT NULL,
  `correct_option_index` INT NOT NULL,
  `explanation`          TEXT,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `quiz_questions` (`quiz_id`, `question`, `options`, `correct_option_index`, `explanation`) VALUES
-- Quiz 1: Digital Twins
(1,
 'What constitutes the core function of a Digital Twin of a pump system?',
 '["To show photos of the pump in different angles","Real-time physical asset simulation and parameter modeling via sensor feeds","To calculate shipping times","To provide offline print instruction leaflets only"]',
 1, 'A Digital Twin continuously mirrors the physical asset in real time using sensor feeds for simulation and analysis.'),
(1,
 'Which protocol is most widely used for sparse, high-frequency IoT data payloads?',
 '["HTTP POST","MQTT / AMQP","FTP","SMTP"]',
 1, 'MQTT is a lightweight publish-subscribe protocol ideal for low-bandwidth, high-frequency telemetry from IoT devices.'),

-- Quiz 2: Industrial Robotics
(2,
 'What is the function of the G01 command in CNC programming?',
 '["Rapid travel position search","Linear intervention feed interpolation","Circular rotation interpolation","Pause application for coolant induction"]',
 1, 'G01 specifies linear interpolation movement at a controlled feed rate — the primary machining command.'),

-- Quiz 3: DMA 101
(3,
 'What is the primary goal of digital manufacturing?',
 '["Expedite communication speed without mechanical change","Increase manual labor ratios","Improve process efficiency, product quality and manufacturing innovation","Enhance localized software dependencies only"]',
 2, 'Digital manufacturing integrates data, automation, connectivity, and analytics to improve productivity, quality, and sustainability.'),
(3,
 'Which industrial revolution introduced automation, PLCs, and computers into manufacturing?',
 '["Industry 1.0","Industry 2.0","Industry 3.0","Industry 6.0"]',
 2, 'Industry 3.0 (1970s onward) introduced electronics, computers, and partial automation into production.'),
(3,
 'Which statement best distinguishes a Cyber-Physical System (CPS) from a Digital Twin?',
 '["CPS is mainly a virtual graphic layout used in design","CPS integrates sensing, controllers, and actuators to connect and control the physical world, whereas a Digital Twin models, analyzes, and predicts behavior based on live/historical data feeds","CPS is strictly offline, while Digital Twins must run in space orbits","CPS eliminates the requirement for secure network protocols"]',
 1, 'CPS is the physical-digital control infrastructure; a Digital Twin is the analytical/predictive model built on top of it.'),
(3,
 'Which industry era introduced Cyber-Physical Systems and smart connectivity?',
 '["Industry 2.0","Industry 3.0","Industry 4.0","Industry 5.0"]',
 2, 'Industry 4.0 is characterized by Cyber-Physical Systems, IoT, and smart connectivity between machines and humans.'),
(3,
 'Digital Manufacturing places humans and sustainability at the center of innovation.',
 '["True","False"]',
 0, 'Industry 5.0 explicitly focuses on human-technology partnership, sustainability, and resilience as the next evolution.');

-- =====================================================================
-- 8. ASSIGNMENTS
-- =====================================================================
CREATE TABLE `assignments` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `course_id`    INT,
  `title`        VARCHAR(512) NOT NULL,
  `instructions` TEXT NOT NULL,
  `max_score`    INT DEFAULT 100,
  `due_date`     VARCHAR(50),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `assignments` (`course_id`, `title`, `instructions`, `due_date`) VALUES
(1, 'Building an MQTT Broker Topology Diagram',
 'Provide an architecture document or file showing the data flow from physical Raspberry Pi nodes to an Express endpoint and the final CAD visual canvas.',
 'Within 7 days'),
(3, 'Project Assignment: Industrial Digital Maturity & Roadmap Formulation',
 'Prepare an exhaustive Brownfield retrofitting plan or 5-stage transformation roadmap for an existing SME manufacturing floor.',
 'Within 10 days');

-- =====================================================================
-- 9. ENROLLMENTS
-- =====================================================================
CREATE TABLE `enrollments` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`          INT,
  `course_id`        INT,
  `progress_percent` INT DEFAULT 0,
  `completed_lessons` JSON DEFAULT ('[]'),
  `quiz_attempts`    JSON DEFAULT ('{}'),
  `enrolled_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at`     TIMESTAMP NULL,
  UNIQUE KEY `unique_user_course` (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`)   ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_user`   (`user_id`),
  INDEX `idx_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo student (id=4) enrolled in courses 1 and 3
INSERT INTO `enrollments` (`user_id`, `course_id`, `progress_percent`, `enrolled_at`) VALUES
(4, 1, 30, '2025-05-01 09:21:00'),
(4, 3,  0, '2026-06-09 09:27:07');

-- =====================================================================
-- 10. LESSON PROGRESS
-- =====================================================================
CREATE TABLE `lesson_progress` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `enrollment_id` INT,
  `lesson_id`     INT,
  `completed_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_enrollment_lesson` (`enrollment_id`, `lesson_id`),
  FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`)     REFERENCES `lessons`(`id`)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lesson_progress` (`enrollment_id`, `lesson_id`) VALUES (1, 1);

-- =====================================================================
-- 11. QUIZ ATTEMPTS
-- =====================================================================
CREATE TABLE `quiz_attempts` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`      INT,
  `course_id`    INT,
  `quiz_id`      INT,
  `score`        DECIMAL(5,2),
  `passed`       BOOLEAN DEFAULT FALSE,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`)  REFERENCES `users`(`id`)  ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_quiz` (`user_id`, `quiz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 12. MESSAGES
-- =====================================================================
CREATE TABLE `messages` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `from_id`   INT,
  `to_id`     INT,
  `from_name` VARCHAR(255),
  `to_name`   VARCHAR(255),
  `from_role` VARCHAR(50),
  `subject`   VARCHAR(512),
  `body`      LONGTEXT NOT NULL,
  `is_read`   BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`from_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_id`)   REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_to`   (`to_id`),
  INDEX `idx_from` (`from_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 13. CERTIFICATES
-- =====================================================================
CREATE TABLE `certificates` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT,
  `course_id`  INT,
  `cert_id`    VARCHAR(100) UNIQUE NOT NULL,
  `issued_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`)  REFERENCES `users`(`id`)  ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 14. ASSIGNMENT SUBMISSIONS
-- =====================================================================
CREATE TABLE `assignment_submissions` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id`    INT,
  `course_id`        INT,
  `assignment_title` VARCHAR(512),
  `course_name`      VARCHAR(512),
  `student_id`       INT,
  `student_name`     VARCHAR(255),
  `text`             LONGTEXT,
  `file_url`         VARCHAR(512),
  `grade`            VARCHAR(50),
  `feedback`         TEXT,
  `submitted_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `graded_at`        TIMESTAMP NULL,
  UNIQUE KEY `unique_assignment_student` (`assignment_id`, `student_id`),
  FOREIGN KEY (`course_id`)   REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`)  REFERENCES `users`(`id`)   ON DELETE CASCADE,
  INDEX `idx_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 15. LEARNING PATHS
-- =====================================================================
CREATE TABLE `learning_paths` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `title`            VARCHAR(512) NOT NULL,
  `description`      TEXT,
  `category`         VARCHAR(100),
  `courses`          JSON DEFAULT ('[]'),
  `instructor_id`    INT,
  `instructor_name`  VARCHAR(255),
  `badge`            VARCHAR(255),
  `enrolled_students` JSON DEFAULT ('[]'),
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 16. EVENTS
-- =====================================================================
CREATE TABLE `events` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `title`     VARCHAR(512) NOT NULL,
  `date`      VARCHAR(50),
  `time`      VARCHAR(20) DEFAULT '10:00',
  `host`      VARCHAR(255),
  `type`      VARCHAR(100),
  `desc`      TEXT,
  `category`  VARCHAR(100),
  `attendees` JSON DEFAULT ('[]'),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 17. INVITES
-- =====================================================================
CREATE TABLE `invites` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `email`      VARCHAR(255) NOT NULL,
  `role`       VARCHAR(50)  NOT NULL,
  `token`      VARCHAR(255) UNIQUE NOT NULL,
  `status`     VARCHAR(50)  DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 18. CUSTOM ROLES
-- =====================================================================
CREATE TABLE `custom_roles` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(255) NOT NULL,
  `description` TEXT,
  `permissions` JSON DEFAULT ('[]'),
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 19. BANK ACCOUNTS (for instructor payouts)
-- =====================================================================
CREATE TABLE `bank_accounts` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `instructor_id`  INT UNIQUE,
  `bank_name`      VARCHAR(255) NOT NULL,
  `account_name`   VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `routing_code`   VARCHAR(100),
  `country`        VARCHAR(100),
  `added_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`instructor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 20. WITHDRAWAL REQUESTS
-- =====================================================================
CREATE TABLE `withdrawal_requests` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `instructor_id`   INT,
  `instructor_name` VARCHAR(255),
  `amount`          DECIMAL(10,2),
  `status`          VARCHAR(50) DEFAULT 'pending',
  `requested_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `processed_at`    TIMESTAMP NULL,
  FOREIGN KEY (`instructor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_instructor` (`instructor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 21. ACTIVITY LOGS
-- =====================================================================
CREATE TABLE `activity_logs` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `text`       TEXT NOT NULL,
  `type`       VARCHAR(100),
  `user_id`    INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 22. MEDIA ITEMS
-- =====================================================================
CREATE TABLE `media_items` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(512) NOT NULL,
  `data_url`    LONGTEXT,
  `type`        VARCHAR(100),
  `used_as`     VARCHAR(100),
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 23. CMS CONTENT
-- =====================================================================
CREATE TABLE `cms_content` (
  `id`         VARCHAR(20) PRIMARY KEY DEFAULT 'main',
  `pages`      JSON DEFAULT ('[]'),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cms_content` (`id`, `pages`) VALUES ('main', '[]');

-- =====================================================================
-- 24. THEME SETTINGS
-- =====================================================================
CREATE TABLE `theme_settings` (
  `id`         VARCHAR(20) PRIMARY KEY DEFAULT 'main',
  `settings`   JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `theme_settings` (`id`, `settings`) VALUES ('main', '{"primaryColor":"#2563eb","accentColor":"#06b6d4","darkMode":true}');

-- =====================================================================
-- VERIFICATION SUMMARY
-- =====================================================================
SELECT 'IMPORT COMPLETE' AS status;
SELECT COUNT(*) AS total_users        FROM users;
SELECT COUNT(*) AS total_courses      FROM courses;
SELECT COUNT(*) AS total_lessons      FROM lessons;
SELECT COUNT(*) AS total_quizzes      FROM quizzes;
SELECT COUNT(*) AS total_questions    FROM quiz_questions;
SELECT COUNT(*) AS total_enrollments  FROM enrollments;
SELECT COUNT(*) AS total_assignments  FROM assignments;
