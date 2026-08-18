using System.Security.Claims;
using Entities;
using Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace taskAPI.Controllers
{
    public class UserStatusMiddleware
    {
        private readonly RequestDelegate _next;

        public UserStatusMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context, TaskDbContext db)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var claim = context.User.FindFirst(ClaimTypes.NameIdentifier) ?? context.User.FindFirst("sub");
                if (claim == null || !Guid.TryParse(claim.Value, out var userId))
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { message = "Bad token" });
                    return;
                }

                var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null || user.Status == UserStatus.Blocked)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { message = "Please log in again." });
                    return;
                }
            }

            await _next(context);
        }
    }
}
