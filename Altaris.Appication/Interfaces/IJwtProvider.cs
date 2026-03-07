public interface IJwtProvider
{
    string Generate(Altairis.Domain.Entities.User user);
}