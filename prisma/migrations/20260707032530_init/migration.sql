/*
  Warnings:

  - The primary key for the `tb_hotspot_user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `r_id` on the `tb_hotspot_user` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `tb_hotspot_user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(9))`.
  - The primary key for the `tb_refresh_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isRevoked` on the `tb_refresh_token` table. All the data in the column will be lost.
  - The primary key for the `tb_router` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `tb_router` table. All the data in the column will be lost.
  - You are about to drop the column `port_hst` on the `tb_router` table. All the data in the column will be lost.
  - You are about to drop the column `r_id` on the `tb_router` table. All the data in the column will be lost.
  - You are about to drop the column `sitename` on the `tb_router` table. All the data in the column will be lost.
  - You are about to alter the column `port_api` on the `tb_router` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `status` on the `tb_router` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Enum(EnumId(8))`.
  - The primary key for the `tb_user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `tb_user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tb_user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `tb_user` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `tb_user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(6))`.
  - A unique constraint covering the columns `[username,router_id]` on the table `tb_hotspot_user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `router_id` to the `tb_hotspot_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `tb_hotspot_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_encrypted` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `port_hotspot` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - The required column `router_id` was added to the `tb_router` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `site_name` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `display_name` to the `tb_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `tb_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tb_hotspot_user` DROP FOREIGN KEY `tb_hotspot_user_r_id_fkey`;

-- DropForeignKey
ALTER TABLE `tb_refresh_token` DROP FOREIGN KEY `tb_refresh_token_user_id_fkey`;

-- DropIndex
DROP INDEX `tb_hotspot_user_r_id_fkey` ON `tb_hotspot_user`;

-- DropIndex
DROP INDEX `tb_hotspot_user_username_r_id_key` ON `tb_hotspot_user`;

-- AlterTable
ALTER TABLE `tb_hotspot_user` DROP PRIMARY KEY,
    DROP COLUMN `r_id`,
    ADD COLUMN `activated_at` DATETIME(3) NULL,
    ADD COLUMN `created_by_id` VARCHAR(191) NULL,
    ADD COLUMN `router_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `tenant_id` VARCHAR(191) NOT NULL,
    MODIFY `hs_user_id` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    ADD PRIMARY KEY (`hs_user_id`);

-- AlterTable
ALTER TABLE `tb_refresh_token` DROP PRIMARY KEY,
    DROP COLUMN `isRevoked`,
    ADD COLUMN `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revoked_at` DATETIME(3) NULL,
    ADD COLUMN `user_agent` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `tb_router` DROP PRIMARY KEY,
    DROP COLUMN `password`,
    DROP COLUMN `port_hst`,
    DROP COLUMN `r_id`,
    DROP COLUMN `sitename`,
    ADD COLUMN `last_seen_at` DATETIME(3) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `password_encrypted` VARCHAR(191) NOT NULL,
    ADD COLUMN `port_hotspot` INTEGER NOT NULL,
    ADD COLUMN `router_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `site_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `tenant_id` VARCHAR(191) NOT NULL,
    MODIFY `port_api` INTEGER NOT NULL,
    MODIFY `status` ENUM('ONLINE', 'OFFLINE', 'MAINTENANCE') NOT NULL DEFAULT 'OFFLINE',
    ADD PRIMARY KEY (`router_id`);

-- AlterTable
ALTER TABLE `tb_user` DROP PRIMARY KEY,
    DROP COLUMN `description`,
    DROP COLUMN `name`,
    DROP COLUMN `password`,
    ADD COLUMN `avatar_url` VARCHAR(191) NULL,
    ADD COLUMN `created_by_id` VARCHAR(191) NULL,
    ADD COLUMN `display_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `first_name` VARCHAR(191) NULL,
    ADD COLUMN `last_login_at` DATETIME(3) NULL,
    ADD COLUMN `last_login_ip` VARCHAR(191) NULL,
    ADD COLUMN `last_name` VARCHAR(191) NULL,
    ADD COLUMN `password_hash` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `tenant_id` VARCHAR(191) NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('SUPER_ADMIN', 'TENANT_ADMIN', 'TENANT_MANAGER', 'TENANT_STAFF') NOT NULL DEFAULT 'TENANT_STAFF',
    ADD PRIMARY KEY (`user_id`);

-- CreateTable
CREATE TABLE `tb_plan` (
    `plan_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `mode` ENUM('FREE_WIFI', 'VOUCHER', 'BOTH') NOT NULL,
    `price_monthly` DECIMAL(10, 2) NULL,
    `price_yearly` DECIMAL(10, 2) NULL,
    `max_routers` INTEGER NOT NULL,
    `max_vouchers_month` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tb_plan_mode_is_active_idx`(`mode`, `is_active`),
    PRIMARY KEY (`plan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tenant` (
    `tenant_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('GOVERNMENT', 'STATE_ENTERPRISE', 'PRIVATE') NOT NULL,
    `mode` ENUM('FREE_WIFI', 'VOUCHER', 'BOTH') NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `contact_name` VARCHAR(191) NULL,
    `contact_email` VARCHAR(191) NULL,
    `contact_phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tb_tenant_slug_key`(`slug`),
    INDEX `tb_tenant_type_status_idx`(`type`, `status`),
    PRIMARY KEY (`tenant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_subscription` (
    `sub_id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `interval` ENUM('MONTHLY', 'YEARLY') NOT NULL,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `next_billing_at` DATETIME(3) NOT NULL,
    `price_snapshot` DECIMAL(10, 2) NOT NULL,
    `vouchers_used` INTEGER NOT NULL DEFAULT 0,
    `vouchers_reset_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tb_subscription_tenant_id_key`(`tenant_id`),
    INDEX `tb_subscription_end_at_idx`(`end_at`),
    INDEX `tb_subscription_next_billing_at_idx`(`next_billing_at`),
    PRIMARY KEY (`sub_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_payment` (
    `payment_id` VARCHAR(191) NOT NULL,
    `sub_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `interval` ENUM('MONTHLY', 'YEARLY') NOT NULL,
    `paid_at` DATETIME(3) NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tb_payment_sub_id_idx`(`sub_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_wifi_session` (
    `session_id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `router_id` VARCHAR(191) NOT NULL,
    `national_id_hash` VARCHAR(191) NOT NULL,
    `phone_encrypted` VARCHAR(191) NOT NULL,
    `mac_address` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `connected_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `disconnected_at` DATETIME(3) NULL,

    INDEX `tb_wifi_session_tenant_id_idx`(`tenant_id`),
    INDEX `tb_wifi_session_connected_at_idx`(`connected_at`),
    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `tb_hotspot_user_tenant_id_status_idx` ON `tb_hotspot_user`(`tenant_id`, `status`);

-- CreateIndex
CREATE INDEX `tb_hotspot_user_router_id_status_idx` ON `tb_hotspot_user`(`router_id`, `status`);

-- CreateIndex
CREATE INDEX `tb_hotspot_user_expires_at_idx` ON `tb_hotspot_user`(`expires_at`);

-- CreateIndex
CREATE UNIQUE INDEX `tb_hotspot_user_username_router_id_key` ON `tb_hotspot_user`(`username`, `router_id`);

-- CreateIndex
CREATE INDEX `tb_refresh_token_expires_at_idx` ON `tb_refresh_token`(`expires_at`);

-- CreateIndex
CREATE INDEX `tb_router_tenant_id_status_idx` ON `tb_router`(`tenant_id`, `status`);

-- CreateIndex
CREATE INDEX `tb_user_tenant_id_role_idx` ON `tb_user`(`tenant_id`, `role`);

-- CreateIndex
CREATE INDEX `tb_user_email_idx` ON `tb_user`(`email`);

-- AddForeignKey
ALTER TABLE `tb_subscription` ADD CONSTRAINT `tb_subscription_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tb_tenant`(`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_subscription` ADD CONSTRAINT `tb_subscription_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `tb_plan`(`plan_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_payment` ADD CONSTRAINT `tb_payment_sub_id_fkey` FOREIGN KEY (`sub_id`) REFERENCES `tb_subscription`(`sub_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_user` ADD CONSTRAINT `tb_user_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tb_tenant`(`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_user` ADD CONSTRAINT `tb_user_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `tb_user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_refresh_token` ADD CONSTRAINT `tb_refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `tb_user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_router` ADD CONSTRAINT `tb_router_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tb_tenant`(`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_hotspot_user` ADD CONSTRAINT `tb_hotspot_user_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tb_tenant`(`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_hotspot_user` ADD CONSTRAINT `tb_hotspot_user_router_id_fkey` FOREIGN KEY (`router_id`) REFERENCES `tb_router`(`router_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_wifi_session` ADD CONSTRAINT `tb_wifi_session_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tb_tenant`(`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_wifi_session` ADD CONSTRAINT `tb_wifi_session_router_id_fkey` FOREIGN KEY (`router_id`) REFERENCES `tb_router`(`router_id`) ON DELETE CASCADE ON UPDATE CASCADE;
