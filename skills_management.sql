-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2025 at 02:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skills_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `competences`
--

CREATE TABLE `competences` (
  `id` int(11) NOT NULL,
  `nom_competence` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `competences`
--

INSERT INTO `competences` (`id`, `nom_competence`) VALUES
(13, 'Flutter'),
(17, 'Microsoft Word'),
(12, 'Node Js'),
(10, 'Python'),
(16, 'React Js'),
(15, 'Ruby ');

-- --------------------------------------------------------

--
-- Table structure for table `project_pv`
--

CREATE TABLE `project_pv` (
  `id` int(11) NOT NULL,
  `projet_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_pv`
--

INSERT INTO `project_pv` (`id`, `projet_id`, `file_name`, `file_path`, `upload_date`, `description`) VALUES
(1, 1, 'DSI-Guide PFE.pdf', 'uploads\\pv\\pv-1741013147705.pdf', '2025-03-03 14:45:47', 'PV pour Site E-commerce'),
(2, 1, 'DSI-Guide PFE (1).docx', 'uploads\\pv\\pv-1741013569937.docx', '2025-03-03 14:52:49', 'PV pour Site E-commerce'),
(3, 1, 'Gestion des stages.pdf', 'uploads\\pv\\pv-1741625922750.pdf', '2025-03-10 16:58:42', 'PV pour Site E-commerce');

-- --------------------------------------------------------

--
-- Table structure for table `projetmanagers`
--

CREATE TABLE `projetmanagers` (
  `id` int(11) NOT NULL,
  `projet_id` int(11) NOT NULL,
  `manager_cin` int(8) NOT NULL,
  `date_assignation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projetmanagers`
--

INSERT INTO `projetmanagers` (`id`, `projet_id`, `manager_cin`, `date_assignation`) VALUES
(3, 1, 5, '2025-02-16 17:06:40'),
(4, 6, 5, '2025-02-28 14:33:32'),
(5, 8, 5, '2025-03-10 16:55:07');

-- --------------------------------------------------------

--
-- Table structure for table `projets`
--

CREATE TABLE `projets` (
  `id` int(11) NOT NULL,
  `nom_projet` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `delai` date NOT NULL,
  `budget` decimal(10,2) NOT NULL,
  `statut` enum('en cours','terminé','annulé') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projets`
--

INSERT INTO `projets` (`id`, `nom_projet`, `description`, `delai`, `budget`, `statut`) VALUES
(1, 'Site E-commerce', 'Développement d\'un site de vente en ligne.', '2025-03-01', 5000.00, 'en cours'),
(2, 'Planification Stratégique 1', 'We need a web application for project management with React frontend, Node.js backend, \nand MySQL database. The project requires strong skills in:\n- React.js\n- Node.js\n- RESTful API design\n- Database optimization\n- Agile methodologies', '2025-06-15', 7000.00, 'en cours'),
(6, 'ahmed bejaoui', 'ahmed project', '2025-02-22', 222.00, 'terminé'),
(8, 'test test', 'this is just a test', '2025-02-28', 99999999.99, 'en cours');

-- --------------------------------------------------------

--
-- Table structure for table `projet_competence`
--

CREATE TABLE `projet_competence` (
  `projet_id` int(11) NOT NULL,
  `competence_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projet_competence`
--

INSERT INTO `projet_competence` (`projet_id`, `competence_id`) VALUES
(1, 12),
(1, 16),
(2, 12),
(2, 16),
(6, 10),
(6, 12),
(8, 10),
(8, 12),
(8, 16);

-- --------------------------------------------------------

--
-- Table structure for table `projet_users`
--

CREATE TABLE `projet_users` (
  `projet_id` int(11) NOT NULL,
  `user_cin` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projet_users`
--

INSERT INTO `projet_users` (`projet_id`, `user_cin`) VALUES
(1, 1),
(1, 4),
(6, 2),
(6, 3),
(8, 321654987);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `cin` int(8) NOT NULL,
  `poste` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `disponibilitee` tinyint(1) DEFAULT 1,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `num_tele` varchar(20) DEFAULT NULL,
  `role` enum('0','1','2') NOT NULL DEFAULT '2',
  `nom` varchar(255) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`cin`, `poste`, `experience`, `disponibilitee`, `email`, `password`, `num_tele`, `role`, `nom`, `imageUrl`) VALUES
(1, 'web developer', NULL, 0, 'test1@gmail.com', '$2a$10$sLQvNahC/oMxH23xIqMb9OsQZlY/8pWw0AvUuqreLYT3LA36iQdFa', NULL, '2', 'test 1', NULL),
(2, 'web developer', NULL, 0, 'test2@gmail.com', '$2a$10$NdcQPLX1EdxUsyW2tMbDLO9.luw9zCA2zyISVI2vvp2za4iDZCtjy', NULL, '2', 'test2', '/uploads/profiles/profile-2-1740486635463-788805822.jpg'),
(3, 'web developer', NULL, 0, 'test3@gmail.com', '$2a$10$HG3oxkhLrNdNKLI8oqwCq.LtGC9ereRsxpx9dgBx5eng.kHx/T41q', NULL, '2', 'test3', NULL),
(4, 'web developer', NULL, 0, 'test4@gmail.com', '$2a$10$v8aYImBBIrlCmU3USP/w7OqTJIgvSZApypRIszVNPUBCj8aa4AdOi', NULL, '2', 'test4', NULL),
(5, 'manager', NULL, 1, 'Manager@gmail.com', '$2a$10$iRlJA3HDmsq3YD/53o6you3rhNmI0L5ObkLxVQVfBaG9fD.AcS84K', NULL, '1', 'Manager', NULL),
(14521465, 'web developer', NULL, 1, 'hama@gmail.com', '$2a$10$NokOVik8RRwReHbyNI/AseolzyNmUe75s38Wzrbslt.3RqrmZAKDG', NULL, '0', 'hama hama', ''),
(321654987, 'web developer', NULL, 0, 'bejaouiam25@gmail.com', '$2a$10$Ix974ZQl.Xv3iqLPwbW1IubTvgP7kiL.qli61uU24.E/lavKhNxai', '90640476', '2', 'ahmed bejaoui', '/uploads/profiles/profile-321654987-1739896811620-336386205.png');

-- --------------------------------------------------------

--
-- Table structure for table `user_competencies`
--

CREATE TABLE `user_competencies` (
  `user_cin` int(8) NOT NULL,
  `competence_name` varchar(255) NOT NULL,
  `proficiency_level` enum('Beginner','Intermediate','Advanced','Expert') DEFAULT 'Beginner',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_competencies`
--

INSERT INTO `user_competencies` (`user_cin`, `competence_name`, `proficiency_level`, `created_at`) VALUES
(1, 'Java', 'Advanced', '2025-02-16 17:08:14'),
(1, 'JavaScript ', 'Intermediate', '2025-02-16 17:07:54'),
(1, 'MongoDB', 'Intermediate', '2025-02-16 17:09:06'),
(1, 'MySQL', 'Expert', '2025-02-16 17:08:39'),
(1, 'Python ', 'Advanced', '2025-02-16 17:07:43'),
(1, 'SQLite', 'Advanced', '2025-02-16 17:08:56'),
(2, 'AWS', 'Advanced', '2025-02-16 17:09:55'),
(2, 'C++ ', 'Intermediate', '2025-02-16 17:11:34'),
(2, 'Docker', 'Intermediate', '2025-02-16 17:10:12'),
(2, 'Express.js', 'Advanced', '2025-02-16 17:09:43'),
(2, 'Flutter', 'Advanced', '2025-02-16 17:10:31'),
(2, 'JavaScript ', 'Advanced', '2025-02-16 17:11:09'),
(2, 'Kotlin ', 'Intermediate', '2025-02-16 17:10:25'),
(2, 'Node Js', 'Advanced', '2025-02-16 17:11:40'),
(2, 'PHP ', 'Advanced', '2025-02-16 17:10:42'),
(2, 'React Js', 'Advanced', '2025-02-16 17:11:16'),
(3, 'Big Data', 'Intermediate', '2025-02-16 17:13:30'),
(3, 'Flask', 'Intermediate', '2025-02-16 17:13:25'),
(3, 'Machin Learning', 'Beginner', '2025-02-16 17:13:47'),
(3, 'Node Js', 'Intermediate', '2025-02-16 17:12:55'),
(3, 'PHP', 'Advanced', '2025-02-16 17:13:57'),
(3, 'Python', 'Advanced', '2025-02-16 17:13:06'),
(3, 'React Js', 'Intermediate', '2025-02-16 17:13:00'),
(4, 'Adobe XD', 'Intermediate', '2025-02-16 17:15:52'),
(4, 'Angular', 'Beginner', '2025-02-16 17:17:27'),
(4, 'Figma ', 'Expert', '2025-02-16 17:15:36'),
(4, 'Framer ', 'Advanced', '2025-02-16 17:16:03'),
(4, 'Framer Motion', 'Intermediate', '2025-02-16 17:16:18'),
(4, 'JavaScript', 'Advanced', '2025-02-16 17:16:38'),
(4, 'React Js', 'Beginner', '2025-02-16 17:16:23'),
(4, 'Three.js', 'Advanced', '2025-02-16 17:16:54'),
(4, 'Vue.js', 'Advanced', '2025-02-16 17:17:13'),
(321654987, 'React Js', 'Advanced', '2025-02-18 16:40:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `competences`
--
ALTER TABLE `competences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom_competence` (`nom_competence`);

--
-- Indexes for table `project_pv`
--
ALTER TABLE `project_pv`
  ADD PRIMARY KEY (`id`),
  ADD KEY `projet_id` (`projet_id`);

--
-- Indexes for table `projetmanagers`
--
ALTER TABLE `projetmanagers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_project_manager` (`projet_id`,`manager_cin`),
  ADD KEY `manager_cin` (`manager_cin`);

--
-- Indexes for table `projets`
--
ALTER TABLE `projets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projet_competence`
--
ALTER TABLE `projet_competence`
  ADD PRIMARY KEY (`projet_id`,`competence_id`),
  ADD KEY `fk_competence` (`competence_id`);

--
-- Indexes for table `projet_users`
--
ALTER TABLE `projet_users`
  ADD PRIMARY KEY (`projet_id`,`user_cin`),
  ADD UNIQUE KEY `projet_id` (`projet_id`,`user_cin`),
  ADD KEY `user_cin` (`user_cin`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`cin`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_competencies`
--
ALTER TABLE `user_competencies`
  ADD PRIMARY KEY (`user_cin`,`competence_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `competences`
--
ALTER TABLE `competences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `project_pv`
--
ALTER TABLE `project_pv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `projetmanagers`
--
ALTER TABLE `projetmanagers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `projets`
--
ALTER TABLE `projets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `project_pv`
--
ALTER TABLE `project_pv`
  ADD CONSTRAINT `project_pv_ibfk_1` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projetmanagers`
--
ALTER TABLE `projetmanagers`
  ADD CONSTRAINT `projetmanagers_ibfk_1` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projetmanagers_ibfk_2` FOREIGN KEY (`manager_cin`) REFERENCES `users` (`cin`) ON DELETE CASCADE;

--
-- Constraints for table `projet_competence`
--
ALTER TABLE `projet_competence`
  ADD CONSTRAINT `fk_competence` FOREIGN KEY (`competence_id`) REFERENCES `competences` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_projet` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projet_users`
--
ALTER TABLE `projet_users`
  ADD CONSTRAINT `projet_users_ibfk_1` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projet_users_ibfk_2` FOREIGN KEY (`user_cin`) REFERENCES `users` (`cin`) ON DELETE CASCADE;

--
-- Constraints for table `user_competencies`
--
ALTER TABLE `user_competencies`
  ADD CONSTRAINT `user_competencies_ibfk_1` FOREIGN KEY (`user_cin`) REFERENCES `users` (`cin`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
