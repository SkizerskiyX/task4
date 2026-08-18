using System;
using System.Collections.Generic;
using System.Text;
using Entities;

namespace Infrastructure
{
    public interface IPasswordHashingService
    {
        string HashPassword(User user, string password);
        bool VerifyPassword(User user, string password);
    }
}
