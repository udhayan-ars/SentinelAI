
// ==========================================
// SENTINELAI - SIDEBAR NAVIGATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const navigationLinks = document.querySelectorAll(".nav-link[data-page]");
    const pageSections = document.querySelectorAll(".page-section");

    const pageTitles = {
        overview: "Security Overview",
        monitoring: "Live Monitoring",
        events: "Security Events",
        alerts: "Threat Alerts",
        investigation: "AI Investigation",
        mitre: "MITRE ATT&CK",
        timeline: "Attack Timeline",
        incidents: "Incident Management",
        response: "Response Center",
        reports: "Reports",
        settings: "Settings"
    };

    function showPage(pageName) {

        const selectedPage = document.getElementById(pageName);

        if (!selectedPage) {
            console.warn("Page not found:", pageName);
            return;
        }

        // Hide all pages
        pageSections.forEach(section => {
            section.hidden = true;
        });

        // Show selected page
        selectedPage.hidden = false;

        // Update active sidebar menu
        navigationLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.page === pageName
            );
        });

        // Update page heading
        const title = pageTitles[pageName] || "SentinelAI";

        document.getElementById("pageTitle").textContent = title;

        document.getElementById("breadcrumbPage").textContent =
            pageName.charAt(0).toUpperCase() + pageName.slice(1);

        // Update browser URL hash
        if (window.location.hash !== "#" + pageName) {
            history.replaceState(null, "", "#" + pageName);
        }
    }

    // Handle sidebar clicks
    navigationLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const selectedPage = this.dataset.page;

            showPage(selectedPage);

        });

    });

    // Handle View All Alerts link
    document.querySelectorAll(".view-all[data-page]").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showPage(this.dataset.page);
        });
    });

    // Load page from URL hash or default to overview
    const initialPage = window.location.hash.replace("#", "");

    if (initialPage && document.getElementById(initialPage)) {
        showPage(initialPage);
    } else {
        showPage("overview");
    }

    // Handle browser back and forward
    window.addEventListener("hashchange", function () {
        const page = window.location.hash.replace("#", "");

        if (document.getElementById(page)) {
            showPage(page);
        }
    });

    console.log("SentinelAI sidebar navigation initialized.");

});


// ==========================================
// SENTINELAI - SECURITY EVENT CHART
// ==========================================

const eventsCanvas = document.getElementById("eventsChart");

if (eventsCanvas && typeof Chart !== "undefined") {

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
                    labels: {
                        color: "#9aabc1",
                        font: { size: 10 }
                    }
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

}


// ==========================================
// SENTINELAI - ALERT SEVERITY CHART
// ==========================================

const severityCanvas = document.getElementById("severityChart");

if (severityCanvas && typeof Chart !== "undefined") {

    new Chart(severityCanvas, {
        type: "doughnut",

        data: {
            labels: ["Critical", "High", "Medium", "Low"],

            datasets: [{
                data: [3, 7, 9, 5],
                backgroundColor: [
                    "#ef4444",
                    "#f97316",
                    "#eab308",
                    "#3b82f6"
                ],
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

}

console.log("SentinelAI dashboard initialized.");
