/*
  Warnings:

  - You are about to drop the column `ageGroupId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `product` table. All the data in the column will be lost.
  - Added the required column `name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sale` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sheets` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleSheet` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Product_ageGroupId_idx` ON `product`;

-- DropIndex
DROP INDEX `Product_categoryId_idx` ON `product`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `addressId` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `call` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `city` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `cityId` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `delivery` VARCHAR(191) NOT NULL DEFAULT 'post',
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderState` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `orderStatus` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `post` VARCHAR(191) NOT NULL DEFAULT 'new-post',
    ADD COLUMN `surname` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `totalPrice` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `quantity` INTEGER NOT NULL,
    MODIFY `productId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `ageGroupId`,
    DROP COLUMN `categoryId`,
    ADD COLUMN `description` TEXT NOT NULL,
    ADD COLUMN `isLowQuantity` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isNew` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isSale` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `sale` INTEGER NOT NULL,
    ADD COLUMN `sheets` INTEGER NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL,
    ADD COLUMN `titleSheet` VARCHAR(191) NOT NULL,
    ADD COLUMN `video` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `store` ADD COLUMN `sale` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `MainBillboard` (
    `id` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MainBillboard_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgeGroupToProduct` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `ageGroupId` VARCHAR(191) NOT NULL,
    `ageGroupName` VARCHAR(191) NOT NULL DEFAULT '',

    INDEX `AgeGroupToProduct_productId_idx`(`productId`),
    INDEX `AgeGroupToProduct_ageGroupId_idx`(`ageGroupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriesToProduct` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `categoryName` VARCHAR(191) NOT NULL DEFAULT '',

    INDEX `CategoriesToProduct_productId_idx`(`productId`),
    INDEX `CategoriesToProduct_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RenameIndex
ALTER TABLE `agegroup` RENAME INDEX `ageGroup_storeId_idx` TO `AgeGroup_storeId_idx`;

-- RenameIndex
ALTER TABLE `publishing` RENAME INDEX `publishing_storeId_idx` TO `Publishing_storeId_idx`;
