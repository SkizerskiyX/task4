using System.Threading.Tasks;

namespace Infrastructure.Abstraction
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlBody);
    }
}
