const selectbtn = document.querySelectorAll(".select-btn");

selectbtn.forEach((selectBtn) => {
  selectBtn.addEventListener("click", () => {
    const isOpen = selectBtn.classList.toggle("open-list");
    if (isOpen) {
        const openDropdowns = document.querySelectorAll(".open-list");
        openDropdowns.forEach((dropdown) => {
            if (dropdown !== selectBtn) {
                dropdown.classList.remove("open-list");
            }
        });
    }
  });
});

let cityCoordinates = {};
function mergeDataWithCoordinates(filteredSalesData) {
    return filteredSalesData.map(sale => {
        const cityCoord = cityCoordinates.find(city => city.City === sale.City);
        if (cityCoord) {
            return {
                ...sale,
                Coordinates: [parseFloat(cityCoord.Lat), parseFloat(cityCoord.Lng)]
            };
        }
        return sale;
    }).filter(item => item.Coordinates); // Filter out entries without coordinates
}
document.addEventListener("DOMContentLoaded", function(){
    async function fetchCityCoordinates() {
        const response = await fetch('Data/cityCoordinates.json');
        cityCoordinates = await response.json();
        console.log(cityCoordinates);
    }
    fetchCityCoordinates().then(() => {
        fetch("./Data/Superstore.json")
        .then((response) => response.json())
        .then((data) => {
            createFilter(data, "Order_Date", ".order-month", true);
            createFilter(data, "Sub_Category", ".sub-cat");
            createFilter(data, "Segment", ".segment");
            createFilter(data, "Region", ".region");
            createFilter(data, "State", ".state");

            // Membuat Button SELECT ALL dan RESET di setiap filter section
            function addSelectAllButton(containerSelector) {
                const container = document.querySelector(containerSelector);
                const existingSelectAllButton = container.querySelector(".select-all");
                const existingResetButton = container.querySelector(".reset");

                // Pastikan tombol tidak duplikat
                if (!existingSelectAllButton) {
                    const selectAllButton = document.createElement("button");
                    selectAllButton.textContent = "Select All";
                    selectAllButton.className = "select-all";
                    selectAllButton.style.display = "none"; // Sembunyikan tombol select di awal
                    container.prepend(selectAllButton);

                    selectAllButton.addEventListener("click", (e) => {
                        e.preventDefault();
                        container.querySelectorAll(".item input[type=checkbox]").forEach((checkbox) => {
                            checkbox.checked = true;
                        });
                        toggleButtons(containerSelector);
                        const selectedFilters = getSelectedFilters();
                        const filteredData = data.filter(filterData(selectedFilters));
                        displayData(filteredData);
                    });
                }

                if (!existingResetButton) {
                    const resetButton = document.createElement("button");
                    resetButton.textContent = "Reset";
                    resetButton.className = "reset";
                    // resetButton.style.display = "none"; // Sembunyikan tombol reset di awal
                    container.prepend(resetButton);

                    resetButton.addEventListener("click", (e) => {
                        e.preventDefault();
                        container.querySelectorAll(".item input[type=checkbox]").forEach((checkbox) => {
                            checkbox.checked = false;
                        });
                        toggleButtons(containerSelector);
                        displayData([]);
                    });
                }
                // event listeners checkboxe
                container.querySelectorAll(".item input[type=checkbox]").forEach((checkbox) => {
                    checkbox.addEventListener("change", () => {
                        toggleButtons(containerSelector);
                        const selectedFilters = getSelectedFilters();
                        updateFilters(data, selectedFilters);
                        const filteredData = data.filter(filterData(selectedFilters));
                        if (Object.values(selectedFilters).every((filter) => filter.length === 0)) {
                            displayData([]); // Tampilkan data kosong jika tidak ada yang di ceklis
                        } else {
                            displayData(filteredData);
                        }
                    });
                });
                toggleButtons(containerSelector); // Atur visibilitas tombol di awal
            }
            // Add "Select All" buttons to each filter section
            addSelectAllButton(".order-month");
            addSelectAllButton(".sub-cat");
            addSelectAllButton(".segment");
            addSelectAllButton(".region");
            addSelectAllButton(".state");


            // Display data awal by default
            document.querySelectorAll(".item input[type=checkbox]").forEach((checkbox) => {
                checkbox.checked = true;
            });
            // Display all data by default
            const selectedFilters = getSelectedFilters();
            updateFilters(data, selectedFilters);
            displayData(data);

            function toggleButtons(containerSelector) {
                const container = document.querySelector(containerSelector);
                const checkboxes = container.querySelectorAll(".item input[type=checkbox]");
                const selectAllButton = container.querySelector(".select-all");
                const resetButton = container.querySelector(".reset");
            
                const allChecked = Array.from(checkboxes).every((checkbox) => checkbox.checked);
                const someChecked = Array.from(checkboxes).some((checkbox) => checkbox.checked);
            
                if (allChecked) {
                    selectAllButton.style.display = "none";
                    resetButton.style.display = "block";
                }
                else {
                    selectAllButton.style.display = "block";
                    resetButton.style.display = someChecked ? "block" : "none";
                }
            }
        });
    });
});

