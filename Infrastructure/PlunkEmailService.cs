using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Infrastructure.Abstraction;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure
{
    public class PlunkEmailService : IEmailService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly ILogger<PlunkEmailService> _logger;

        public PlunkEmailService(
            HttpClient http,
            IConfiguration config,
            ILogger<PlunkEmailService> logger)
        {
            _http = http;
            _logger = logger;

            _apiKey = config["Plunk:ApiKey"]
                ?? throw new InvalidOperationException("Plunk:ApiKey is not configured.");
            _fromEmail = config["Plunk:FromEmail"] ?? "noreply@example.com";
            _fromName = config["Plunk:FromName"] ?? "User Management";
        }

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                var payload = new Dictionary<string, object>
                {
                    { "to", to },
                    { "from", _fromEmail },
                    { "subject", subject },
                    { "body", htmlBody }
                };

                var request = new HttpRequestMessage(HttpMethod.Post, "https://next-api.useplunk.com/v1/send")
                {
                    Content = JsonContent.Create(payload, options: new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    })
                };
                request.Headers.Add("Authorization", $"Bearer {_apiKey}");

                var response = await _http.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning(
                        "Plunk API returned {StatusCode}: {Body}",
                        response.StatusCode, body);
                }
                else
                {
                    _logger.LogInformation("Verification email sent to {Email}", to);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", to);
            }
        }
    }
}
