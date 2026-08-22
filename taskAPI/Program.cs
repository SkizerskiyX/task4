using Infrastructure;

using Microsoft.EntityFrameworkCore;

using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;

using Microsoft.IdentityModel.Tokens;

using Infrastructure.Abstraction;



var builder = WebApplication.CreateBuilder(args);



builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();



var cs = builder.Configuration.GetConnectionString("DefaultConnection")

    ?? throw new InvalidOperationException("Database connection string is not configured.");



builder.Services.AddDbContext<TaskDbContext>(o => o.UseNpgsql(cs));

builder.Services.AddScoped<IPasswordHashingService, PasswordHashingService>();

builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<IEmailService, SmtpEmailService>();



var jwt = builder.Configuration.GetSection("Jwt");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)

    .AddJwtBearer(o =>

    {

        o.TokenValidationParameters = new TokenValidationParameters

        {

            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],

            ValidAudience = jwt["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!))

        };

    });



builder.Services.AddAuthorization();



var app = builder.Build();



using (var scope = app.Services.CreateScope())

{

    scope.ServiceProvider.GetRequiredService<TaskDbContext>().Database.Migrate();

}



if (app.Environment.IsDevelopment())

    app.MapOpenApi();



app.UseDefaultFiles();

app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();

app.UseMiddleware<taskAPI.Controllers.UserStatusMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("index.html");



app.Run("http://0.0.0.0:5000");

