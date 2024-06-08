document.addEventListener("DOMContentLoaded", function(){
    fetch("./Data/analysisStarter.json")
    .then((response) => response.json())
    .then((data) => {
        // Mengelompokkan data berdasarkan tahun dan menghitung total profit
        const profitByYear = {};

        data.forEach(item => {
            const year = new Date(item.Order_Date).getFullYear();
            const profit = parseFloat(item.Profit);

            if (!profitByYear[year]) {
                profitByYear[year] = 0;
            }

            profitByYear[year] += profit;
        });

        // Menyiapkan data untuk Chart.js
        const years = Object.keys(profitByYear).sort();
        const profits = years.map(year => profitByYear[year]);

        // Membuat bar chart menggunakan Chart.js
        const ctx = document.getElementById('profitChart').getContext('2d');
        const profitChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Total Profit',
                    data: profits,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
});