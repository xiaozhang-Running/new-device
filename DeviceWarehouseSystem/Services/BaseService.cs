using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using DeviceWarehouseSystem.Models;

namespace DeviceWarehouseSystem.Services
{
    /// <summary>
    /// 泛型基础服务类，提供通用的CRUD操作
    /// </summary>
    /// <typeparam name="TEntity">实体类型</typeparam>
    /// <typeparam name="TDTO">DTO类型</typeparam>
    /// <typeparam name="TCreateDTO">创建DTO类型</typeparam>
    /// <typeparam name="TUpdateDTO">更新DTO类型</typeparam>
    public abstract class BaseService<TEntity, TDTO, TCreateDTO, TUpdateDTO>
        where TEntity : class
        where TDTO : class
        where TCreateDTO : class
        where TUpdateDTO : class
    {
        protected readonly DeviceWarehouseContext _context;
        protected readonly DbSet<TEntity> _dbSet;

        protected BaseService(DeviceWarehouseContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<TEntity>();
        }

        #region 查询操作

        /// <summary>
        /// 获取所有记录
        /// </summary>
        public virtual async Task<List<TDTO>> GetAllAsync()
        {
            if (_dbSet == null)
            {
                return [];
            }

            try
            {
                var entities = await _dbSet.ToListAsync();
                return entities.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"获取{typeof(TEntity).Name}列表失败: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 根据ID获取单条记录
        /// </summary>
        public virtual async Task<TDTO?> GetByIdAsync(int id)
        {
            if (_dbSet == null)
            {
                return null;
            }

            try
            {
                var entity = await _dbSet.FindAsync(id);
                return entity != null ? MapToDTO(entity) : null;
            }
            catch (Exception ex)
            {
                throw new Exception($"获取{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 根据条件查询
        /// </summary>
        public virtual async Task<List<TDTO>> FindAsync(Expression<Func<TEntity, bool>> predicate)
        {
            if (_dbSet == null)
            {
                return [];
            }

            try
            {
                var entities = await _dbSet.Where(predicate).ToListAsync();
                return entities.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"查询{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 检查是否存在
        /// </summary>
        public virtual async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate)
        {
            if (_dbSet == null)
            {
                return false;
            }

            return await _dbSet.AnyAsync(predicate);
        }

        /// <summary>
        /// 获取记录数量
        /// </summary>
        public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null)
        {
            if (_dbSet == null)
            {
                return 0;
            }

            return predicate != null 
                ? await _dbSet.CountAsync(predicate)
                : await _dbSet.CountAsync();
        }

        #endregion

        #region 创建操作

        /// <summary>
        /// 创建新记录
        /// </summary>
        public virtual async Task<TDTO> CreateAsync(TCreateDTO dto)
        {
            if (_dbSet == null)
            {
                throw new Exception($"{typeof(TEntity).Name}数据表不存在");
            }

            try
            {
                var entity = MapToEntity(dto);
                _dbSet.Add(entity);
                await _context.SaveChangesAsync();
                return MapToDTO(entity);
            }
            catch (Exception ex)
            {
                throw new Exception($"创建{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 批量创建
        /// </summary>
        public virtual async Task<List<TDTO>> CreateBatchAsync(List<TCreateDTO> dtos)
        {
            if (_dbSet == null)
            {
                throw new Exception($"{typeof(TEntity).Name}数据表不存在");
            }

            try
            {
                var entities = dtos.Select(MapToEntity).ToList();
                _dbSet.AddRange(entities);
                await _context.SaveChangesAsync();
                return entities.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"批量创建{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        #endregion

        #region 更新操作

        /// <summary>
        /// 更新记录
        /// </summary>
        public virtual async Task<TDTO> UpdateAsync(int id, TUpdateDTO dto)
        {
            if (_dbSet == null)
            {
                throw new Exception($"{typeof(TEntity).Name}数据表不存在");
            }

            try
            {
                var entity = await _dbSet.FindAsync(id);
                if (entity == null)
                {
                    throw new Exception($"{typeof(TEntity).Name}不存在");
                }

                UpdateEntity(entity, dto);
                await _context.SaveChangesAsync();
                return MapToDTO(entity);
            }
            catch (Exception ex)
            {
                throw new Exception($"更新{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 批量更新
        /// </summary>
        public virtual async Task<int> UpdateBatchAsync(Expression<Func<TEntity, bool>> predicate, Action<TEntity> updateAction)
        {
            if (_dbSet == null)
            {
                return 0;
            }

            try
            {
                var entities = await _dbSet.Where(predicate).ToListAsync();
                foreach (var entity in entities)
                {
                    updateAction(entity);
                }
                return await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"批量更新{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        #endregion

        #region 删除操作

        /// <summary>
        /// 删除记录
        /// </summary>
        public virtual async Task DeleteAsync(int id)
        {
            if (_dbSet == null)
            {
                throw new Exception($"{typeof(TEntity).Name}数据表不存在");
            }

            try
            {
                var entity = await _dbSet.FindAsync(id);
                if (entity == null)
                {
                    throw new Exception($"{typeof(TEntity).Name}不存在");
                }

                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"删除{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 批量删除
        /// </summary>
        public virtual async Task<int> DeleteBatchAsync(Expression<Func<TEntity, bool>> predicate)
        {
            if (_dbSet == null)
            {
                return 0;
            }

            try
            {
                var entities = await _dbSet.Where(predicate).ToListAsync();
                _dbSet.RemoveRange(entities);
                return await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"批量删除{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 清空所有记录
        /// </summary>
        public virtual async Task ClearAllAsync()
        {
            if (_dbSet == null)
            {
                return;
            }

            try
            {
                var allEntities = await _dbSet.ToListAsync();
                _dbSet.RemoveRange(allEntities);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"清空{typeof(TEntity).Name}失败: {ex.Message}", ex);
            }
        }

        #endregion

        #region 抽象方法（子类必须实现）

        /// <summary>
        /// 将实体映射为DTO
        /// </summary>
        protected abstract TDTO MapToDTO(TEntity entity);

        /// <summary>
        /// 将创建DTO映射为实体
        /// </summary>
        protected abstract TEntity MapToEntity(TCreateDTO dto);

        /// <summary>
        /// 使用更新DTO更新实体
        /// </summary>
        protected abstract void UpdateEntity(TEntity entity, TUpdateDTO dto);

        #endregion

        #region 辅助方法

        /// <summary>
        /// 获取DbSet（供子类使用）
        /// </summary>
        protected DbSet<TEntity> GetDbSet() => _dbSet;

        /// <summary>
        /// 获取Context（供子类使用）
        /// </summary>
        protected DeviceWarehouseContext GetContext() => _context;

        /// <summary>
        /// 保存更改
        /// </summary>
        protected async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        #endregion
    }
}