function createFilter(data, attribute, containerSelector, isDate = false) {
    const container = document.querySelector(containerSelector);
    const items = [];

    data.forEach((item) => {
        let value = item[attribute];
        if (isDate) {
            const date = new Date(value);
            value = date.toLocaleString('default', { month: 'long' });
        }
        if (items.indexOf(value) === -1) {
            items.push(value);
        }
    });

    if (isDate) {
        // Urutkan bulan sesuai urutan kalender
        const monthOrder = [
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ];
        items.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    } else {
        // Urutkan items secara ascending
        items.sort((a, b) => a.localeCompare(b));
    }

    items.forEach((value) => {
        const listItem = document.createElement("li");
        listItem.className = "item";
        listItem.setAttribute("data-attribute", attribute);
        listItem.innerHTML = `
        <input type="checkbox" id="${value}" checked />
        <label for="${value}">${value}</label>
        `;
        container.appendChild(listItem);
    });
}

function updateFilters(data, selectedFilters) {
    const orderDate = selectedFilters["Order_Date"];
    const Sub_Cat = new Set();
    const Segmen = new Set();
    const Reg = new Set();
    const Stet = new Set();

    data.forEach((item) => {
        const itemDate = new Date(item["Order_Date"]);
        const itemMonth = itemDate.toLocaleString('default', { month: 'long' });
        if (!orderDate.length || orderDate.includes(itemMonth)) {
            Sub_Cat.add(item["Sub_Category"]);
            Segmen.add(item["Segment"]);
            Reg.add(item["Region"]);
            Stet.add(item["State"]);
            Sub_Cat.add(item["Sub_Category"]);
            Segmen.add(item["Segment"]);
        }
    });
    updateFilterOptions(".sub-cat", Sub_Cat, selectedFilters["Sub_Category"]);
    updateFilterOptions(".segment", Segmen, selectedFilters["Segment"]);
    updateFilterOptions(".region", Reg, selectedFilters["Region"]);
    updateFilterOptions(".state", Stet, selectedFilters["State"]);
}

function updateFilterOptions(containerSelector, options, selectedOptions) {
    const container = document.querySelector(containerSelector);
    container.querySelectorAll(".item").forEach((item) => {
        const value = item.querySelector("input").id;
        const checkbox = item.querySelector("input");
        if (options.has(value)) {
            item.style.display = "";
            checkbox.checked = selectedOptions.includes(value);
        } else {
            item.style.display = "none";
            checkbox.checked = false;
        }
    });
}

function getSelectedFilters() {
    const selectedFilters = {
        Order_Date: [],
        Sub_Category: [],
        Segment: [],
        Region: [],
        State: [],
    };

    document.querySelectorAll(".item input[type=checkbox]:checked").forEach((checkbox) => {
        const attribute = checkbox.parentElement.getAttribute("data-attribute");
        selectedFilters[attribute].push(checkbox.id);
    });

    console.log(selectedFilters);
    return selectedFilters;
}

