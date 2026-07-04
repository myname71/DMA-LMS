-- =====================================================================
-- DMA App Tables for Hostinger MySQL (u858137765_DMA)
-- Run this in hPanel → phpMyAdmin → select u858137765_DMA → SQL tab
-- =====================================================================

USE `u858137765_DMA`;

-- App Users
CREATE TABLE IF NOT EXISTS `app_users` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'student',
  `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
  `suspended` TINYINT(1) NOT NULL DEFAULT 0,
  `subscription_plan` VARCHAR(50) NOT NULL DEFAULT 'free',
  `avatar` TEXT DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `specialization` VARCHAR(255) DEFAULT NULL,
  `joined_at` VARCHAR(50) DEFAULT NULL,
  `custom_role_id` VARCHAR(100) DEFAULT NULL,
  `qualification_doc` TEXT DEFAULT NULL,
  `badges` JSON DEFAULT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Courses
CREATE TABLE IF NOT EXISTS `app_courses` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(512) NOT NULL,
  `headline` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `level` VARCHAR(50) DEFAULT NULL,
  `duration` VARCHAR(50) DEFAULT NULL,
  `instructor_id` VARCHAR(100) DEFAULT NULL,
  `instructor_name` VARCHAR(255) DEFAULT NULL,
  `price` DOUBLE NOT NULL DEFAULT 0,
  `is_free` TINYINT(1) NOT NULL DEFAULT 1,
  `image` TEXT DEFAULT NULL,
  `lessons` JSON NOT NULL DEFAULT ('[]'),
  `quizzes` JSON NOT NULL DEFAULT ('[]'),
  `assignments` JSON NOT NULL DEFAULT ('[]'),
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `approval_status` VARCHAR(50) NOT NULL DEFAULT 'approved',
  `rejection_reason` TEXT DEFAULT NULL,
  `enrollment_count` INT NOT NULL DEFAULT 0,
  `rating_average` DOUBLE NOT NULL DEFAULT 0,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Enrollments
CREATE TABLE IF NOT EXISTS `app_enrollments` (
  `id` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(100) NOT NULL,
  `course_id` VARCHAR(100) NOT NULL,
  `progress` INT NOT NULL DEFAULT 0,
  `completed_lessons` JSON NOT NULL DEFAULT ('[]'),
  `quiz_attempts` JSON NOT NULL DEFAULT ('{}'),
  `enrolled_at` VARCHAR(50) DEFAULT NULL,
  `completed_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_enrollments_user_id_course_id_key` (`user_id`, `course_id`),
  KEY `app_enrollments_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Messages
