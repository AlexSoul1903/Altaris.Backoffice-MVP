using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;
using BCrypt.Net;

namespace Altairis.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtProvider _jwtProvider;

        // Inyectamos las interfaces del Dominio y Aplicación
        public AuthService(IUserRepository userRepository, IJwtProvider jwtProvider)
        {
            _userRepository = userRepository;
            _jwtProvider = jwtProvider;
        }

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            // 1. Hashear la contraseña (Seguridad)
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 2. Mapear DTO a Entidad de Dominio
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = passwordHash,
                RoleId = request.RoleId,
                IsActive = true
            };

            // 3. Guardar usando el repositorio (Abstracción de datos)
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return true;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            // 1. Buscar usuario por email (incluyendo su Rol)
            var user = await _userRepository.GetByEmailAsync(request.Email);

            // 2. Validar existencia y contraseña
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return null;
            }

            // 3. Generar el Token JWT
            var token = _jwtProvider.Generate(user);

            // 4. Retornar respuesta para el Frontend
            return new LoginResponse
            {
                Token = token,
                Email = user.Email,
                Role = user.Role?.Name ?? "Agent"
            };
        }
    }
}