/*
  Warnings:

  - Added the required column `identifier` to the `tb_router` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_router` ADD COLUMN `identifier` VARCHAR(191) NOT NULL;