CREATE TABLE IF NOT EXISTS `app_messages` (
  `id` VARCHAR(100) NOT NULL,
  `from_user_id` VARCHAR(100) DEFAULT NULL,
  `to_user_id` VARCHAR(100) DEFAULT NULL,
  `from_name` VARCHAR(255) DEFAULT NULL,
  `to_name` VARCHAR(255) DEFAULT NULL,
  `from_role` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(512) DEFAULT NULL,
  `body` LONGTEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_messages_to_user_id_idx` (`to_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Certificates
CREATE TABLE IF NOT EXISTS `app_certificates` (
  `id` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(100) NOT NULL,
  `course_id` VARCHAR(100) NOT NULL,
  `cert_id` VARCHAR(100) NOT NULL,
  `issued_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_certificates_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Logs
CREATE TABLE IF NOT EXISTS `app_logs` (
  `id` VARCHAR(100) NOT NULL,
  `text` TEXT NOT NULL,
  `type` VARCHAR(100) DEFAULT NULL,
  `user_id` VARCHAR(100) DEFAULT NULL,
  `time` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `app_logs_created_at_idx` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Invites
CREATE TABLE IF NOT EXISTS `app_invites` (
  `id` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `created_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_invites_token_key` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Custom Roles
CREATE TABLE IF NOT EXISTS `app_custom_roles` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `permissions` JSON NOT NULL DEFAULT ('[]'),
  `created_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Media Items
CREATE TABLE IF NOT EXISTS `app_media_items` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(512) NOT NULL,
  `data_url` LONGTEXT DEFAULT NULL,
  `type` VARCHAR(100) DEFAULT NULL,
  `used_as` VARCHAR(100) DEFAULT NULL,
  `uploaded_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Bank Accounts
CREATE TABLE IF NOT EXISTS `app_bank_accounts` (
  `id` VARCHAR(100) NOT NULL,
  `instructor_id` VARCHAR(100) NOT NULL,
  `bank_name` VARCHAR(255) NOT NULL,
  `account_name` VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `routing_code` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_bank_accounts_instructor_id_idx` (`instructor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Withdrawal Requests
CREATE TABLE IF NOT EXISTS `app_withdrawal_requests` (
  `id` VARCHAR(100) NOT NULL,
  `instructor_id` VARCHAR(100) NOT NULL,
  `instructor_name` VARCHAR(255) DEFAULT NULL,
  `amount` DOUBLE NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `created_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_withdrawal_requests_instructor_id_idx` (`instructor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Assignment Submissions
CREATE TABLE IF NOT EXISTS `app_assignment_submissions` (
  `id` VARCHAR(100) NOT NULL,
  `assignment_id` VARCHAR(100) DEFAULT NULL,
  `course_id` VARCHAR(100) DEFAULT NULL,
  `assignment_title` VARCHAR(512) DEFAULT NULL,
  `course_name` VARCHAR(512) DEFAULT NULL,
  `student_id` VARCHAR(100) DEFAULT NULL,
  `student_name` VARCHAR(255) DEFAULT NULL,
  `text` LONGTEXT NOT NULL,
  `file_url` TEXT DEFAULT NULL,
  `grade` VARCHAR(50) DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `submitted_at` VARCHAR(50) DEFAULT NULL,
  `graded_at` VARCHAR(50) DEFAULT NULL,
  `graded_by` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_assignment_submissions_course_id_idx` (`course_id`),
  KEY `app_assignment_submissions_student_id_idx` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Webinar Posts
CREATE TABLE IF NOT EXISTS `app_webinar_posts` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(512) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT NULL,
  `author_id` VARCHAR(100) DEFAULT NULL,
  `author_name` VARCHAR(255) DEFAULT NULL,
  `author_role` VARCHAR(50) DEFAULT NULL,
  `tags` JSON NOT NULL DEFAULT ('[]'),
  `created_at` VARCHAR(50) DEFAULT NULL,
  `pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `views` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Quiz Attempts
CREATE TABLE IF NOT EXISTS `app_quiz_attempts` (
  `id` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(100) NOT NULL,
  `course_id` VARCHAR(100) DEFAULT NULL,
  `quiz_id` VARCHAR(100) DEFAULT NULL,
  `score` DOUBLE NOT NULL,
  `passed` TINYINT(1) NOT NULL DEFAULT 0,
  `attempted_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_quiz_attempts_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Learning Paths
CREATE TABLE IF NOT EXISTS `app_learning_paths` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(512) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `courses` JSON NOT NULL DEFAULT ('[]'),
  `instructor_id` VARCHAR(100) DEFAULT NULL,
  `instructor_name` VARCHAR(255) DEFAULT NULL,
  `badge` VARCHAR(255) DEFAULT NULL,
  `enrolled_students` JSON NOT NULL DEFAULT ('[]'),
  `created_at` VARCHAR(50) DEFAULT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Events
CREATE TABLE IF NOT EXISTS `app_events` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(512) NOT NULL,
  `date` VARCHAR(50) DEFAULT NULL,
  `time` VARCHAR(20) DEFAULT NULL,
  `host` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(100) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `attendees` JSON NOT NULL DEFAULT ('[]'),
  `created_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App CMS Content
CREATE TABLE IF NOT EXISTS `app_cms_content` (
  `id` VARCHAR(20) NOT NULL DEFAULT 'main',
  `pages` JSON NOT NULL DEFAULT ('[]'),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Theme Settings
CREATE TABLE IF NOT EXISTS `app_theme_settings` (
  `id` VARCHAR(20) NOT NULL DEFAULT 'main',
  `data` JSON NOT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Certificate Templates
CREATE TABLE IF NOT EXISTS `app_cert_templates` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `style` VARCHAR(50) DEFAULT NULL,
  `primary_color` VARCHAR(20) DEFAULT NULL,
  `accent_color` VARCHAR(20) DEFAULT NULL,
  `header_text` VARCHAR(512) DEFAULT NULL,
  `footer_text` VARCHAR(512) DEFAULT NULL,
  `signature_label` VARCHAR(255) DEFAULT NULL,
  `logo_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `badge_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App Subscriptions
CREATE TABLE IF NOT EXISTS `app_subscriptions` (
  `id` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(100) NOT NULL,
  `plan` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `start_date` VARCHAR(50) DEFAULT NULL,
  `end_date` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `app_subscriptions_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Verify tables were created
-- =====================================================================
SELECT TABLE_NAME, TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'u858137765_DMA'
  AND TABLE_NAME LIKE 'app_%'
ORDER BY TABLE_NAME;
