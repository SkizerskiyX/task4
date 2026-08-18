using Entities;

namespace Infrastructure
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}