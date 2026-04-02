using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.DTOs;

namespace DeviceWarehouseSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AuthService _authService;

        public UserController(AuthService authService)
        {
            _authService = authService;
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            try
            {
                var users = await _authService.GetUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            try
            {
                var user = await _authService.GetUserAsync(id);
                if (user == null)
                {
                    return NotFound();
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<UserDTO>> CreateUser([FromBody] RegisterDTO registerDTO)
        {
            try
            {
                var user = await _authService.RegisterAsync(registerDTO);
                return CreatedAtAction("GetUser", new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/User/5
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDTO>> UpdateUser(int id, [FromBody] UpdateUserDTO updateUserDTO)
        {
            try
            {
                var user = await _authService.UpdateUserAsync(id, updateUserDTO);
                if (user == null)
                {
                    return NotFound();
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<ActionResult>
        DeleteUser(int id)
        {
            try
            {
                await _authService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/User/5/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult<UserDTO>> UpdateUserStatus(int id, [FromBody] UpdateUserStatusDTO updateUserStatusDTO)
        {
            try
            {
                var user = await _authService.UpdateUserStatusAsync(id, updateUserStatusDTO.IsActive);
                if (user == null)
                {
                    return NotFound();
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/User/5/lock
        [HttpPut("{id}/lock")]
        public async Task<ActionResult<UserDTO>> UpdateUserLockStatus(int id, [FromBody] UpdateUserLockStatusDTO updateUserLockStatusDTO)
        {
            try
            {
                var user = await _authService.UpdateUserLockStatusAsync(id, updateUserLockStatusDTO.IsLockedOut);
                if (user == null)
                {
                    return NotFound();
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}