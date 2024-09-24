-- AlterTable
ALTER TABLE `agegroup` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `descriptionSeo` TEXT NULL,
    ADD COLUMN `titleSeo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `descriptionSeo` TEXT NULL,
    ADD COLUMN `titleSeo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `invoiceId` VARCHAR(191) NULL,
    ADD COLUMN `massager` VARCHAR(191) NULL,
    ADD COLUMN `ttnumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `author` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `descriptionSeo` TEXT NULL,
    ADD COLUMN `isbn` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `seriaId` VARCHAR(191) NULL,
    ADD COLUMN `titleSeo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `publishing` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `descriptionSeo` TEXT NULL,
    ADD COLUMN `titleSeo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `store` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `descriptionSeo` TEXT NULL,
    ADD COLUMN `titleSeo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Seria` (
    `id` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `descriptionSeo` TEXT NULL,
    `titleSeo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Seria_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_Suggestions` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_Suggestions_AB_unique`(`A`, `B`),
    INDEX `_Suggestions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_seriaId_idx` ON `Product`(`seriaId`);
