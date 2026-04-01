-- 插入角色数据
INSERT INTO Roles (Name, Description, IsActive, CreatedAt, UpdatedAt)
VALUES 
('系统管理员', '拥有所有权限', 1, GETDATE(), GETDATE()),
('仓库管理员', '拥有除仓库设置、用户管理、日志管理外的所有权限', 1, GETDATE(), GETDATE()),
('项目负责人', '拥有项目相关的权限', 1, GETDATE(), GETDATE()),
('财务人员', '拥有财务相关的权限', 1, GETDATE(), GETDATE()),
('普通用户', '只能查看看板与库存管理模块', 1, GETDATE(), GETDATE());

-- 插入权限数据
INSERT INTO Permissions (Name, Code, Description, CreatedAt, UpdatedAt)
VALUES 
('设备管理', 'device-management', '管理所有设备', GETDATE(), GETDATE()),
('耗材管理', 'consumable-management', '管理所有耗材', GETDATE(), GETDATE()),
('原材料管理', 'raw-material-management', '管理所有原材料', GETDATE(), GETDATE()),
('出入库管理', 'inoutbound-management', '管理出入库', GETDATE(), GETDATE()),
('项目出库管理', 'project-outbound-management', '管理项目出库', GETDATE(), GETDATE()),
('项目入库管理', 'project-inbound-management', '管理项目入库', GETDATE(), GETDATE()),
('仓库管理', 'warehouse-management', '管理仓库设置', GETDATE(), GETDATE()),
('用户管理', 'user-management', '管理用户', GETDATE(), GETDATE()),
('日志管理', 'log-management', '管理日志', GETDATE(), GETDATE()),
('看板查看', 'dashboard-view', '查看看板', GETDATE(), GETDATE());

-- 插入角色权限关联数据
-- 系统管理员：所有权限
INSERT INTO RolePermissions (RolesId, PermissionsId)
SELECT r.Id, p.Id
FROM Roles r, Permissions p
WHERE r.Name = '系统管理员';

-- 仓库管理员：除仓库设置、用户管理、日志管理外的所有权限
INSERT INTO RolePermissions (RolesId, PermissionsId)
SELECT r.Id, p.Id
FROM Roles r, Permissions p
WHERE r.Name = '仓库管理员' AND p.Code NOT IN ('warehouse-management', 'user-management', 'log-management');

-- 项目负责人：项目相关权限 + 设备、耗材、原材料管理
INSERT INTO RolePermissions (RolesId, PermissionsId)
SELECT r.Id, p.Id
FROM Roles r, Permissions p
WHERE r.Name = '项目负责人' AND p.Code IN ('device-management', 'consumable-management', 'raw-material-management', 'project-outbound-management', 'project-inbound-management');

-- 财务人员：设备、耗材、原材料管理 + 日志管理
INSERT INTO RolePermissions (RolesId, PermissionsId)
SELECT r.Id, p.Id
FROM Roles r, Permissions p
WHERE r.Name = '财务人员' AND p.Code IN ('device-management', 'consumable-management', 'raw-material-management', 'log-management');

-- 普通用户：看板查看 + 设备管理（库存管理）
INSERT INTO RolePermissions (RolesId, PermissionsId)
SELECT r.Id, p.Id
FROM Roles r, Permissions p
WHERE r.Name = '普通用户' AND p.Code IN ('dashboard-view', 'device-management');

-- 更新Users表中的角色名称，确保与Roles表中的名称一致
UPDATE Users
SET Role = '系统管理员'
WHERE Username = 'admin';