function filterData(selectedFilters) {
    return (item) => {
        const itemDate = new Date(item["Order_Date"]);
        const itemMonth = itemDate.toLocaleString('default', { month: 'long' });
        return (
            (!selectedFilters["Order_Date"].length || selectedFilters["Order_Date"].includes(itemMonth)) &&
            (!selectedFilters["Sub_Category"].length || selectedFilters["Sub_Category"].includes(item["Sub_Category"])) &&
            (!selectedFilters["Segment"].length || selectedFilters["Segment"].includes(item["Segment"])) &&
            (!selectedFilters["Region"].length || selectedFilters["Region"].includes(item["Region"])) &&
            (!selectedFilters["State"].length || selectedFilters["State"].includes(item["State"]))
        );
    };
}

function displayData(data) {
    // total sales = sum(Sales)
    let totalSales = 0;
    if (data.length > 0) {
        totalSales = data.reduce((total, item) => {
            return total + parseFloat(item["Sales"]);
        }, 0);
    }
    // total profit = sum(Profit)
    let totalProfit = 0;
    if (data.length > 0) {
        totalProfit = data.reduce((total, item) => {
            return total + parseFloat(item["Profit"]);
        }, 0);
    }
    // Num of Orders = count_distinct(Order_ID)
    let numOrders = 0;
    if (data.length > 0) {
        const orderIds = data.map((item) => item["Order_ID"]);
        const uniqueOrderIds = new Set(orderIds);
        numOrders = uniqueOrderIds.size;
    }
    // Num of Customers = count_distinct(Customer_ID)
    let numCust = 0;
    if (data.length > 0) {
        const custID = data.map((item) => item["Customer_ID"]);
        const uniqueCustId = new Set(custID);
        numCust = uniqueCustId.size;
    }
    // Num of States = count_distinct(State)
    let numState = 0;
    if (data.length > 0) {
        const state = data.map((item) => item["State"]);
        const uniqueState = new Set(state);
        numState = uniqueState.size;
    }
    // Num of City = count_distinct(City)
    let numCity = 0;
    if (data.length > 0) {
        const city = data.map((item) => item["City"]);
        const uniqueCity = new Set(city);
        numCity = uniqueCity.size;
    }
    console.log(numCity);
    
    
    document.getElementById("sales-summary").textContent = `$${totalSales.toLocaleString()}`;
    document.getElementById("profit-summary").textContent = `$${totalProfit.toLocaleString()}`;
    document.getElementById("order-summary").textContent = `${numOrders.toLocaleString()}`;
    document.getElementById("cust-summary").textContent = `${numCust.toLocaleString()}`;
    document.getElementById("state-summary").textContent = `${numState.toLocaleString()}`;

    //update chart
    buatTotalSalesbyCatAndSeg(data); // total_salesChart
    buatSalesAndProfitbySubCat(data); // sales_profitChart
	buatDiskonAndKuantiti(data); // diskon_quantityChart
	buatABSnAOVinSeg(data); // abs_aovChart
	buatCatbyProfit(data); // catbyorder_profitChart
    buatStatebyLowest(data) // statelowest_salesTable
	buatCitybyLowSales(data); // citylowest_salesTable
	// buatHeatmap(data); // heatMapChart
    
    // Merge data with coordinates and update heatmap
    const mergedData = mergeDataWithCoordinates(data);
    console.log(mergedData);
    buatHeatmap(mergedData); // heatMapChart
}

// HEAT MAP
let heat;
function buatHeatmap(data) {
    const map = L.map('heatmapChart').setView([37.8, -96], 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Remove previous heatmap layer if it exists
    if (window.heat) {
        map.removeLayer(window.heat);
    }
    
    // Prepare the heatmap data
    const heatData = data.map(item => [...item.Coordinates, parseFloat(item.Sales)]);
    
    // Create and add the heatmap layer to the map
    window.heat = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {0.4: 'green', 0.65: 'yellow', 1: 'red'}
    }).addTo(map);
}

