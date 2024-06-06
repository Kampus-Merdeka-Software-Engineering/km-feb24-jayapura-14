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
            // if (!selectedFilters["Region"].length || selectedFilters["Region"].includes(item["Region"])) {
            //     Stet.add(item["State"]);
            // }
            // if (!selectedFilters["State"].length || selectedFilters["State"].includes(item["State"])) {
            //     Reg.add(item["Region"]);
            // }
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
    // ABS = Sum of Quantity / count_distinct(Order_ID)
    let abs = 0;
    if (data.length > 0) {
        const quantity = data.reduce((total, item) => {
            return total + parseFloat(item["Quantity"]);
        }, 0);
        abs = quantity / numOrders;
    }
    // AOV = total Sales / count_distinct(Order_ID)
    let aov = 0;
    if (data.length > 0){
        aov = totalSales / numOrders;
    }
    console.log(abs, aov);
    
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
	buatHeatmap(data); // heatMapChart
}

let total_salesChart;
function buatTotalSalesbyCatAndSeg(data) {
    const ctx = document.getElementById("total_salesChart").getContext("2d");
    if (total_salesChart) {
        total_salesChart.destroy();
    }
    // buat object
    const aggregatedData = {
        "Furniture": { "Consumer": 0, "Corporate": 0, "Home Office": 0 },
        "Office Supplies": { "Consumer": 0, "Corporate": 0, "Home Office": 0 },
        "Technology": { "Consumer": 0, "Corporate": 0, "Home Office": 0 }
    };

    data.forEach(item => {
        const category = item.Category;
        const segment = item.Segment;
        const sales = parseFloat(item.Sales);

        if (aggregatedData[category] && aggregatedData[category][segment] !== undefined) {
            aggregatedData[category][segment] += sales;
        }
    });

    const labels = ["Furniture", "Office Supplies", "Technology"];
    const segments = ["Consumer", "Corporate", "Home Office"];
    const datasets = segments.map(segment => {
        return {
            label: segment,
            data: labels.map(label => aggregatedData[label][segment]),
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
    // let = tickColor = "#000";
    // if (document.body.classList.contains("dark")) {
    //     tickColor = "#fff";
    // }
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
                    color: "#fff",
                    anchor: "center",
                    align: "center",
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
                            return value.toLocaleString();
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
// SALES & PROFIT BY SUB CATEGORY
let sales_profitChart;
function buatSalesAndProfitbySubCat(data) {
    const ctx = document.getElementById("sales_profitChart").getContext("2d");
    if (sales_profitChart) {
        sales_profitChart.destroy();
    }
    const aggregatedData = {};
    // Aggregate the sales and profit data
    data.forEach(item => {
        const subCategory = item["Sub_Category"];
        const sales = parseFloat(item.Sales);
        const profit = parseFloat(item.Profit);
        if (!aggregatedData[subCategory]) {
            aggregatedData[subCategory] = { sales: 0, profit: 0 };
        }

        aggregatedData[subCategory].sales += sales;
        aggregatedData[subCategory].profit += profit;
    });

    // Prepare data for Chart.js
    const labels = Object.keys(aggregatedData);
    const salesData = labels.map(label => aggregatedData[label].sales);
    const profitData = labels.map(label => aggregatedData[label].profit);
    const datasets = [
        {
            label: 'Sales',
            data: salesData,
            backgroundColor: "#F10096",
            borderColor: "transparent",
            borderWidth: 1,
            // yAxisID: 'y-sales',
        },
        {
            label: 'Profit',
            data: profitData,
            backgroundColor: "#0072f0",
            borderColor: "transparent",
            borderWidth: 1,
            // yAxisID: 'y-profit',
        }
    ];
    sales_profitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            indexAxis: 'y', // This makes the chart horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true, // Display the legend
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
                        text: 'Amount'
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return value.toLocaleString();
                        },
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Sub-Category'
                    },
                    stacked: true, // Stack the bars horizontally
                    ticks: {
                        autoSkip: false,
                        beginAtZero: true,
                    },
                }
            },
        },
        plugins: [ChartDataLabels], // Include the ChartDataLabels plugin
    });
}
// DISKON KUANTITI
let diskon_quantityChart;
function buatDiskonAndKuantiti(data) {
    const ctx = document.getElementById("diskon_quantityChart").getContext("2d");
    if (diskon_quantityChart) {
        diskon_quantityChart.destroy();
    }

    const aggregatedData = {};
    // buat urutin bulan
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
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

    const labels = months;
    const discountData = labels.map(label => aggregatedData[label].discount);
    const quantityData = labels.map(label => aggregatedData[label].quantity);

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
}
// ABS AOV
let abs_aovChart;
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
                    anchor: "center",
                    align: "center",
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
}
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
        const sales = parseFloat(item.Sales);
        const profit = parseFloat(item.Profit);
        if (!aggregatedData[city]) {
            aggregatedData[city] = { totalSales: 0, totalProfit: 0 };
        }
        aggregatedData[city].totalSales += sales;
        aggregatedData[city].totalProfit += profit;
    });

    const sortedData = Object.keys(aggregatedData).map(city => {
        return { city: city, totalSales: aggregatedData[city].totalSales, totalProfit: aggregatedData[city].totalProfit };
    }).sort((a, b) => a.totalProfit - b.totalProfit);

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
        "order": [[2, 'asc']],
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

// HEAT MAP
let heat;
function buatHeatmap(data){
    const map = L.map('heatmapChart').setView([37.8, -96], 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    //buat data yg masuk dinamis, klo ada data bisa didestroy dulu
    if (heat) {
        map.removeLayer(heat);
    }
    // const heatData = data.map(item => [...item.Coordinates, item.Sales]);
    const heatData = data.filter(item => Array.isArray(item.Coordinates) && item.Coordinates.length === 2).map(item => [...item.Coordinates, item.Sales]);

    heat = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {0.4: 'green', 0.65: 'yellow', 1: 'red'}
    }).addTo(map);
}