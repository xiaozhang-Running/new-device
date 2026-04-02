-- 检查 User 表的当前结构
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Users';

-- 检查 Id 列是否为自增
SELECT COLUMNPROPERTY(OBJECT_ID('Users'), 'Id', 'IsIdentity') AS IsIdentity;

-- 如果 Id 列不是自增，需要重新创建表
-- 首先删除外键约束（如果有）
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys
WHERE referenced_object_id = OBJECT_ID('Users');
EXEC sp_executesql @sql;

-- 删除唯一索引
DROP INDEX IF EXISTS IX_Users_Email ON Users;
DROP INDEX IF EXISTS IX_Users_Username ON Users;

-- 创建临时表
CREATE TABLE Users_Temp (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(450) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Email NVARCHAR(450) NULL,
    FullName NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    LastLoginAt DATETIME2 NULL,
    PasswordExpiryAt DATETIME2 NULL,
    FailedLoginAttempts INT NOT NULL DEFAULT 0,
    IsLockedOut BIT NOT NULL DEFAULT 0,
    LockoutEnd DATETIME2 NULL
);

-- 将数据从旧表复制到新表（跳过 Id 列，让自增生成）
SET IDENTITY_INSERT Users_Temp ON;

INSERT INTO Users_Temp (Id, Username, PasswordHash, Email, FullName, Role, IsActive, CreatedAt, UpdatedAt, LastLoginAt, PasswordExpiryAt, FailedLoginAttempts, IsLockedOut, LockoutEnd)
SELECT Id, Username, PasswordHash, Email, FullName, Role, IsActive, CreatedAt, UpdatedAt, LastLoginAt, PasswordExpiryAt, FailedLoginAttempts, IsLockedOut, LockoutEnd
FROM Users;

SET IDENTITY_INSERT Users_Temp OFF;

-- 删除旧表
DROP TABLE Users;

-- 重命名新表
EXEC sp_rename 'Users_Temp', 'Users';

-- 重新创建唯一索引
CREATE UNIQUE INDEX IX_Users_Email ON Users(Email) WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX IX_Users_Username ON Users(Username);

-- 验证结果
SELECT COLUMNPROPERTY(OBJECT_ID('Users'), 'Id', 'IsIdentity') AS IsIdentity;
