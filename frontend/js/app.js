
// ==========================================
// SENTINELAI - DASHBOARD INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ======================================
    // SIDEBAR NAVIGATION
    // ======================================

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

        pageSections.forEach(section => {
            section.hidden = true;
        });

        selectedPage.hidden = false;

        navigationLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.page === pageName
            );
        });

        document.getElementById("pageTitle").textContent =
            pageTitles[pageName] || "SentinelAI";

        document.getElementById("breadcrumbPage").textContent =
            pageTitles[pageName] || "Overview";

        if (window.location.hash !== "#" + pageName) {
            history.replaceState(null, "", "#" + pageName);
        }
    }

    navigationLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showPage(this.dataset.page);
        });
    });

    document.querySelectorAll(".view-all[data-page]").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showPage(this.dataset.page);
        });
    });

    const initialPage = window.location.hash.replace("#", "");

    if (initialPage && document.getElementById(initialPage)) {
        showPage(initialPage);
    } else {
        showPage("overview");
    }

    window.addEventListener("hashchange", function () {
        const page = window.location.hash.replace("#", "");

        if (document.getElementById(page)) {
            showPage(page);
        }
    });


    // ======================================
    // TOPBAR SEARCH FUNCTIONALITY
    // ======================================

    const topbarSearch = document.getElementById("topbarSearch");

    if (topbarSearch) {

        topbarSearch.addEventListener("keydown", function (event) {

            if (event.key !== "Enter") {
                return;
            }

            const query = this.value.trim().toLowerCase();

            if (!query) {
                return;
            }

            const matchingLink = Array.from(navigationLinks).find(link =>
                link.textContent.trim().toLowerCase().includes(query)
            );

            if (matchingLink) {

                showPage(matchingLink.dataset.page);
                this.value = "";

            } else {

                alert("No matching dashboard page found.");

            }

        });

    }


    // ======================================
    // NOTIFICATION BUTTON
    // ======================================

    const notificationButton =
        document.getElementById("notificationButton");

    if (notificationButton) {

        notificationButton.addEventListener("click", function () {

            showPage("alerts");

        });

    }


    // ======================================
    // SECURITY EVENT ACTIVITY CHART
    // ======================================

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
                        grid: {
                            color: "rgba(120, 145, 175, 0.08)"
                        }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: { color: "#8192a9" },
                        grid: {
                            color: "rgba(120, 145, 175, 0.08)"
                        }
                    }
                }
            }

        });

    }


    // ======================================
    // ALERT SEVERITY CHART
    // ======================================

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

    console.log("SentinelAI dashboard initialized successfully.");

});
