-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jun 13, 2026 at 07:12 AM
-- Server version: 10.6.26-MariaDB-ubu2204
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_hotspot`
--

-- --------------------------------------------------------

--
-- Table structure for table `tb_hotspot_user`
--

CREATE TABLE `tb_hotspot_user` (
  `hs_user_id` int(11) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `profile` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `expires_at` datetime(3) DEFAULT NULL,
  `r_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_refresh_token`
--

CREATE TABLE `tb_refresh_token` (
  `id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `user_id` int(11) NOT NULL,
  `device_info` varchar(191) DEFAULT NULL,
  `ip_address` varchar(191) DEFAULT NULL,
  `isRevoked` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_router`
--

CREATE TABLE `tb_router` (
  `r_id` int(11) NOT NULL,
  `ip` varchar(191) NOT NULL,
  `port_api` varchar(191) NOT NULL,
  `port_hst` varchar(191) NOT NULL,
  `sitename` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_user`
--

CREATE TABLE `tb_user` (
  `user_id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `email` varchar(191) NOT NULL,
  `role` enum('ADMIN','MANAGER','STAFF') NOT NULL DEFAULT 'STAFF',
  `updated_at` datetime(3) NOT NULL,
  `password` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tb_user`
--

INSERT INTO `tb_user` (`user_id`, `name`, `description`, `created_at`, `email`, `role`, `updated_at`, `password`) VALUES
(3, 'Administrator', NULL, '2026-06-03 03:26:59.874', 'admin@nt.co.th', 'ADMIN', '2026-06-03 03:26:59.874', '$2b$10$8WltQHA8kKNHIDZRlmhcTuWgJd69.gzU6iypsM6U40NsEPVqGINaS');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('13d5edb0-b005-451b-975f-8fdf63e1eb08', '651579ad3b429a05879150ef8f0ca7216e3809daa10e2298c9da930a1638ffe8', '2026-06-03 03:07:00.325', '20260603030700_init', NULL, NULL, '2026-06-03 03:07:00.291', 1),
('16a0807e-a5bb-4c55-83bd-39c4b9338a46', 'bb1634fe9bed221dd8a203a20e25e317552b3e2fd426792eeaa1d8a16921d766', '2026-05-30 01:36:35.938', '20250704042542_init', NULL, NULL, '2026-05-30 01:36:35.877', 1),
('22735a19-8324-41f0-8f0a-5b10c658d703', 'b43c3c15211ea53d19c34a98ee1d3b6734a1a910876c2e833f6fcfbf77fcbd52', '2026-05-30 01:36:35.532', '20250625081506_', NULL, NULL, '2026-05-30 01:36:35.463', 1),
('24c7df41-33a2-4b45-8564-c7da128aae61', '1ffec2404a588790c6734b74f31536fef39cf9e0003e6ce1116ba33c66ecf2a1', '2026-05-30 01:36:35.691', '20250626021732_init', NULL, NULL, '2026-05-30 01:36:35.658', 1),
('2d96dbb2-2139-4d06-9b8b-3fadd5ecf58c', '37035d0ef0c077502181d3f604c1ab4bd3d84df99b42fac8871cef1e1d3e6d68', '2026-05-30 01:36:35.874', '20250703085419_init', NULL, NULL, '2026-05-30 01:36:35.774', 1),
('3228be6e-e550-4cf1-8d00-71c181fb1ec9', 'e715bca890ad3fd57a45fd7bc379924cda8766debafd0c51f243ce5a0d1e21cd', '2026-05-30 01:36:35.158', '20250613071418_add_hotspot_tables', NULL, NULL, '2026-05-30 01:36:34.970', 1),
('33bf357d-dfff-4d63-9958-5a4d1dbfa8a2', '0add3d7ca83b706fa0a390e69efd0e8a568e258d428c5f410b9aa692fcd18db6', '2026-05-30 01:36:35.313', '20250625044436_', NULL, NULL, '2026-05-30 01:36:35.161', 1),
('358af3dd-da1a-4822-9551-a930894f8298', 'f982500484871a704a6b84f5c3bcb0365e5ae8325a486b18e4d64c0cba7b55ed', '2026-05-30 01:36:35.387', '20250625061750_', NULL, NULL, '2026-05-30 01:36:35.320', 1),
('5379fcc5-1462-4826-9c70-588e721070b3', 'f78c9bd46c6877bf15baabac2ccffe652118b421eb2aeafc04c67e07966c7da6', '2026-06-02 03:43:51.330', '20260602034351_', NULL, NULL, '2026-06-02 03:43:51.071', 1),
('6a7e0ffb-111b-4ec6-ab7b-29bc05a9afd7', '03a04f4146bec9c419d5fcb19b414210051c526b9bcfe4f77c6bd03baf9532b9', '2026-05-30 01:36:35.655', '20250626021027_init', NULL, NULL, '2026-05-30 01:36:35.605', 1),
('712c1126-1c0b-4989-b6a8-1113328f9b01', '08ea16cb0dbe205422817069d318fd0b2be62936e09cfba4bb6d1c27e0870cdc', '2026-05-30 01:36:35.598', '20250625095509_init', NULL, NULL, '2026-05-30 01:36:35.537', 1),
('716bc61b-897e-43e8-855e-743a1b0d2c13', '651579ad3b429a05879150ef8f0ca7216e3809daa10e2298c9da930a1638ffe8', '2026-06-03 02:58:19.677', '20260603025819_init', NULL, NULL, '2026-06-03 02:58:19.643', 1),
('7b6f16b4-7113-4f8d-b5e9-6551ddb3f7e8', '92807f1794ba4f2d29848a7bc81905a0c308ae23a5ad1d6816248958b2142cde', '2026-05-30 01:36:35.457', '20250625062815_', NULL, NULL, '2026-05-30 01:36:35.393', 1),
('874c84d3-0fae-4490-aa9b-4831251123f1', '6069130bb538e514eefa3404c2ccfc46b215012be3815f5a8172dad0fa8fe5ec', '2026-06-03 03:06:20.871', '20260603030620_init', NULL, NULL, '2026-06-03 03:06:20.735', 1),
('8d105ec3-a112-4904-bae0-bb7d945522e4', '009ae68db39f9200cc49d27863422f8855208dfaeba3705c770609efafa6cb19', '2026-05-30 01:36:35.771', '20250703084348_init', NULL, NULL, '2026-05-30 01:36:35.734', 1),
('a5c319c6-21be-4910-9948-aaaaf5fe6782', 'c34ce58318991149bcf7c3bbf33b7d07f43ebf7d4677be3f8d1c9dcb4d7f92f4', '2026-05-30 01:36:35.731', '20250626071740_init', NULL, NULL, '2026-05-30 01:36:35.694', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tb_hotspot_user`
--
ALTER TABLE `tb_hotspot_user`
  ADD PRIMARY KEY (`hs_user_id`),
  ADD UNIQUE KEY `tb_hotspot_user_username_r_id_key` (`username`,`r_id`),
  ADD KEY `tb_hotspot_user_r_id_fkey` (`r_id`);

--
-- Indexes for table `tb_refresh_token`
--
ALTER TABLE `tb_refresh_token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tb_refresh_token_token_key` (`token`),
  ADD KEY `tb_refresh_token_user_id_idx` (`user_id`);

--
-- Indexes for table `tb_router`
--
ALTER TABLE `tb_router`
  ADD PRIMARY KEY (`r_id`);

--
-- Indexes for table `tb_user`
--
ALTER TABLE `tb_user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `tb_user_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tb_hotspot_user`
--
ALTER TABLE `tb_hotspot_user`
  MODIFY `hs_user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_refresh_token`
--
ALTER TABLE `tb_refresh_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_router`
--
ALTER TABLE `tb_router`
  MODIFY `r_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_user`
--
ALTER TABLE `tb_user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tb_hotspot_user`
--
ALTER TABLE `tb_hotspot_user`
  ADD CONSTRAINT `tb_hotspot_user_r_id_fkey` FOREIGN KEY (`r_id`) REFERENCES `tb_router` (`r_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tb_refresh_token`
--
ALTER TABLE `tb_refresh_token`
  ADD CONSTRAINT `tb_refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
