using MimeKit;
using MailKit.Net.Smtp;
using System.Threading.Tasks;
using Infrastructure.Abstraction;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                var smtpHost = _config["Smtp:Host"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_config["Smtp:Port"] ?? "587");
                var smtpUser = _config["Smtp:User"]
                    ?? throw new InvalidOperationException("Smtp:User is not configured.");
                var smtpPassword = _config["Smtp:Password"]
                    ?? throw new InvalidOperationException("Smtp:Password is not configured.");
                var fromEmail = _config["Smtp:FromEmail"] ?? smtpUser;
                var fromName = _config["Smtp:FromName"] ?? "User Management";

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                message.Body = new TextPart("html") { Text = htmlBody };

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(smtpUser, smtpPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent to {Email}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", to);
            }
        }
    }
}
