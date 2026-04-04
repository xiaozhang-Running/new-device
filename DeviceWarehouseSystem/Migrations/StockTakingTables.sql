-- 创建库存盘点表
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockTakings')
BEGIN
    CREATE TABLE [StockTakings] (
        [Id] int NOT NULL IDENTITY(1, 1),
        [StockTakingNo] nvarchar(max) NOT NULL,
        [StockTakingType] nvarchar(max) NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [StartTime] datetime2 NULL,
        [EndTime] datetime2 NULL,
        [Operator] nvarchar(max) NULL,
        [Remark] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_StockTakings] PRIMARY KEY ([Id])
    );
END

-- 创建库存盘点明细表
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockTakingItems')
BEGIN
    CREATE TABLE [StockTakingItems] (
        [Id] int NOT NULL IDENTITY(1, 1),
        [StockTakingId] int NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [ItemId] int NOT NULL,
        [ItemName] nvarchar(max) NOT NULL,
        [Brand] nvarchar(max) NULL,
        [Model] nvarchar(max) NULL,
        [SystemQuantity] int NOT NULL,
        [ActualQuantity] int NULL,
        [DifferenceQuantity] int NULL,
        [DifferenceReason] nvarchar(max) NULL,
        [Status] nvarchar(max) NOT NULL,
        [CheckTime] datetime2 NULL,
        [Unit] nvarchar(max) NULL,
        [Warehouse] nvarchar(max) NULL,
        [Location] nvarchar(max) NULL,
        CONSTRAINT [PK_StockTakingItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_StockTakingItems_StockTakings_StockTakingId] FOREIGN KEY ([StockTakingId]) REFERENCES [StockTakings]([Id]) ON DELETE CASCADE
    );

    -- 创建索引
    CREATE INDEX [IX_StockTakingItems_StockTakingId] ON [StockTakingItems]([StockTakingId]);
END

-- 添加迁移记录
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260404063252_AddStockTakingTables')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20260404063252_AddStockTakingTables', '8.0.0');
END
