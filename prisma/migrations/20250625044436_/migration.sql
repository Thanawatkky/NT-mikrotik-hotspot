/*
  Warnings:

  - You are about to drop the column `ip4` on the `tb_router` table. All the data in the column will be lost.
  - You are about to drop the column `mac` on the `tb_router` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tb_router` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `tb_router` table. All the data in the column will be lost.
  - You are about to drop the `tb_zone` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ip` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `port_api` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `port_hst` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sitename` to the `tb_router` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tb_router` DROP FOREIGN KEY `tb_router_zone_fkey`;

-- DropIndex
DROP INDEX `tb_router_zone_fkey` ON `tb_router`;

-- AlterTable
ALTER TABLE `tb_router` DROP COLUMN `ip4`,
    DROP COLUMN `mac`,
    DROP COLUMN `name`,
    DROP COLUMN `zone`,
    ADD COLUMN `ip` VARCHAR(191) NOT NULL,
    ADD COLUMN `port_api` VARCHAR(191) NOT NULL,
    ADD COLUMN `port_hst` VARCHAR(191) NOT NULL,
    ADD COLUMN `sitename` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `tb_zone`;
