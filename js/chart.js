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

    document.getElementById("sales-summary").textContent = `$${totalSales.toLocaleString()}`;
    document.getElementById("profit-summary").textContent = `$${totalProfit.toLocaleString()}`;
    document.getElementById("order-summary").textContent = `${numOrders.toLocaleString()}`;
    document.getElementById("cust-summary").textContent = `${numCust.toLocaleString()}`;
    document.getElementById("state-summary").textContent = `${numState.toLocaleString()}`;

    //update chart
    buatTotalSalesbyCatAndSeg(data); // total-sales-chart
    buatSalesAndProfitbySubCat(data); // sales-profit-chart
	buatCitybyLowSales(data); // city-lowest-sales-chart
	buatProfitbyRegion(data); // city-lowest-sales-chart
	buatDiskonAndKuantiti(data); // city-lowest-sales-chart
	buatHeatmap(data); // city-lowest-sales-chart
	buatABSnAOVinSeg(data); // city-lowest-sales-chart

    // createBestSellingPizzaSizeChart(data);
    // createAveragePurchasedPriceChart(data);
    // createDailyPizzaSalesTrendChart(data);
    // createTop5BestSellingPizzaTypeChart(data)
    // createTop5LeastSellingPizzaTypeChart(data)
}


// let bestSellingPizzaSizeChart;
// function createBestSellingPizzaSizeChart(data) {
//   const ctx = document.getElementById("bestSellingPizzaSizeChart").getContext("2d");

//   if (bestSellingPizzaSizeChart) {
//     bestSellingPizzaSizeChart.destroy(); // Destroy previous chart instance if it exists
//   }

//   const pizzaSizes = [...new Set(data.map((item) => item.Size))];
//   const sizeSales = pizzaSizes.map((size) => {
//     return data.filter((item) => item.Size === size).reduce((total, item) => total + parseFloat(item.Price.replace("$", "")) * item.Quantity, 0);
//   });

//   const sizeColors = {
//     S: "#AF672D",
//     M: "#D3B786",
//     L: "#886839",
//     XL: "#E4B455",
//   };

//   const colors = pizzaSizes.map((size) => sizeColors[size] || "#000000");

//   bestSellingPizzaSizeChart = new Chart(ctx, {
//     type: "pie",
//     data: {
//       labels: pizzaSizes,
//       datasets: [
//         {
//           label: "Total Sales",
//           data: sizeSales,
//           backgroundColor: colors,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           position: "top",
//         },
//         tooltip: {
//           callbacks: {
//             label: function (context) {
//               const label = context.label || "";
//               const value = context.raw || 0;
//               const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
//               const percentage = ((value / total) * 100).toFixed(2);
//               return `${label}: $${value.toFixed(2)} (${percentage}%)`;
//             },
//           },
//         },
//         datalabels: {
//           formatter: (value, context) => {
//             const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
//             const percentage = ((value / total) * 100).toFixed(2);
//             return `${percentage}%`;
//           },
//           color: "#fff",
//           labels: {
//             title: {
//               font: {
//                 weight: "bold",
//               },
//             },
//           },
//         },
//       },
//     },
//     plugins: [ChartDataLabels],
//   });
// }

// let averagePurchasedPriceChart;
// function createAveragePurchasedPriceChart(data) {
//   const ctx = document.getElementById("averagePurchasedPriceChart").getContext("2d");

//   if (averagePurchasedPriceChart) {
//     averagePurchasedPriceChart.destroy();
//   }

//   const priceRanges = {
//     "$9.75 - $13.99": { min: 9.75, max: 13.99 },
//     "$14 - $17.99": { min: 14, max: 17.99 },
//     "$18 - $21.99": { min: 18, max: 21.99 },
//     "$22 - $25.50": { min: 22, max: 25.5 },
//   };

//   const rangeQuantities = {
//     "$9.75 - $13.99": 0,
//     "$14 - $17.99": 0,
//     "$18 - $21.99": 0,
//     "$22 - $25.50": 0,
//   };

//   data.forEach((item) => {
//     const price = parseFloat(item["Price"].replace("$", ""));
//     for (const range in priceRanges) {
//       if (price >= priceRanges[range].min && price <= priceRanges[range].max) {
//         rangeQuantities[range] += item.Quantity;
//         break;
//       }
//     }
//   });

//   const labels = Object.keys(rangeQuantities);
//   const quantities = Object.values(rangeQuantities);

