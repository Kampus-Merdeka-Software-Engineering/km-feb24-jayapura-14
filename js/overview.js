document.addEventListener("DOMContentLoaded", function(){
    fetch("./Data/analysisStarter.json")
    .then((response) => response.json())
    .then((data) => {
        const years = data.map(item => item.Year);
        const profits = data.map(item => parseFloat(item.Profit));
        // Membuat bar chart
        const ctx = document.getElementById('profitChart').getContext('2d');
        const profitChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Total Profit',
                    data: profits,
                    backgroundColor: "#0072f0",
                    borderColor: "transparent",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.raw.toLocaleString()}`;
                            },
                        },
                    },
                    datalabels: {
                        color: "#fff",
                        anchor: "center",
                        align: "center",
                        formatter: function (value) {
                            if (value >= 1e6) {
                                return (value / 1e6).toFixed(1) + 'M'; // Tampilkan dalam jutaan
                            } else if (value >= 1e3) {
                                return (value / 1e3).toFixed(1) + 'K'; // Tampilkan dalam ribuan
                            } else {
                                return value.toLocaleString(); // Tampilkan nilai aslinya
                            }
                        },
                        font: {
                            weight: "bold",
                        },
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        },
                        ticks: {
                            autoSkip: false,
                        },
                        grid: {
                            display: false, // Hide x-axis grid lines
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Profit'
                        },
                        ticks: {
                            callback: function (value) {
                                if (value >= 1e6) {
                                    return (value / 1e6).toFixed(1) + 'M'; // Tampilkan dalam jutaan
                                } else if (value >= 1e3) {
                                    return (value / 1e3).toFixed(1) + 'K'; // Tampilkan dalam ribuan
                                } else {
                                    return value.toLocaleString(); // Tampilkan nilai aslinya
                                }
                            },
                        },
                        grid: {
                            display: true, // Show y-axis grid lines
                        },
                    },
                },
            },
            plugins: [ChartDataLabels],
        });
    })
    .catch(error => console.error('Error fetching data:', error));
});