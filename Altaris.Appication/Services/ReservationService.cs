using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

public class ReservationService : IReservationService
{
    private readonly IGenericRepository<Reservation> _resRepo;
    private readonly IGenericRepository<Inventory> _invRepo;

    public ReservationService(IGenericRepository<Reservation> resRepo, IGenericRepository<Inventory> invRepo)
    {
        _resRepo = resRepo;
        _invRepo = invRepo;
    }

    public async Task<bool> IsAvailableAsync(int roomTypeId, DateTime start, DateTime end)
    {
        var inventories = await _invRepo.GetAllAsync();
        // Filtramos inventario para el tipo de habitación y rango de fechas
        var dailyStock = inventories.Where(i => i.RoomTypeId == roomTypeId && i.Date >= start && i.Date < end);

        // Si falta algún día en el inventario o algún día tiene 0 disponibles, no hay cupo
        return dailyStock.Count() == (end - start).Days && dailyStock.All(i => i.AvailableRooms > 0);
    }

    public async Task<Reservation> CreateBookingAsync(CreateReservationRequest request)
    {
        if (!await IsAvailableAsync(request.RoomTypeId, request.CheckIn, request.CheckOut))
            throw new Exception("No hay disponibilidad para las fechas seleccionadas.");

        var reservation = new Reservation
        {
            RoomTypeId = request.RoomTypeId,
            GuestName = request.GuestName,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Status = "Confirmed"
        };

        await _resRepo.AddAsync(reservation);
        await _resRepo.SaveChangesAsync();
        return reservation;
    }
}