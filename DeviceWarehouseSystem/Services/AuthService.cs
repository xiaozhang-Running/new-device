using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.DTOs;

namespace DeviceWarehouseSystem.Services
{
    public class AuthService
    {
        private readonly DeviceWarehouseContext _context;
        private readonly IConfiguration _configuration;
        private readonly LogService _logService;

        public AuthService(DeviceWarehouseContext context, IConfiguration configuration, LogService logService)
        {
            _context = context;
            _configuration = configuration;
            _logService = logService;
        }

        public async Task<TokenDTO> LoginAsync(LoginDTO loginDTO)
        {
            // 查找用户
            if (_context.Users == null)
            {
                throw new Exception("用户不存在");
            }
            var user = _context.Users.FirstOrDefault(u => u.Username == loginDTO.Username);
            if (user == null)
            {
                // 记录登录失败日志
                await _logService.LogUserActivityAsync(
                    0, 
                    "登录失败", 
                    $"用户 {loginDTO.Username} 登录失败：用户不存在",
                    loginDTO?.IpAddress,
                    loginDTO?.UserAgent
                );
                throw new Exception("用户不存在或密码错误");
            }

            // 检查用户是否被锁定
            if (user.IsLockedOut)
            {
                throw new Exception("账号已被锁定，请联系管理员");
            }

            // 检查用户是否激活
            if (!user.IsActive)
            {
                throw new Exception("账号未激活，请联系管理员");
            }

            // 验证密码
            bool isPasswordValid = VerifyPassword(loginDTO.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                // 增加登录失败次数
                user.FailedLoginAttempts = user.FailedLoginAttempts + 1;
                
                // 超过5次登录失败，锁定账号
                if (user.FailedLoginAttempts >= 5)
                {
                    user.IsLockedOut = true;
                    user.LockoutEnd = DateTime.Now.AddHours(1); // 锁定1小时
                    await _logService.LogUserActivityAsync(
                        user.Id, 
                        "账号锁定", 
                        $"用户 {loginDTO.Username} 因多次登录失败被锁定",
                        loginDTO?.IpAddress,
                        loginDTO?.UserAgent
                    );
                    throw new Exception("账号已被锁定，请1小时后再试");
                }
                
                // 记录登录失败日志
                await _logService.LogUserActivityAsync(
                    user.Id, 
                    "登录失败", 
                    $"用户 {loginDTO.Username} 登录失败：密码错误，失败次数：{user.FailedLoginAttempts}",
                    loginDTO?.IpAddress,
                    loginDTO?.UserAgent
                );
                
                _context.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                await _context.SaveChangesAsync();
                
                throw new Exception("用户不存在或密码错误");
            }

            // 登录成功，重置登录失败次数
            user.FailedLoginAttempts = 0;
            user.LastLoginAt = DateTime.Now;
            _context.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            await _context.SaveChangesAsync();

            // 记录登录成功日志
            await _logService.LogUserActivityAsync(
                user.Id, 
                "登录", 
                $"用户 {user.Username} 登录成功",
                loginDTO?.IpAddress,
                loginDTO?.UserAgent
            );

            // 生成token
            var token = GenerateJwtToken(user);

            return new TokenDTO
            {
                Token = token,
                Username = user.Username,
                Role = user.Role ?? "User",
                UserId = user.Id
            };
        }

        public async Task<UserDTO> RegisterAsync(RegisterDTO registerDTO)
        {
            // 检查用户名是否已存在
            if (_context.Users != null && _context.Users.Any(u => u.Username == registerDTO.Username))
            {
                throw new Exception("用户名已存在");
            }

            // 创建新用户
            var user = new User
            {
                Username = registerDTO.Username,
                PasswordHash = HashPassword(registerDTO.Password), // 加密密码
                Role = registerDTO.Role,
                Email = registerDTO.Email,
                FullName = registerDTO.FullName ?? registerDTO.Username, // 使用传入的FullName，如果为空则使用Username
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            if (_context.Users != null)
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // 记录注册日志
            await _logService.LogUserActivityAsync(
                user.Id, 
                "注册", 
                $"新用户 {user.Username} 注册成功，角色：{user.Role}",
                registerDTO?.IpAddress,
                registerDTO?.UserAgent
            );

            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                Email = user.Email,
                FullName = user.FullName
            };
        }

        // 密码加密
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        // 验证密码
        private bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var jwtKey = jwtSettings["Key"];
            
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT Key is not configured. Please set 'Jwt:Key' in appsettings.json or environment variables.");
            }
            
            if (jwtKey.Length < 32)
            {
                throw new InvalidOperationException("JWT Key must be at least 32 characters long for security purposes.");
            }
            
            var key = Encoding.UTF8.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, string.IsNullOrEmpty(user.Role) ? "用户" : user.Role),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["AccessTokenExpirationInMinutes"] ?? "120")),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<IEnumerable<UserDTO>> GetUsersAsync()
        {
            if (_context.Users == null)
            {
                throw new Exception("用户不存在");
            }
            var users = await _context.Users.ToListAsync();
            return users.Select(user => new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role ?? "User",
                Email = user.Email ?? "",
                FullName = user.FullName
            });
        }

        public async Task<UserDTO> GetUserAsync(int id)
        {
            if (_context.Users == null)
            {
                throw new Exception("用户不存在");
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return null;
            }
            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role ?? "User",
                Email = user.Email ?? "",
                FullName = user.FullName
            };
        }

        public async Task<UserDTO> UpdateUserAsync(int id, UpdateUserDTO updateUserDTO)
        {
            if (_context.Users == null)
            {
                throw new Exception("用户不存在");
            }
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(updateUserDTO.Username))
            {
                user.Username = updateUserDTO.Username;
            }
            if (!string.IsNullOrEmpty(updateUserDTO.Password))
            {
                user.PasswordHash = updateUserDTO.Password; // 实际项目中应该加密密码
            }
            if (!string.IsNullOrEmpty(updateUserDTO.Role))
            {
                user.Role = updateUserDTO.Role;
            }
            if (!string.IsNullOrEmpty(updateUserDTO.Email))
            {
                user.Email = updateUserDTO.Email;
            }
            if (!string.IsNullOrEmpty(updateUserDTO.FullName))
            {
                user.FullName = updateUserDTO.FullName;
            }

            user.UpdatedAt = DateTime.Now;
            _context.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            await _context.SaveChangesAsync();

            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role ?? "User",
                Email = user.Email ?? "",
                FullName = user.FullName
            };
        }

        public async Task DeleteUserAsync(int id)
        {
            if (_context.Users == null)
            {
                throw new Exception("用户不存在");
            }
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                throw new Exception("用户不存在");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<UserDTO> UpdateUserStatusAsync(int id, bool isActive)
        {
            if (_context.Users == null)
            {
                throw new Exception("用户不存在");
            }
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return null;
            }

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.Now;
            _context.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            await _context.SaveChangesAsync();

            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role ?? "User",
                Email = user.Email ?? "",
                FullName = user.FullName
            };
        }

        public async Task<UserDTO> UpdateUserLockStatusAsync(int id, bool isLockedOut)
        {
            if (_context.Users == null)
            {
                throw new Exception("用户不存在");
            }
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return null;
            }

            user.IsLockedOut = isLockedOut;
            user.UpdatedAt = DateTime.Now;
            _context.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            await _context.SaveChangesAsync();

            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role ?? "User",
                Email = user.Email ?? "",
                FullName = user.FullName
            };
        }
    }
}