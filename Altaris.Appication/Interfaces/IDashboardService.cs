// Altairis.Application/Interfaces/IDashboardService.cs
using Altairis.Application.DTOs;

namespace Altairis.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync();
    }
}