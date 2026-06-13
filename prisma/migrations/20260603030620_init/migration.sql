/*
  Warnings:

  - You are about to drop the column `uptime_limit` on the `tb_hotspot_user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `tb_user` table. All the data in the column will be lost.
  - You are about to drop the column `r_id` on the `tb_user` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `tb_user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `updated_at` to the `tb_hotspot_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `tb_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tb_user` DROP FOREIGN KEY `tb_user_r_id_fkey`;

-- DropIndex
DROP INDEX `tb_user_name_r_id_key` ON `tb_user`;

-- DropIndex
DROP INDEX `tb_user_r_id_fkey` ON `tb_user`;

-- AlterTable
ALTER TABLE `tb_hotspot_user` DROP COLUMN `uptime_limit`,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `tb_user` DROP COLUMN `password`,
    DROP COLUMN `r_id`,
    ADD COLUMN `password_hash` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('ADMIN', 'MANAGER', 'STAFF') NOT NULL DEFAULT 'STAFF';
