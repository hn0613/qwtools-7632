/**
 * Daily Stats Chart — Deferred initialization with explicit state management.
 *
 * State transitions via CSS classes on #chart-panel:
 *   (no class)      → .chart-loading visible (default, set in HTML/CSS)
 *   .chart-loaded   → chart rendered, loading hidden
 *   .chart-failed   → error message shown, chart hidden
 */
document.addEventListener("DOMContentLoaded", function () {
    var panel = document.getElementById("chart-panel");
    var chartEl = document.getElementById("sales_chart");

    if (!panel || !chartEl) {
        return;
    }

    // --- Guard: check if C3 library loaded from CDN ---
    if (typeof c3 === "undefined") {
        showChartError("Diagrambiblioteket (C3) kunne ikke indlæses fra CDN.");
        return;
    }

    // --- Fetch chart data via AJAX with timeout ---
    $.ajax({
        url: "../sales_api",
        dataType: "json",
        timeout: 10000,
    })
        .done(function (data) {
            // Validate response has usable data
            if (
                !data ||
                !data.day ||
                !data.day.length ||
                (!data.sales && !data.revenue)
            ) {
                showChartError(
                    "Ingen salgsdata tilgængelig for de seneste 30 dage."
                );
                return;
            }

            try {
                renderChart(data);
                panel.classList.add("chart-loaded");
            } catch (e) {
                showChartError(
                    "Diagrammet kunne ikke renderes: " + e.message
                );
            }
        })
        .fail(function (xhr, status, error) {
            var message;
            if (status === "timeout") {
                message =
                    "Salgs-API'et svarede ikke inden for 10 sekunder. Prøv at genindlæse siden.";
            } else if (status === "parsererror") {
                message = "Salgs-API'et returnerede ugyldige data.";
            } else if (status === "error") {
                message =
                    "Fejl ved hentning af salgsdata (HTTP " +
                    (xhr.status || "ukendt") +
                    ").";
            } else {
                message =
                    "Netværksfejl: kunne ikke hente salgsdata (" +
                    status +
                    ").";
            }
            showChartError(message);
        });

    function renderChart(data) {
        c3.generate({
            bindto: "#sales_chart",
            data: {
                json: data,
                keys: {
                    x: "day",
                    value: ["sales", "revenue"],
                },
                type: "area-spline",
                axes: {
                    sales: "y",
                    revenue: "y2",
                },
                colors: {
                    revenue: "#E74C3C",
                    sales: "#1ABC9C",
                },
            },
            axis: {
                x: {
                    type: "timeseries",
                    tick: {
                        format: "%Y-%m-%d",
                    },
                },
                y: {
                    label: "Sales",
                },
                y2: {
                    show: true,
                    label: "Revenue",
                },
            },
        });
    }

    function showChartError(message) {
        // Update the error detail text with the specific reason
        var detailEl = panel.querySelector(".chart-error-detail");
        if (detailEl && message) {
            detailEl.textContent =
                message +
                " Ovenstående tal og tabeller er stadig korrekte — det er kun diagrammet, der ikke er tilgængeligt.";
        }
        panel.classList.add("chart-failed");
    }
});
