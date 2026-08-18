using Entities;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure
{
    public class PasswordHashingService : IPasswordHashingService
    {
        private readonly PasswordHasher<User> _hasher = new();

        public string HashPassword(User user, string password)
            => _hasher.HashPassword(user, password);

        public bool VerifyPassword(User user, string password)
        {
            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
            return result == PasswordVerificationResult.Success
                || result == PasswordVerificationResult.SuccessRehashNeeded;
        }
    }
}