let total_salesChart;
let totalsalesData;
function buatTotalSalesbyCatAndSeg(data) {
    const ctx = document.getElementById("total_salesChart").getContext("2d");
    if (total_salesChart) {
        total_salesChart.destroy();
    }
    // buat object
    totalsalesData = {
        "Furniture": { "Consumer": 0, "Corporate": 0, "Home Office": 0 },
        "Office Supplies": { "Consumer": 0, "Corporate": 0, "Home Office": 0 },
        "Technology": { "Consumer": 0, "Corporate": 0, "Home Office": 0 }
    };

    data.forEach(item => {
        const category = item.Category;
        const segment = item.Segment;
        const sales = parseFloat(item.Sales);

        if (totalsalesData[category] && totalsalesData[category][segment] !== undefined) {
            totalsalesData[category][segment] += sales;
        }
    });

    const labels = ["Furniture", "Office Supplies", "Technology"];
    const segments = ["Consumer", "Corporate", "Home Office"];
    const datasets = segments.map(segment => {
        return {
            label: segment,
            data: labels.map(label => totalsalesData[label][segment]),
            backgroundColor: getSegmentColor(segment),
            borderColor: "transparent",
            borderWidth: 1
        };
    });
    // background color brdsrkan segment
    function getSegmentColor(segment) {
        switch(segment) {
            case 'Consumer': return "#0072f0";
            case 'Corporate': return "#F10096";
            case 'Home Office': return "#00B6CB";
            default: return "#d4d4d4";
        }
    }             
    total_salesChart = new Chart(ctx, {
        type: 'bar',
        data : {
            labels: labels,
            datasets: datasets
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
                    color: "#000",
                    anchor: "end",
                    align: "end",
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
                        text: 'Category'
                    },
                    ticks: {
                        autoSkip: false,
                    },
                    grid: {
                        display: false, // Hide x-axis grid lines
                    },
                },
                y: {
                    // beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Sales'
                    },
                    ticks: {
                        // stepSize: 5000,
                        beginAtZero: true,
                        // color: tickColor,
                        callback: function (value) {
                            if (value >= 1e6) {
                                return (value / 1e6) + 'M'; // Tampilkan dalam jutaan
                            } else if (value >= 1e3) {
                                return (value / 1e3) + 'K'; // Tampilkan dalam ribuan
                            } else {
                                return value.toLocaleString(); // Tampilkan nilai aslinya
                            }
                        },
                    },
                    grid: {
                        display: true, // Hide x-axis grid lines
                    },
                },
            },
        },
        plugins: [ChartDataLabels],
    });
}
function sortTotalSales(order) {
    const labels = ["Furniture", "Office Supplies", "Technology"];
    
    // Buat array dari total penjualan per kategori untuk diurutkan
    const totalSalesPerCategory = labels.map(category => {
        const totalSales = Object.values(totalsalesData[category]).reduce((sum, value) => sum + value, 0);
        return { category, totalSales };
    });

    // Urutkan berdasarkan total penjualan
    totalSalesPerCategory.sort((a, b) => order === 'asc' ? a.totalSales - b.totalSales : b.totalSales - a.totalSales);

    // Urutkan label dan dataset sesuai urutan total penjualan
    const sortedLabels = totalSalesPerCategory.map(item => item.category);
    const sortedDatasets = total_salesChart.data.datasets.map(dataset => ({
        ...dataset,
        data: sortedLabels.map(label => totalsalesData[label][dataset.label])
    }));

    total_salesChart.data.labels = sortedLabels;
    total_salesChart.data.datasets = sortedDatasets;
    total_salesChart.update();
}
// pop up insight
function showInsightPopup() {
    document.getElementById("insightPopup").style.display = "block";
}
function closeInsightPopup() {
    document.getElementById("insightPopup").style.display = "none";
}

// =================================
// SALES & PROFIT BY SUB CATEGORY
let sales_profitChart;
let SalesProfitData;
function buatSalesAndProfitbySubCat(data) {
    const ctx = document.getElementById("sales_profitChart").getContext("2d");
    if (sales_profitChart) {
        sales_profitChart.destroy();
    }
    SalesProfitData = {};

    data.forEach(item => {
        const subCategory = item["Sub_Category"];
        const sales = parseFloat(item.Sales);
        const profit = parseFloat(item.Profit);
        if (!SalesProfitData[subCategory]) {
            SalesProfitData[subCategory] = { sales: 0, profit: 0 };
        }
        SalesProfitData[subCategory].sales += sales;
        SalesProfitData[subCategory].profit += profit;
    });

    updateChart();
}