//   // Hapus kategori 'Other' jika tidak ada nilai di dalamnya
//   const otherIndex = labels.indexOf("Other");
//   if (otherIndex !== -1 && quantities[otherIndex] === 0) {
//     labels.splice(otherIndex, 1);
//     quantities.splice(otherIndex, 1);
//   }

//   let = tickColor = "#000";
//   if (document.body.classList.contains("dark")) {
//     tickColor = "#fff";
//   }

//   averagePurchasedPriceChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: "Quantity",
//           data: quantities,
//           backgroundColor: "#d3b786",
//           borderColor: "transparent", // Remove border from bar chart
//           borderWidth: 0,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           display: false,
//         },
//         tooltip: {
//           callbacks: {
//             label: function (context) {
//               return `${context.label}: ${context.raw.toLocaleString()}`;
//             },
//           },
//         },
//         datalabels: {
//           color: "#fff",
//           anchor: "center",
//           align: "center",
//           formatter: function (value) {
//             return value.toLocaleString();
//           },
//           font: {
//             weight: "bold",
//           },
//         },
//       },
//       scales: {
//         x: {
//           title: {
//             // color : '#fff',
//             // display: true,
//             // text: 'Price Range',
//           },
//           ticks: {
//             color: tickColor, // Set color of x-axis ticks to white
//           },
//           grid: {
//             display: false, // Hide x-axis grid lines
//           },
//         },
//         y: {
//           title: {
//             // color : '#fff',
//             // display: true,
//             // text: 'Quantity',
//           },
//           ticks: {
//             stepSize: 5000,
//             beginAtZero: true,
//             color: tickColor,
//             callback: function (value) {
//               return value.toLocaleString();
//             },
//           },
//           grid: {
//             display: false, // Hide x-axis grid lines
//           },
//         },
//       },
//     },
//     plugins: [ChartDataLabels],
//   });
// }

// let dailyPizzaSalesTrendChart;
// function createDailyPizzaSalesTrendChart(data) {
//   const ctx = document.getElementById("dailyPizzaSalesTrendChart").getContext("2d");

//   if (dailyPizzaSalesTrendChart) {
//     dailyPizzaSalesTrendChart.destroy();
//   }

//   // Process data to get daily sales trend
//   const dailySales = data.reduce((acc, item) => {
//     const day = item["Day"];
//     const price = parseFloat(item["Price"].replace("$", ""));
//     if (!acc[day]) {
//       acc[day] = 0;
//     }
//     acc[day] += price * item.Quantity;
//     return acc;
//   }, {});

//   const labels = Object.keys(dailySales).sort();
//   const sales = labels.map((day) => dailySales[day]);

//   let tickColor = "#000";
//   if (document.body.classList.contains("dark")) {
//     tickColor = "#fff";
//   }

//   dailyPizzaSalesTrendChart = new Chart(ctx, {
//     type: "line",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: "Total Sales ($)",
//           data: sales,
//           backgroundColor: "transparent",
//           borderColor: "#E4B455",
//           borderWidth: 2,
//           fill: true,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           display: false,
//         },
//         tooltip: {
//           callbacks: {
//             label: function (context) {
//               return `${context.label}: ${context.raw.toLocaleString()}`;
//             },
//             // label: function (context) {
//             //   const value = Math.round(context.raw || 0).toLocaleString();
//             //   return `${value}`;
//             // },
//           },
//         },
//         datalabels: {
//           color: tickColor,
//           anchor: "start",
//           align: "start",
//           formatter: function (value) {
//             return `${value.toLocaleString()}`;
//           },
//           // formatter: (value) => `${Math.round(value).toLocaleString()}`,
//           font: {
//             weight: "bold",
//           },
//         },
//       },
//       scales: {
//         x: {
//           ticks: {
//             color: tickColor,
//           },
//           grid: {
//             display: false,
//           },
//         },
//         y: {
//           // title: {
//           //   display: true,
//           //   text: 'Total Sales ($)',
//           //   color: tickColor
//           // },
//           ticks: {
//             stepSize: 50000, // Set step size to 50,000
//             beginAtZero: true,
//             color: tickColor,
//             callback: function (value) {
//               return `${value.toLocaleString()}`;
//             },
//           },
//           grid: {
//             display: false,
//           },
//         },
//       },
//     },
//     plugins: [ChartDataLabels],
//   });
// }

// let top5BestSellingPizzaTypeChart;
// function createTop5BestSellingPizzaTypeChart(data) {
//   const ctx = document.getElementById("top5BestSellingPizzaTypeChart").getContext("2d");

