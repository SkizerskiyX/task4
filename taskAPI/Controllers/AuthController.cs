using Entities;
using Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using taskAPI.Dto;

namespace taskAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TaskDbContext _db;
        private readonly IPasswordHashingService _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            TaskDbContext db,
            IPasswordHashingService passwordHasher,
            ITokenService tokenService,
            ILogger<AuthController> logger)
        {
            _db = db;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name)
                || string.IsNullOrWhiteSpace(request.Email)
                || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Name, email and password are required." });
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = string.Empty,
                Status = UserStatus.Unverified,
                CreatedAt = DateTimeOffset.UtcNow,
                LastLogInAt = null,
                UserVerificationToken = Guid.NewGuid()
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _db.Users.Add(user);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23505")
            {
                return Conflict(new { message = "Email is already registered." });
            }

            _ = Task.Run(() =>
                _logger.LogInformation(
                    "Would send verification email to {Email} with token {Token}",
                    user.Email, user.UserVerificationToken));

            return Ok(new { message = "Registration successful. Please check your email to verify your account." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user is null || !_passwordHasher.VerifyPassword(user, request.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (user.Status == UserStatus.Blocked)
            {
                return Unauthorized(new { message = "This account is blocked." });
            }

            user.LastLogInAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);

            return Ok(new { token, status = user.Status.ToString() });
        }
    }
}