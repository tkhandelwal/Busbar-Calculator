// ReportService.cs
using BusbarCalculator.API.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.ComponentModel;
using System.Reflection.Metadata;

namespace BusbarCalculator.API.Services
{
    public class ReportService
    {
        public byte[] GenerateBusbarReport(Project project)
        {
            // Register QuestPDF license (Community Edition is free for open-source and commercial use)
            QuestPDF.Settings.License = LicenseType.Community;

            // Create the document
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(50);
                    page.Header().Element(ComposeHeader);
                    page.Content().Element(container => ComposeContent(container, project));
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });
                });
            });

            // Generate PDF to memory stream
            using var stream = new MemoryStream();
            document.GeneratePdf(stream);
            return stream.ToArray();
        }

        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("Busbar Calculation Report").Bold().FontSize(20);
                    column.Item().Text($"Generated on {DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(12);
                });

                // Add company logo here if needed
                // row.ConstantItem(100).Height(50).Image("path/to/logo.png");
            });
        }

        private void ComposeContent(IContainer container, Project project)
        {
            container.Column(column =>
            {
                // Project Information
                column.Item().PaddingTop(10).Element(element =>
                {
                    element.Column(col =>
                    {
                        col.Item().Text("Project Information").Bold().FontSize(16);
                        col.Item().Text($"Name: {project.Name}");
                        col.Item().Text($"Description: {project.Description}");
                        col.Item().Text($"Created: {project.CreatedDate:yyyy-MM-dd}");
                        col.Item().Text($"Last Modified: {project.LastModifiedDate:yyyy-MM-dd}");
                    });
                });

                // Input Parameters
                column.Item().PaddingTop(20).Element(element =>
                {
                    element.Column(col =>
                    {
                        col.Item().Text("Input Parameters").Bold().FontSize(16);
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Parameter").Bold();
                                header.Cell().Text("Value").Bold();
                            });

                            var input = project.BusbarInput;

                            table.Cell().Text("Current");
                            table.Cell().Text($"{input.Current} A");

                            table.Cell().Text("Voltage");
                            table.Cell().Text($"{input.Voltage} kV");

                            table.Cell().Text("Voltage Level");
                            table.Cell().Text(input.VoltageLevel);

                            table.Cell().Text("Material");
                            table.Cell().Text(input.Material);

                            table.Cell().Text("Ambient Temperature");
                            table.Cell().Text($"{input.AmbientTemperature}°C");

                            table.Cell().Text("Arrangement");
                            table.Cell().Text(input.Arrangement);

                            table.Cell().Text("Phase Distance");
                            table.Cell().Text($"{input.PhaseDistance} mm");

                            table.Cell().Text("Short Circuit Current");
                            table.Cell().Text($"{input.ShortCircuitCurrent} kA");

                            table.Cell().Text("Busbar Dimensions");
                            table.Cell().Text($"{input.BusbarWidth} × {input.BusbarThickness} × {input.BusbarLength} mm");

                            table.Cell().Text("Bars Per Phase");
                            table.Cell().Text(input.NumberOfBarsPerPhase.ToString());
                        });
                    });
                });

                // Results
                column.Item().PaddingTop(20).Element(element =>
                {
                    element.Column(col =>
                    {
                        col.Item().Text("Calculation Results").Bold().FontSize(16);
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Parameter").Bold();
                                header.Cell().Text("Value").Bold();
                            });

                            var result = project.BusbarResult;

                            table.Cell().Text("Required Cross Section Area");
                            table.Cell().Text($"{result.RequiredCrossSectionArea:F2} mm²");

                            table.Cell().Text("Current Density");
                            table.Cell().Text($"{result.CurrentDensity:F2} A/mm²");

                            table.Cell().Text("Temperature Rise");
                            table.Cell().Text($"{result.TemperatureRise:F2}°C");

                            table.Cell().Text("Maximum Allowable Temperature");
                            table.Cell().Text($"{result.MaxAllowableTemperature}°C");

                            table.Cell().Text("Short Circuit Force");
                            table.Cell().Text($"{result.ShortCircuitForce:F2} N");

                            table.Cell().Text("Mechanical Stress");
                            table.Cell().Text($"{result.MechanicalStress / 1e6:F2} MPa");

                            table.Cell().Text("Maximum Allowable Stress");
                            table.Cell().Text($"{result.MaxAllowableMechanicalStress / 1e6:F2} MPa");

                            table.Cell().Text("Sizing Sufficient");
                            table.Cell().Text(result.IsSizingSufficient ? "Yes" : "No");
                        });
                    });
                });

                // Recommended Sizes
                column.Item().PaddingTop(20).Element(element =>
                {
                    element.Column(col =>
                    {
                        col.Item().Text("Recommended Standard Sizes").Bold().FontSize(16);
                        col.Item().Text(string.Join(", ", project.BusbarResult.RecommendedStandardSizes));
                    });
                });

                // Advanced Results
                if (project.BusbarResult.AdvancedResults != null && project.BusbarResult.AdvancedResults.Count > 0)
                {
                    column.Item().PaddingTop(20).Element(element =>
                    {
                        element.Column(col =>
                        {
                            col.Item().Text("Advanced Results").Bold().FontSize(16);
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Text("Parameter").Bold();
                                    header.Cell().Text("Value").Bold();
                                });

                                foreach (var item in project.BusbarResult.AdvancedResults)
                                {
                                    table.Cell().Text(FormatKeyName(item.Key));
                                    table.Cell().Text(FormatValue(item.Value));
                                }
                            });
                        });
                    });
                }

                // Notes
                if (!string.IsNullOrEmpty(project.Notes))
                {
                    column.Item().PaddingTop(20).Element(element =>
                    {
                        element.Column(col =>
                        {
                            col.Item().Text("Notes").Bold().FontSize(16);
                            col.Item().Text(project.Notes);
                        });
                    });
                }
            });
        }

        private string FormatKeyName(string key)
        {
            // Convert camelCase to Title Case with spaces
            return System.Text.RegularExpressions.Regex.Replace(key, "([a-z])([A-Z])", "$1 $2");
        }

        private string FormatValue(object value)
        {
            if (value is double doubleValue)
                return doubleValue.ToString("F2");

            return value?.ToString() ?? "";
        }
    }
}