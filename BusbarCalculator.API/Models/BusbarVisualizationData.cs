namespace BusbarCalculator.API.Models
{
    public class BusbarVisualizationData
    {
        public double Width { get; set; }
        public double Thickness { get; set; }
        public double Length { get; set; }
        public double PhaseDistance { get; set; }
        public int NumberOfBarsPerPhase { get; set; }
        public string Arrangement { get; set; }
        public Dictionary<string, List<double[]>> MeshData { get; set; }
        public Dictionary<string, List<double>> TemperatureData { get; set; }
        public Dictionary<string, List<double>> StressData { get; set; }
    }
}