function updateChart() {
    const ctx = document.getElementById("sales_profitChart").getContext("2d");
    const labels = Object.keys(SalesProfitData);
    const salesData = labels.map(label => SalesProfitData[label].sales);
    const profitData = labels.map(label => SalesProfitData[label].profit);

    const datasets = [
        {
            label: 'Sales',
            data: salesData,
            backgroundColor: "#F10096",
            borderColor: "transparent",
            borderWidth: 1,
        },
        {
            label: 'Profit',
            data: profitData,
            backgroundColor: "#0072f0",
            borderColor: "transparent",
            borderWidth: 1,
        }
    ];

    sales_profitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                        },
                    },
                },
                datalabels: {
                    color: "#000",
                    anchor: "end",
                    align: "end",
                    formatter: function (value) {
                        if (value >= 1e6) {
                            return (value / 1e6).toFixed(1) + 'M';
                        } else if (value >= 1e3) {
                            return (value / 1e3).toFixed(1) + 'K';
                        } else {
                            return value.toLocaleString();
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
                        text: 'Amount'
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            if (value >= 1e6) {
                                return (value / 1e6) + 'M';
                            } else if (value >= 1e3) {
                                return (value / 1e3) + 'K';
                            } else {
                                return value.toLocaleString();
                            }
                        },
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Sub-Category'
                    },
                    stacked: true,
                    ticks: {
                        autoSkip: false,
                        beginAtZero: true,
                    },
                }
            },
        },
        plugins: [ChartDataLabels],
    });
}
function sortSubCat(order) {
    const labels = Object.keys(SalesProfitData);
    const sortedData = labels.map(label => ({
        label,
        sales: SalesProfitData[label].sales,
        profit: SalesProfitData[label].profit
    }));

    if (order === 'sales-asc') {
        sortedData.sort((a, b) => a.sales - b.sales);
    } else if (order === 'sales-desc') {
        sortedData.sort((a, b) => b.sales - a.sales);
    } else if (order === 'profit-asc') {
        sortedData.sort((a, b) => a.profit - b.profit);
    } else if (order === 'profit-desc') {
        sortedData.sort((a, b) => b.profit - a.profit);
    }

    const sortedLabels = sortedData.map(item => item.label);
    const sortedSalesData = sortedData.map(item => item.sales);
    const sortedProfitData = sortedData.map(item => item.profit);

    sales_profitChart.data.labels = sortedLabels;
    sales_profitChart.data.datasets[0].data = sortedSalesData;
    sales_profitChart.data.datasets[1].data = sortedProfitData;
    sales_profitChart.update();
}
function showSalesProfitSubCatInsight(){
    document.getElementById("SalesProfitSubCat").style.display = "block";
}
function closeSalesProfitSubCatInsight(){
    document.getElementById("SalesProfitSubCat").style.display = "none";        
}
// ==================================
// DISKON KUANTITI
let diskon_quantityChart;
let labels = [];
let discountData = [];
let quantityData = [];
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
function buatDiskonAndKuantiti(data) {
    const ctx = document.getElementById("diskon_quantityChart").getContext("2d");
    if (diskon_quantityChart) {
        diskon_quantityChart.destroy();
    }

    const aggregatedData = {};
    months.forEach(month => {
        aggregatedData[month] = { discount: 0, quantity: 0 };
    });

    // itung data
    data.forEach(item => {
        const date = new Date(item["Order_Date"]);
        const month = months[date.getMonth()];
        const discount = parseFloat(item.Discount);
        const quantity = parseInt(item.Quantity, 10);
        if (aggregatedData[month]) {
            aggregatedData[month].discount += discount;
            aggregatedData[month].quantity += quantity;
        }
    });

    labels = months;
    discountData = labels.map(label => aggregatedData[label].discount);
    quantityData = labels.map(label => aggregatedData[label].quantity);

    const datasets = [
        {
            label: 'Discount',
            data: discountData,
            borderColor: "#0072f0",
            backgroundColor: "transparent",
            borderWidth: 2,
            fill: true,
            tension: 0.4
        },
        {
            label: 'Quantity',
            data: quantityData,
            borderColor: "#00B6CB",
            backgroundColor: "transparent",
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }
    ];

    diskon_quantityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                        },
                    },
                },
                datalabels: {
                    color: "#000",
                    anchor: "start",
                    align: "start",
                    formatter: function (value) {
                        return value.toLocaleString();
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
                        text: 'Month'
                    },
                    ticks: {
                        autoSkip: false, // Ensure all months are displayed
                        // maxRotation: 0,
                        // minRotation: 0
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount'
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return value.toLocaleString();
                        },
                    }
                }
            },
        },
        plugins: [ChartDataLabels],
    });
    document.getElementById("sortCriteria").value = "date-asc";
    sortDiskon();
}
function sortDiskon() {
    const sortCriteria = document.getElementById("sortCriteria").value;
    const combinedData = labels.map((label, index) => ({
        month: label,
        discount: discountData[index],
        quantity: quantityData[index]
    }));

    switch (sortCriteria) {
        case 'discount-asc':
            combinedData.sort((a, b) => a.discount - b.discount);
            break;
        case 'discount-desc':
            combinedData.sort((a, b) => b.discount - a.discount);
            break;
        case 'quantity-asc':
            combinedData.sort((a, b) => a.quantity - b.quantity);
            break;
        case 'quantity-desc':
            combinedData.sort((a, b) => b.quantity - a.quantity);
            break;
        case 'date-asc':
            combinedData.sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
            break;
        case 'date-desc':
            combinedData.sort((a, b) => months.indexOf(b.month) - months.indexOf(a.month));
            break;
    }

    labels = combinedData.map(item => item.month);
    discountData = combinedData.map(item => item.discount);
    quantityData = combinedData.map(item => item.quantity);

    diskon_quantityChart.data.labels = labels;
    diskon_quantityChart.data.datasets[0].data = discountData;
    diskon_quantityChart.data.datasets[1].data = quantityData;
    diskon_quantityChart.update();
}
function showDiskonKuantiti(){
    document.getElementById("insightDiskon").style.display = "block";
}
function closeDiskonKuantiti(){
    document.getElementById("insightDiskon").style.display = "none";
}
// ============================
// ABS AOV
let abs_aovChart;
let globalLabels = [];
let globalAbsData = [];
let globalAovData = [];
function buatABSnAOVinSeg(data) {
    const ctx = document.getElementById("abs_aovChart").getContext("2d");
    if (abs_aovChart) {
        abs_aovChart.destroy();
    }

    const aggregatedData = {};
    const segments = ["Consumer", "Corporate", "Home Office"];

    segments.forEach(segment => {
        aggregatedData[segment] = { sales: 0, quantity: 0, orders: new Set() };
    });

    data.forEach(item => {
        const segment = item.Segment;
        const sales = parseFloat(item.Sales);
        const quantity = parseInt(item.Quantity, 10);
        const orderId = item["Order_ID"];

        if (aggregatedData[segment]) {
            aggregatedData[segment].sales += sales;
            aggregatedData[segment].quantity += quantity;
            aggregatedData[segment].orders.add(orderId);
        }
    });

    const labels = segments;
    const absData = labels.map(label => {
        const ordersCount = aggregatedData[label].orders.size;
        return ordersCount ? aggregatedData[label].quantity / ordersCount : 0;
    });
    const aovData = labels.map(label => {
        const ordersCount = aggregatedData[label].orders.size;
        return ordersCount ? aggregatedData[label].sales / ordersCount : 0;
    });
    globalLabels = labels;
    globalAbsData = absData;
    globalAovData = aovData;

    const datasets = [
        {
            label: 'AOV',
            data: aovData,
            backgroundColor: "#0072f0",
            yAxisID: 'y-aov',
            borderWidth: 1,
        },
        {
            label: 'ABS',
            data: absData,
            backgroundColor: "#00B6CB",
            yAxisID: 'y-abs',
            borderWidth: 1,
        }
    ];

    abs_aovChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
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
                            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                        },
                    },
                },
                datalabels: {
                    color: "#fff",
                    anchor: "end",
                    rotation: 90,
                    align: "start",
                    formatter: function (value) {
                        if (value >= 1e3) {
                            return (value / 1e3).toFixed(1) + 'K';
                        } else {
                            return value.toFixed(2).toLocaleString(); // Tampilkan nilai aslinya
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
                        text: 'Segment'
                    },
                    ticks: {
                        autoSkip: false,
                    }
                },
                'y-aov': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'AOV'
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return value.toLocaleString();
                        },
                    }
                },
                'y-abs': {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'ABS'
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return value.toLocaleString();
                        },
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
        },
        plugins: [ChartDataLabels],
    });
    document.getElementById("sortOrder").value = "abs-asc";
    sortABSAOV();
}
function onSortOrderChange() {
    const order = document.getElementById("sortabsaov").value;
    sortABSAOV(order);
}
function sortABSAOV(order) {
    const labels = [...globalLabels];
    const absData = [...globalAbsData];
    const aovData = [...globalAovData];

    const combinedData = labels.map((label, index) => ({
        segment: label,
        abs: absData[index],
        aov: aovData[index]
    }));

    switch (order) {
        case 'abs-asc':
            combinedData.sort((a, b) => a.abs - b.abs);
            break;
        case 'abs-desc':
            combinedData.sort((a, b) => b.abs - a.abs);
            break;
        case 'aov-asc':
            combinedData.sort((a, b) => a.aov - b.aov);
            break;
        case 'aov-desc':
            combinedData.sort((a, b) => b.aov - a.aov);
            break;
    }

    const sortedLabels = combinedData.map(item => item.segment);
    const sortedAbsData = combinedData.map(item => item.abs);
    const sortedAovData = combinedData.map(item => item.aov);

    abs_aovChart.data.labels = sortedLabels;  // Update chart labels
    abs_aovChart.data.datasets[0].data = sortedAovData;
    abs_aovChart.data.datasets[1].data = sortedAbsData;
    abs_aovChart.update();
}

