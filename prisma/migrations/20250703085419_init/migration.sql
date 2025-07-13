-- DropForeignKey
ALTER TABLE `tb_user` DROP FOREIGN KEY `tb_user_r_id_fkey`;

-- DropIndex
DROP INDEX `tb_user_r_id_fkey` ON `tb_user`;

-- AddForeignKey
ALTER TABLE `tb_user` ADD CONSTRAINT `tb_user_r_id_fkey` FOREIGN KEY (`r_id`) REFERENCES `tb_router`(`r_id`) ON DELETE CASCADE ON UPDATE CASCADE;
