
// SentinelAI Dashboard - Demo Data
// Replace these sample values when the Flask API is integrated.

const eventsCanvas = document.getElementById("eventsChart");

new Chart(eventsCanvas, {
    type: "line",
    data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
            label: "Security Events",
            data: [1200, 1900, 1500, 2400, 1800, 2800, 2600],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.12)",
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#22d3ee"
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: "#9aabc1", font: { size: 10 } }
            }
        },
        scales: {
            x: {
                ticks: { color: "#8192a9" },
                grid: { color: "rgba(120, 145, 175, 0.08)" }
            },
            y: {
                beginAtZero: true,
                ticks: { color: "#8192a9" },
                grid: { color: "rgba(120, 145, 175, 0.08)" }
            }
        }
    }
});

const severityCanvas = document.getElementById("severityChart");

new Chart(severityCanvas, {
    type: "doughnut",
    data: {
        labels: ["Critical", "High", "Medium", "Low"],
        datasets: [{
            data: [3, 7, 9, 5],
            backgroundColor: ["#ef4444", "#f97316", "#eab308", "#3b82f6"],
            borderColor: "#101d30",
            borderWidth: 4,
            hoverOffset: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#9aabc1",
                    padding: 17,
                    usePointStyle: true,
                    font: { size: 10 }
                }
            }
        }
    }
});

console.log("SentinelAI dashboard initialized with demo data.");
