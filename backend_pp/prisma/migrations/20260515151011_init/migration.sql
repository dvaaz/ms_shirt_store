-- CreateTable
CREATE TABLE `endereco_de_entrega` (
    `endereco_uuid` CHAR(36) NOT NULL,
    `endereco_usuario_uuid` VARCHAR(36) NOT NULL,
    `endereco_uf` VARCHAR(45) NOT NULL,
    `endereco_municipio` VARCHAR(45) NOT NULL,
    `endereco_logradouro` VARCHAR(45) NOT NULL,
    `endereco_numero` INTEGER NOT NULL,
    `endereco_complemento` VARCHAR(45) NULL,
    `endereco_cep` VARCHAR(10) NOT NULL,
    `endereco_created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `endereco_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`endereco_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_pedido` (
    `item_pedido_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedido_uuid` CHAR(36) NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `item_pedido_nome_produto` VARCHAR(150) NOT NULL,
    `item_pedido_preco` INTEGER UNSIGNED NOT NULL,
    `item_pedido_total_preco` INTEGER UNSIGNED NOT NULL,
    `item_pedido_quantidade` INTEGER UNSIGNED NOT NULL,
    `item_pedido_created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `item_pedido_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `pedido_uuid`(`pedido_uuid`),
    PRIMARY KEY (`item_pedido_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodos_de_pagamento` (
    `metodos_de_pagamento_id` INTEGER NOT NULL AUTO_INCREMENT,
    `metodo_de_pagamento_nome` VARCHAR(45) NULL,

    PRIMARY KEY (`metodos_de_pagamento_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamento` (
    `pagamento_uuid` CHAR(36) NOT NULL,
    `pagamento_numero_parcelas` INTEGER UNSIGNED NULL,
    `pagamento_valor_primeira_parcela` INTEGER UNSIGNED NULL,
    `pagamento_valor_parcelas` INTEGER UNSIGNED NULL,
    `metodos_de_pagamento_id` INTEGER NOT NULL,
    `codigo_do_pagamento` VARCHAR(100) NOT NULL,
    `pedido_uuid` CHAR(36) NOT NULL,
    `status_pagamento_id` INTEGER NOT NULL,
    `pagamento_created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `pagamento_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `metodos_de_pagamento_id`(`metodos_de_pagamento_id`),
    INDEX `pedido_uuid`(`pedido_uuid`),
    INDEX `status_pagamento_id`(`status_pagamento_id`),
    PRIMARY KEY (`pagamento_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `pedido_uuid` CHAR(36) NOT NULL,
    `pedido_valor_total` INTEGER UNSIGNED NOT NULL,
    `usuario_uuid` CHAR(36) NOT NULL,
    `endereco_de_entrega_uuid` CHAR(36) NOT NULL,
    `status_pedido_id` INTEGER NOT NULL,
    `pedido_nome_destinatario` VARCHAR(150) NOT NULL,
    `pedido_created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `pedido_updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `endereco_de_entrega_uuid`(`endereco_de_entrega_uuid`),
    INDEX `status_pedido_id`(`status_pedido_id`),
    PRIMARY KEY (`pedido_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_pagamento` (
    `status_pagamento_id` INTEGER NOT NULL AUTO_INCREMENT,
    `status_pagamento_nome` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`status_pagamento_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_pedido` (
    `status_pedido_id` INTEGER NOT NULL AUTO_INCREMENT,
    `status_pedido_nome` VARCHAR(50) NULL,

    PRIMARY KEY (`status_pedido_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `item_pedido` ADD CONSTRAINT `fk_item_pedido` FOREIGN KEY (`pedido_uuid`) REFERENCES `pedido`(`pedido_uuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pagamento` ADD CONSTRAINT `fk_pagamento_metodo` FOREIGN KEY (`metodos_de_pagamento_id`) REFERENCES `metodos_de_pagamento`(`metodos_de_pagamento_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pagamento` ADD CONSTRAINT `fk_pagamento_pedido` FOREIGN KEY (`pedido_uuid`) REFERENCES `pedido`(`pedido_uuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pagamento` ADD CONSTRAINT `fk_pagamento_status` FOREIGN KEY (`status_pagamento_id`) REFERENCES `status_pagamento`(`status_pagamento_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `fk_pedido_endereco` FOREIGN KEY (`endereco_de_entrega_uuid`) REFERENCES `endereco_de_entrega`(`endereco_uuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `fk_pedido_status` FOREIGN KEY (`status_pedido_id`) REFERENCES `status_pedido`(`status_pedido_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
