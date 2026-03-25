using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.DTOs;

namespace DeviceWarehouseSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<TokenDTO>> Login([FromBody] LoginDTO loginDTO)
        {
            try
            {
                Console.WriteLine($"Login attempt for user: {loginDTO.Username}");
                var token = await _authService.LoginAsync(loginDTO);
                Console.WriteLine($"Login successful for user: {loginDTO.Username}");
                return Ok(token);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login failed for user: {loginDTO.Username}, error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<UserDTO>> Register([FromBody] RegisterDTO registerDTO)
        {
            try
            {
                var user = await _authService.RegisterAsync(registerDTO);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}