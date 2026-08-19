using Entities;
using Infrastructure;
using Infrastructure.Abstraction;
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
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _config;

        public AuthController(
            TaskDbContext db,
            IPasswordHashingService passwordHasher,
            ITokenService tokenService,
            IEmailService emailService,
            ILogger<AuthController> logger,
            IConfiguration config)
        {
            _db = db;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _emailService = emailService;
            _logger = logger;
            _config = config;
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

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = normalizedEmail,
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

            var publicBaseUrl = _config["App:PublicBaseUrl"]
    ?? throw new InvalidOperationException("App:PublicBaseUrl is not configured.");
            var verifyUrl = $"{publicBaseUrl}/verify.html?token={user.UserVerificationToken}";
            var emailSubject = "Verify your email — User Management";
            var emailBody = $"""
                <h2>Welcome, {user.Name}!</h2>
                <p>Click the link below to verify your email address:</p>
                <p><a href="{verifyUrl}">{verifyUrl}</a></p>
                <p>If you did not register, you can safely ignore this email.</p>
            """;

            _ = _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);

            return Ok(new { message = "Registration successful. Please check your email to verify your account." });
        }

        [HttpGet("verify")]
        public async Task<IActionResult> Verify([FromQuery] Guid token)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserVerificationToken == token);

            if (user is null)
            {
                return NotFound(new { message = "Invalid or already used verification link." });
            }

            if (user.Status == UserStatus.Unverified)
            {
                user.Status = UserStatus.Active;
            }

            user.UserVerificationToken = null;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Email verified successfully.", status = user.Status.ToString() });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

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