//   if (top5BestSellingPizzaTypeChart) {
//     top5BestSellingPizzaTypeChart.destroy(); // Destroy previous chart instance if it exists
//   }

//   const pizzaTypes = [...new Set(data.map((item) => item["Pizza ID"]))];
//   const typeSales = pizzaTypes.map((type) => {
//     return data.filter((item) => item["Pizza ID"] === type).reduce((total, item) => total + parseFloat(item["Price"].replace("$", "")) * item["Quantity"], 0);
//   });

//   const top5Data = pizzaTypes
//     .map((type, index) => ({ type, sales: typeSales[index] }))
//     .sort((a, b) => b.sales - a.sales)
//     .slice(0, 5);

//   const top5Labels = top5Data.map((item) => item.type);
//   const top5Sales = top5Data.map((item) => item.sales);

//   let tickColor = "#000";
//   if (document.body.classList.contains("dark")) {
//     tickColor = "#fff";
//   }

//   top5BestSellingPizzaTypeChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: top5Labels,
//       datasets: [
//         {
//           label: "Total Sales",
//           data: top5Sales,
//           backgroundColor: "#AF672D",
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       scales: {
//         x: {
//           beginAtZero: true,
//           ticks: {
//             color: tickColor,
//           },
//           grid: {
//             display: false,
//           },
//         },
//         y: {
//           beginAtZero: true,
//           ticks: {
//             stepSize: 10000,
//             color: tickColor,
//             callback: function (value) {
//               return value.toLocaleString();
//             }
//           },
//           grid: {
//             display: false,
//           },
//         },
//       },
//       plugins: {
//         legend: {
//           display: false,
//         },
//         tooltip: {
//           callbacks: {
//             label: function (context) {
//               const value = Math.round(context.raw || 0).toLocaleString();
//               return `${value}`;
//             },
//           },
//         },
//         datalabels: {
//           anchor: 'center',
//           align: 'center',
//           formatter: (value) => `${Math.round(value).toLocaleString()}`,
//           color: '#fff',
//           font: {
//             weight: 'bold',
//           },
//         },
//       },
//     },
//     plugins: [ChartDataLabels],
//   });
// }

// let top5LeastSellingPizzaTypeChart;
// function createTop5LeastSellingPizzaTypeChart(data) {
//   const ctx = document.getElementById("top5LeastSellingPizzaTypeChart").getContext("2d");

//   if (top5LeastSellingPizzaTypeChart) {
//     top5LeastSellingPizzaTypeChart.destroy(); // Destroy previous chart instance if it exists
//   }

//   const pizzaTypes = [...new Set(data.map((item) => item["Pizza ID"]))];
//   const typeSales = pizzaTypes.map((type) => {
//     return data.filter((item) => item["Pizza ID"] === type).reduce((total, item) => total + parseFloat(item["Price"].replace("$", "")) * item["Quantity"], 0);
//   });

//   const top5Data = pizzaTypes
//     .map((type, index) => ({ type, sales: typeSales[index] }))
//     .sort((a, b) => a.sales - b.sales)
//     .slice(0, 5);

//   const top5Labels = top5Data.map((item) => item.type);
//   const top5Sales = top5Data.map((item) => item.sales);

//   let tickColor = "#000";
//   if (document.body.classList.contains("dark")) {
//     tickColor = "#fff";
//   }

//   top5LeastSellingPizzaTypeChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: top5Labels,
//       datasets: [
//         {
//           label: "Total Sales",
//           data: top5Sales,
//           backgroundColor: "#886839",
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       scales: {
//         x: {
//           beginAtZero: true,
//           ticks: {
//             color: tickColor,
//           }
//         },
//         y: {
//           beginAtZero: true,
//           ticks: {
//             stepSize: 1000,
//             color: tickColor,
//             callback: function (value) {
//               return value.toLocaleString();
//             },
//           },
//           grid: {
//             display: false,
//           },
//         },
//       },
//       plugins: {
//         legend: {
//           display: false,
//         },
//         tooltip: {
//           callbacks: {
//             label: function (context) {
//               const value = Math.round(context.raw || 0).toLocaleString();
//               return `${value}`;
//             },
//           },
//         },
//         datalabels: {
//           anchor: 'center',
//           align: 'center',
//           formatter: (value) => `${Math.round(value).toLocaleString()}`,
//           color: '#fff',
//           font: {
//             weight: 'bold',
//           },
//         },
//       },
//     },
//     plugins: [ChartDataLabels],
//   });
// }
