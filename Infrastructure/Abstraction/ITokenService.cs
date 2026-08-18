using Entities;

namespace Infrastructure.Abstraction
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}