using Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure
{
    internal class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Name).IsRequired().HasMaxLength(100);

            builder.Property(u => u.Email).IsRequired().HasMaxLength(100);

            builder.Property(u => u.PasswordHash).IsRequired();

            builder.Property(u => u.CreatedAt).IsRequired();

            builder.Property(u => u.Status).IsRequired();

            builder.Property(u => u.UserVerificationToken).IsRequired(false);

            builder.HasIndex(u => u.Email).IsUnique();
        }
    }
}
