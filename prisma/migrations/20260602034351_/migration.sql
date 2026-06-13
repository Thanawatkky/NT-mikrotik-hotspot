/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `tb_user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `tb_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `tb_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tb_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_router` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `tb_user` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `password_hash` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'STAFF',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `tb_refresh_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(500) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `device_info` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tb_refresh_token_token_key`(`token`),
    INDEX `tb_refresh_token_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_hotspot_user` (
    `hs_user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `profile` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `uptime_limit` INTEGER NULL,
    `expires_at` DATETIME(3) NULL,
    `r_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tb_hotspot_user_username_r_id_key`(`username`, `r_id`),
    PRIMARY KEY (`hs_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `tb_user_email_key` ON `tb_user`(`email`);

-- AddForeignKey
ALTER TABLE `tb_refresh_token` ADD CONSTRAINT `tb_refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `tb_user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_hotspot_user` ADD CONSTRAINT `tb_hotspot_user_r_id_fkey` FOREIGN KEY (`r_id`) REFERENCES `tb_router`(`r_id`) ON DELETE CASCADE ON UPDATE CASCADE;