function showAbsAov() {
    document.getElementById("insightAbsAov").style.display = "block";
}
function closeAbsAov() {
    document.getElementById("insightAbsAov").style.display = "none";
}
// =================================
// CATEGORY BY PROFIT
let catbyprofitChart;
function buatCatbyProfit(data) {
    const ctx = document.getElementById("catbyprofitChart").getContext("2d");
    if (catbyprofitChart) {
        catbyprofitChart.destroy();
    }

    const aggregatedData = {};
    let totalProfit = 0;

    data.forEach(item => {
        const category = item.Category;
        const profit = parseFloat(item.Profit);

        if (!aggregatedData[category]) {
            aggregatedData[category] = 0;
        }

        aggregatedData[category] += profit;
        totalProfit += profit;
    });

    // Prepare data for Chart.js
    const labels = Object.keys(aggregatedData);
    const profitData = labels.map(label => (aggregatedData[label] / totalProfit) * 100);

    // Colors for the pie chart
    const colors = [
        "#F10096", "#0072f0", "#00B6CB"
    ];

    catbyprofitChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: profitData,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: "transparent",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw.toFixed(2);
                            return `${label}: ${value}%`;
                        },
                    },
                },
                datalabels: {
                    color: "#fff",
                    formatter: function (value, context) {
                        return value.toFixed(2) + '%';
                    },
                    font: {
                        weight: "bold",
                    },
                },
            },
        },
        plugins: [ChartDataLabels], // Include the ChartDataLabels plugin
    });
}
function showCatProfit(){
    document.getElementById("CatProfit").style.display = "block";
}
function closeCatProfit(){
    document.getElementById("CatProfit").style.display = "none";        
}
// =========================
// STATE BY LOWEST SALES
let statelowest_salesTable;
function buatStatebyLowest(data) {
    // Clear previous data if DataTable already initialized
    if (statelowest_salesTable) {
        statelowest_salesTable.destroy();
    }
    const aggregatedData = {};
    data.forEach(item => {
        const state = item.State;
        const sales = parseFloat(item.Sales);
        if (!aggregatedData[state]) {
            aggregatedData[state] = 0;
        }
        aggregatedData[state] += sales;
    });
    
    const sortedData = Object.keys(aggregatedData).map(state => {
        return { state: state, totalSales: aggregatedData[state] };
    }).sort((a, b) => a.totalSales - b.totalSales);
    
    // Populate table with sorted data
    const tbody = $('#statelowest_salesTable tbody');
    tbody.empty();
    sortedData.forEach(item => {
        tbody.append(`
            <tr>
                <td>${item.state}</td>
                <td>$ ${item.totalSales.toLocaleString()}</td>
            </tr>
        `);
    });

    // Initialize DataTable with pagination and search features
    statelowest_salesTable = $('#statelowest_salesTable').DataTable({
        "pageLength": 10,
        "searching": true,
        "ordering": true,
        "order": [[1, 'asc']],
        "pagingType": "full_numbers",
        "dom": '<"top"lf>rt<"bottom"ip><"clear">',
        "language": {
            "paginate": {
                "first": "&#171;",
                "last": "&#187;",
                "next": "&#8250;",
                "previous": "&#8249;"
            }
        }
    });
}
// CITY BY LOWEST PROFIT
let dataTable;
function buatCitybyLowSales(data){
    const aggregatedData = {};
    data.forEach(item => {
        const city = item.City;
        const state = item.State;
        const sales = parseFloat(item.Sales);
        const profit = parseFloat(item.Profit);
        if (!aggregatedData[city]) {
            aggregatedData[city] = { city: city, state: state, totalSales: 0, totalProfit: 0 };
        }
        aggregatedData[city].totalSales += sales;
        aggregatedData[city].totalProfit += profit;
    });

    // const sortedData = Object.keys(aggregatedData).map(city => {
    //     return { city: city, state: state, totalSales: aggregatedData[city].totalSales, totalProfit: aggregatedData[city].totalProfit };
    // }).sort((a, b) => a.totalProfit - b.totalProfit);
    const sortedData = Object.values(aggregatedData).sort((a, b) => a.totalProfit - b.totalProfit);

    // Clear previous data if DataTable already initialized
    if (dataTable) {
        dataTable.clear().destroy();
    }

    // Populate table with sorted data
    const tbody = $('#citylowest_salesTable tbody');
    tbody.empty();
    sortedData.forEach(item => {
        tbody.append(`
            <tr>
                <td>${item.city}</td>
                <td>${item.state}</td>
                <td>$ ${item.totalSales.toLocaleString()}</td>
                <td>$ ${item.totalProfit.toLocaleString()}</td>
            </tr>
        `);
    });
    // Initialize DataTable with pagination and search features
    dataTable = $('#citylowest_salesTable').DataTable({
        "pageLength": 10,
        "searching": true,
        "ordering": true,
        "order": [[3, 'asc']],
        "pagingType": "full_numbers",
        "dom": '<"top"lf>rt<"bottom"ip><"clear">',
        "language": {
            "paginate": {
                "first": "&#171;",
                "last": "&#187;",
                "next": "&#8250;",
                "previous": "&#8249;"
            }
        }
    });
}

