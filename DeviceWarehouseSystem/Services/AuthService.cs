using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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
                throw new Exception("用户不存在");
            }
            if (user.PasswordHash != loginDTO.Password)
            {
                // 记录登录失败日志
                await _logService.LogUserActivityAsync(
                    user.Id, 
                    "登录失败", 
                    $"用户 {loginDTO.Username} 登录失败：密码错误",
                    loginDTO.IpAddress,
                    loginDTO.UserAgent
                );
                throw new Exception("密码错误");
            }

            // 更新最后登录时间
            user.LastLoginAt = DateTime.Now;
            _context.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            await _context.SaveChangesAsync();

            // 记录登录成功日志
            await _logService.LogUserActivityAsync(
                user.Id, 
                "登录", 
                $"用户 {user.Username} 登录成功",
                loginDTO.IpAddress,
                loginDTO.UserAgent
            );

            // 生成token
            var token = GenerateJwtToken(user);

            return new TokenDTO
            {
                Token = token,
                Username = user.Username,
                Role = user.Role ?? "User"
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
                PasswordHash = registerDTO.Password, // 实际项目中应该加密密码
                Role = registerDTO.Role,
                Email = registerDTO.Email,
                FullName = registerDTO.Username, // 临时使用用户名作为全名
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
                registerDTO.IpAddress,
                registerDTO.UserAgent
            );

            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                Email = user.Email
            };
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
                new Claim(ClaimTypes.Role, user.Role ?? "User"),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpirationInMinutes"] ?? "120")),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}