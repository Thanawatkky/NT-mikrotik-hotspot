/*
  Warnings:

  - Added the required column `password` to the `tb_router` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `tb_router` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_router` ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;
