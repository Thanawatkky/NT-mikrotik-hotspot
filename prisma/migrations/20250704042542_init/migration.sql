/*
  Warnings:

  - A unique constraint covering the columns `[name,r_id]` on the table `tb_user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `tb_user_name_key` ON `tb_user`;

-- CreateIndex
CREATE UNIQUE INDEX `tb_user_name_r_id_key` ON `tb_user`(`name`, `r_id`);
