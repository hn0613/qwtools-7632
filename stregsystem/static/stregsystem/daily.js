document.addEventListener('DOMContentLoaded', function () {
    var chartEl = document.getElementById('sales_chart');
    if (!chartEl) return;

    chartEl.innerHTML = '<div class="chart-loading">Loading chart data\u2026</div>';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../sales_api');
    xhr.timeout = 10000;

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var data = JSON.parse(xhr.responseText);
                chartEl.innerHTML = '';
                if (typeof c3 === 'undefined') {
                    showChartError(chartEl);
                    return;
                }
                c3.generate({
                    bindto: '#sales_chart',
                    data: {
                        x: 'day',
                        json: data,
                        type: 'area-spline',
                        axes: {
                            sales: 'y',
                            revenue: 'y2'
                        },
                        colors: {
                            revenue: '#E74C3C',
                            sales: '#1ABC9C'
                        }
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: '%Y-%m-%d'
                            }
                        },
                        y: {
                            label: 'Sales'
                        },
                        y2: {
                            show: true,
                            label: 'Revenue'
                        }
                    }
                });
            } catch (e) {
                showChartError(chartEl);
            }
        } else {
            showChartError(chartEl);
        }
    };

    xhr.onerror = function () { showChartError(chartEl); };
    xhr.ontimeout = function () { showChartError(chartEl); };
    xhr.send();
});

function showChartError(el) {
    el.innerHTML =
        '<div class="chart-error">' +
        '<strong>Chart could not be loaded.</strong><br>' +
        'The sales data API may be unavailable. ' +
        'This does not affect the data shown in the tables below.' +
        '</div>';
}