function showInsightHeatmap() {
    document.getElementById("insightHeatMap").style.display = "block";
}
function closeInsightHeatmap() {
    document.getElementById("insightHeatMap").style.display = "none";
}

// function buatHeatmap(data){
//     const map = L.map('heatmapChart').setView([37.8, -96], 4);
    
//     var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     })
//     osm.addTo(map);
    
//     //buat data yg masuk dinamis, klo ada data bisa didestroy dulu
//     if (heat) {
//         map.removeLayer(heat);
//     }
//     // Merge filtered sales data with city coordinates
//     const mergedData = mergeDataWithCoordinates(data);
    
//     // Prepare the heatmap data
//     const heatData = mergedData.map(item => [...item.Coordinates, item.Sales]);
//     console.log(heatData);
//     // const heatData = data.map(item => [...item.Coordinates, item.Sales]);
//     // const heatData = data.filter(item => Array.isArray(item.Coordinates) && item.Coordinates.length === 2).map(item => [...item.Coordinates, item.Sales]);

//     heat = L.heatLayer(heatData, {
//         radius: 25,
//         blur: 15,
//         maxZoom: 17,
//         gradient: {0.4: 'green', 0.65: 'yellow', 1: 'red'}
//     }).addTo(map);
// }

// function getUniqueCities(data) {
//     const cityCount = {};
//     data.forEach(item => {
//         const city = item.City;
//         if (cityCount[city]) {
//             cityCount[city]++;
//         } else {
//             cityCount[city] = 1;
//         }
//     });
//     console.log(cityCount)
//     return data.toLocaleString();
// }