using Entities;
using Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taskAPI.Dto;

namespace taskAPI.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly TaskDbContext _db;

        public UsersController(TaskDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users
                .OrderByDescending(u => u.LastLogInAt)
                .Select(u => new UserListItemResponse
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    LastLogInAt = u.LastLogInAt,
                    CreatedAt = u.CreatedAt,
                    Status = u.Status.ToString()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("block")]
        public async Task<IActionResult> Block([FromBody] BatchUserActionRequest request)
        {
            if (request.UserIds is null || request.UserIds.Count == 0)
                return BadRequest(new { message = "No users selected." });

            var users = await _db.Users
                .Where(u => request.UserIds.Contains(u.Id))
                .ToListAsync();

            foreach (var user in users)
                user.Status = UserStatus.Blocked;

            await _db.SaveChangesAsync();

            return Ok(new { message = $"Blocked {users.Count} user(s)." });
        }

        [HttpPost("unblock")]
        public async Task<IActionResult> Unblock([FromBody] BatchUserActionRequest request)
        {
            if (request.UserIds is null || request.UserIds.Count == 0)
                return BadRequest(new { message = "No users selected." });

            var users = await _db.Users
                .Where(u => request.UserIds.Contains(u.Id) && u.Status == UserStatus.Blocked)
                .ToListAsync();

            foreach (var user in users)
                user.Status = UserStatus.Active;

            await _db.SaveChangesAsync();

            return Ok(new { message = $"Unblocked {users.Count} user(s)." });
        }

        [HttpPost("delete")]
        public async Task<IActionResult> Delete([FromBody] BatchUserActionRequest request)
        {
            if (request.UserIds is null || request.UserIds.Count == 0)
                return BadRequest(new { message = "No users selected." });

            var users = await _db.Users
                .Where(u => request.UserIds.Contains(u.Id))
                .ToListAsync();

            _db.Users.RemoveRange(users);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"Deleted {users.Count} user(s)." });
        }

        [HttpPost("delete-unverified")]
        public async Task<IActionResult> DeleteUnverified([FromBody] BatchUserActionRequest request)
        {
            if (request.UserIds is null || request.UserIds.Count == 0)
                return BadRequest(new { message = "No users selected." });

            var users = await _db.Users
                .Where(u => request.UserIds.Contains(u.Id) && u.Status == UserStatus.Unverified)
                .ToListAsync();

            _db.Users.RemoveRange(users);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"Deleted {users.Count} unverified user(s)." });
        }
    }
}