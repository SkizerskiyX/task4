using System.Threading.Tasks;

namespace Infrastructure.Abstraction
{
    /// <summary>
    /// Important: abstraction for sending emails.
    /// Note: implementations may use SMTP, REST API (e.g. Plunk), or any other provider.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Sends a transactional email asynchronously.
        /// Nota bene: callers should not block on this — fire-and-forget is acceptable.
        /// </summary>
        Task SendEmailAsync(string to, string subject, string htmlBody);
    }
}
