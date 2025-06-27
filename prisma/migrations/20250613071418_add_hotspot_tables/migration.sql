-- CreateTable
CREATE TABLE `tb_zone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subdistrict` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_router` (
    `r_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `ip4` VARCHAR(191) NOT NULL,
    `mac` VARCHAR(191) NOT NULL,
    `zone` INTEGER NOT NULL,

    PRIMARY KEY (`r_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `mac` VARCHAR(191) NOT NULL,
    `r_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_router` ADD CONSTRAINT `tb_router_zone_fkey` FOREIGN KEY (`zone`) REFERENCES `tb_zone`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_user` ADD CONSTRAINT `tb_user_r_id_fkey` FOREIGN KEY (`r_id`) REFERENCES `tb_router`(`r_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
