-- AlterTable
ALTER TABLE `contacts` MODIFY `link_precedence` ENUM('Primary', 'Secondary') NOT NULL DEFAULT 'Primary';
