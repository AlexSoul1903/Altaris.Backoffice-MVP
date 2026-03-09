using Altairis.Application.Interfaces;
using Altairis.Application.Services;
using Altairis.Domain.Interfaces;
using Altairis.Infrastructure.Authentication;
using Altairis.Infrastructure.Persistence;
using Altairis.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURACIÓN DE CONTROLADORES (Evitar bucles infinitos en JSON)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 2. CONFIGURACIÓN DE CORS (Permitir acceso desde el Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextjs", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // El puerto del contenedor Next.js
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Necesario para Auth y Cookies
    });
});

// 3. CONFIGURACIÓN DE JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddScoped<IJwtProvider, JwtProvider>();

// 4. SWAGGER CON SOPORTE PARA BEARER TOKEN
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Altairis API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Escribe: 'Bearer' [espacio] y luego tu token."
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// 5. BASE DE DATOS (PostgreSQL para Docker)
builder.Services.AddDbContext<AltairisDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 6. INYECCIÓN DE DEPENDENCIAS (Repositorios y Servicios)
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IHotelService, HotelService>();
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// 7. MIGRACIONES AUTOMÁTICAS (Vital para Docker)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AltairisDbContext>();
    context.Database.Migrate();
}

// 8. PIPELINE DE MIDDLEWARE (El orden es la clave)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// En Docker (Desarrollo), HTTPS Redirection puede causar conflictos con CORS
// app.UseHttpsRedirection(); 

app.UseRouting();

// CORS DEBE IR AQUÍ: Después de Routing y antes de Auth
app.UseCors("AllowNextjs");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();