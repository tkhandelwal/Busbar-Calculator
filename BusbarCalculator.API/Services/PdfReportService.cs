// BusbarCalculator.API/Services/PdfReportService.cs
using BusbarCalculator.API.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BusbarCalculator.API.Services
{
    public class PdfReportService
    {
        private readonly ILogger<PdfReportService> _logger;

        public PdfReportService(ILogger<PdfReportService> logger)
        {
            _logger = logger;
        }

        // PdfReportService.cs - Fix for CS1674 error
        public Task<byte[]> GenerateBusbarReport(BusbarResult result)
        {
            _logger.LogInformation("Generating busbar calculation report");

            return Task.Run(() => {
                var document = QuestPDF.Fluent.Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(50);
                        page.Header().Element(ComposeHeader);
                        page.Content().Element(container => ComposeContent(container, result));
                        page.Footer().Element(ComposeFooter);
                    });
                });

                using var stream = new MemoryStream();
                document.GeneratePdf(stream);
                return stream.ToArray();
            });
        }

        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("Busbar Design Report")
                        .FontSize(20).Bold();

                    column.Item().Text(text =>
                    {
                        text.Span("Generated: ").SemiBold();
                        text.Span(DateTime.Now.ToString("g"));
                    });
                });
            });
        }

        private void ComposeContent(IContainer container, BusbarResult result)
        {
            container.PaddingVertical(10).Column(column =>
            {
                column.Item().Text("Calculation Results").FontSize(16).Bold();
                column.Item().PaddingVertical(5);

                // Summary section
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                    });

                    AddTableRow(table, "Required Cross-Section Area", $"{result.RequiredCrossSectionArea} mm²");
                    AddTableRow(table, "Current Density", $"{result.CurrentDensity} A/mm²");
                    AddTableRow(table, "Temperature Rise", $"{result.TemperatureRise} °C");
                    AddTableRow(table, "Max Allowable Temperature", $"{result.MaxAllowableTemperature} °C");
                    AddTableRow(table, "Mechanical Stress", $"{result.MechanicalStress / 1e6} MPa");
                    AddTableRow(table, "Max Allowable Stress", $"{result.MaxAllowableMechanicalStress / 1e6} MPa");
                    AddTableRow(table, "Short Circuit Force", $"{result.ShortCircuitForce} N");
                    AddTableRow(table, "Design Status", result.IsSizingSufficient ? "Acceptable" : "Insufficient");
                });

                column.Item().PaddingVertical(10);

                // Recommended sizes
                column.Item().Text("Recommended Standard Sizes").FontSize(14).Bold();
                column.Item().PaddingVertical(5);

                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Size (Width × Thickness)").Bold();
                    });

                    foreach (var size in result.RecommendedStandardSizes)
                    {
                        table.Cell().Text(size);
                    }
                });

                // Advanced results section if available
                if (result.AdvancedResults != null && result.AdvancedResults.Count > 0)
                {
                    column.Item().PaddingVertical(10);
                    column.Item().Text("Advanced Analysis Results").FontSize(14).Bold();
                    column.Item().PaddingVertical(5);

                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(2);
                        });

                        foreach (var item in result.AdvancedResults)
                        {
                            if (item.Value is double value)
                            {
                                AddTableRow(table, FormatKeyName(item.Key), $"{Math.Round(value, 4)}");
                            }
                            else if (item.Value is bool boolValue)
                            {
                                AddTableRow(table, FormatKeyName(item.Key), boolValue ? "Yes" : "No");
                            }
                            else
                            {
                                AddTableRow(table, FormatKeyName(item.Key), item.Value?.ToString() ?? "N/A");
                            }
                        }
                    });
                }

                // Safety analysis section
                column.Item().PaddingVertical(10);
                column.Item().Text("Safety Analysis").FontSize(14).Bold();
                column.Item().PaddingVertical(5);

                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                    });

                    AddTableRow(table, "Temperature Safety Factor",
                        $"{(result.MaxAllowableTemperature / result.TemperatureRise).ToString("F2")}");
                    AddTableRow(table, "Mechanical Stress Safety Factor",
                        $"{(result.MaxAllowableMechanicalStress / result.MechanicalStress).ToString("F2")}");

                    // Add recommendations if not sufficient
                    if (!result.IsSizingSufficient)
                    {
                        table.Cell().ColumnSpan(2).Element(cell =>
                        {
                            cell.PaddingTop(5);
                            cell.PaddingBottom(5);

                            cell.Text("Recommendations:")
                                .Bold();

                            if (result.TemperatureRise > result.MaxAllowableTemperature)
                            {
                                cell.Text("• Increase cross-section area to reduce temperature rise");
                            }

                            if (result.MechanicalStress > result.MaxAllowableMechanicalStress)
                            {
                                cell.Text("• Increase thickness or reduce span length to decrease mechanical stress");
                            }
                        });
                    }
                });
            });
        }

        private void AddTableRow(TableDescriptor table, string label, string value)
        {
            table.Cell().Text(label);
            table.Cell().Text(value);
        }

        private string FormatKeyName(string key)
        {
            // Convert camelCase to Title Case with spaces
            return string.Concat(key.Select((x, i) => i > 0 && char.IsUpper(x) ? " " + x : x.ToString()))
                .Replace("FEM", "FEM")
                .Replace("Fem", "FEM");
        }

        private void ComposeFooter(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("© 2025 Busbar Calculator").FontSize(10);
                    column.Item().Text(text =>
                    {
                        text.Span("Page ").FontSize(10);
                        text.CurrentPageNumber().FontSize(10);
                        text.Span(" of ").FontSize(10);
                        text.TotalPages().FontSize(10);
                    });
                });
            });
        }
    }
}