namespace DeviceWarehouseSystem.DTOs
{
    public class UserDTO
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Role { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
    }

    public class LoginDTO
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }

    public class RegisterDTO
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }

    public class TokenDTO
    {
        public required string Token { get; set; }
        public required string Username { get; set; }
        public required string Role { get; set; }
        public int UserId { get; set; }
    }

    public class UpdateUserDTO
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
    }

    public class UpdateUserStatusDTO
    {
        public required bool IsActive { get; set; }
    }

    public class UpdateUserLockStatusDTO
    {
        public required bool IsLockedOut { get; set; }
    }
}