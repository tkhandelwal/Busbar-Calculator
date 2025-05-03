// BusbarCalculator.API/Services/IShortCircuitService.cs
using BusbarCalculator.API.Models;

namespace BusbarCalculator.API.Services
{
    public interface IShortCircuitService
    {
        ShortCircuitSimulationResult SimulateShortCircuit(ShortCircuitSimulationRequest request);
    }
}