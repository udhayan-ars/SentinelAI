
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

        const pageTitleElement = document.getElementById("pageTitle");
        const breadcrumbElement = document.getElementById("breadcrumbPage");

        if (pageTitleElement) {
            pageTitleElement.textContent =
                pageTitles[pageName] || "SentinelAI";
        }

        if (breadcrumbElement) {
            breadcrumbElement.textContent =
                pageTitles[pageName] || "Overview";
        }

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
    // TASK 10 - SECURITY EVENT ACTIVITY CHART
    // WITH INTERACTIVE TIME FILTERS
    // ======================================

    const eventsCanvas = document.getElementById("eventsChart");

    if (eventsCanvas && typeof Chart !== "undefined") {

        const chartPeriods = {

            "24h": {
                labels: [
                    "12 AM", "4 AM", "8 AM",
                    "12 PM", "4 PM", "8 PM"
                ],
                data: [120, 180, 350, 280, 420, 310]
            },

            "7d": {
                labels: [
                    "Mon", "Tue", "Wed",
                    "Thu", "Fri", "Sat", "Sun"
                ],
                data: [1200, 1900, 1500, 2400, 1800, 2800, 2600]
            },

            "30d": {
                labels: [
                    "Week 1", "Week 2",
                    "Week 3", "Week 4"
                ],
                data: [8500, 11200, 9800, 14500]
            }

        };

        const eventsChart = new Chart(eventsCanvas, {

            type: "line",

            data: {

                labels: chartPeriods["24h"].labels,

                datasets: [{
                    label: "Security Events",
                    data: chartPeriods["24h"].data,
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
                            font: {
                                size: 10
                            }
                        }
                    }

                },

                scales: {

                    x: {
                        ticks: {
                            color: "#8192a9"
                        },
                        grid: {
                            color: "rgba(120, 145, 175, 0.08)"
                        }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#8192a9"
                        },
                        grid: {
                            color: "rgba(120, 145, 175, 0.08)"
                        }
                    }

                }

            }

        });

        const chartFilterButtons =
            document.querySelectorAll(".chart-filter");

        chartFilterButtons.forEach(button => {

            button.addEventListener("click", function () {

                const selectedPeriod = this.dataset.period;
                const periodData = chartPeriods[selectedPeriod];

                if (!periodData) {
                    return;
                }

                eventsChart.data.labels = periodData.labels;
                eventsChart.data.datasets[0].data = periodData.data;

                eventsChart.update();

                chartFilterButtons.forEach(filter => {

                    const isActive = filter === this;

                    filter.classList.toggle("active", isActive);

                    filter.setAttribute(
                        "aria-pressed",
                        String(isActive)
                    );

                });

            });

        });

    }


    // ======================================
    // ENHANCED SECURITY SEVERITY CHART
    // ======================================

    const severityCanvas =
        document.getElementById("severityChart");

    if (severityCanvas && typeof Chart !== "undefined") {

        new Chart(severityCanvas, {

            type: "doughnut",

            data: {

                labels: [
                    "Critical",
                    "High",
                    "Medium",
                    "Low"
                ],

                datasets: [{

                    data: [3, 8, 12, 18],

                    backgroundColor: [
                        "#ef4444",
                        "#f97316",
                        "#eab308",
                        "#22c55e"
                    ],

                    borderColor: "#101d30",
                    borderWidth: 4,
                    hoverOffset: 10

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
                            color: "#cbd5e1",
                            padding: 18,
                            usePointStyle: true,
                            pointStyle: "circle",

                            font: {
                                size: 11
                            }
                        }

                    },

                    tooltip: {

                        callbacks: {

                            label: function (context) {

                                const values = context.dataset.data;

                                const total = values.reduce(
                                    (sum, value) => sum + value,
                                    0
                                );

                                const percentage = (
                                    (context.raw / total) * 100
                                ).toFixed(1);

                                return `${context.label}: ${context.raw} alerts (${percentage}%)`;

                            }

                        }

                    }

                }

            }

        });

    }


    // ======================================
    // TASK 12 - ENHANCED ALERT SEARCH
    // ======================================

    const alertSearch =
        document.getElementById("alertSearch");

    const clearAlertSearch =
        document.getElementById("clearAlertSearch");

    const severityFilter =
        document.getElementById("severityFilter");

    const alertsTableBody =
        document.getElementById("alertsTableBody");

    const alertCount =
        document.getElementById("alertCount");

    const noAlertsMessage =
        document.getElementById("noAlertsMessage");

    const alertsTable =
        document.getElementById("alertsTable");

    if (
        alertSearch &&
        severityFilter &&
        alertsTableBody &&
        alertCount &&
        noAlertsMessage &&
        alertsTable
    ) {

        const alertRows = Array.from(
            alertsTableBody.querySelectorAll("tr")
        );

        const totalAlertCount = alertRows.length;

        function filterSecurityAlerts() {

            const searchValue =
                alertSearch.value.trim().toLowerCase();

            const selectedSeverity =
                severityFilter.value.trim().toLowerCase();

            let visibleCount = 0;

            alertRows.forEach(row => {

                const alertText =
                    row.textContent.toLowerCase();

                const rowSeverity =
                    (row.dataset.severity || "").toLowerCase();

                // Search alert type, source IP and other row details
                const matchesSearch =
                    alertText.includes(searchValue);

                // Apply severity filter
                const matchesSeverity =
                    selectedSeverity === "all" ||
                    rowSeverity === selectedSeverity;

                // Combine search and severity conditions
                const shouldDisplay =
                    matchesSearch && matchesSeverity;

                row.hidden = !shouldDisplay;

                if (shouldDisplay) {
                    visibleCount++;
                }

            });

            // UPDATE ALERT COUNT

            alertCount.textContent =
                `Showing ${visibleCount} of ${totalAlertCount} alerts`;

            // SHOW OR HIDE NO RESULTS MESSAGE

            const noResults = visibleCount === 0;

            noAlertsMessage.hidden = !noResults;
            alertsTable.hidden = noResults;

            // SHOW CLEAR BUTTON ONLY WHEN SEARCH HAS TEXT

            if (clearAlertSearch) {
                clearAlertSearch.hidden = searchValue.length === 0;
            }

        }

        // REAL-TIME SEARCH WHILE TYPING

        alertSearch.addEventListener(
            "input",
            filterSecurityAlerts
        );

        // FILTER BY SEVERITY

        severityFilter.addEventListener(
            "change",
            filterSecurityAlerts
        );

        // CLEAR SEARCH BUTTON

        if (clearAlertSearch) {

            clearAlertSearch.addEventListener("click", function () {

                alertSearch.value = "";

                filterSecurityAlerts();

                alertSearch.focus();

            });

        }

        // INITIAL ALERT COUNT AND FILTER STATE

        filterSecurityAlerts();

    }


    // ======================================
    // TOTAL EVENTS COUNTER ANIMATION
    // ======================================

    const totalEventsElement =
        document.getElementById("totalEvents");

    if (totalEventsElement) {

        const targetValue = 12480;
        const duration = 1500;
        const startTime = performance.now();

        function animateTotalEvents(currentTime) {

            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentValue = Math.floor(
                targetValue * easedProgress
            );

            totalEventsElement.textContent =
                currentValue.toLocaleString("en-US");

            if (progress < 1) {
                requestAnimationFrame(animateTotalEvents);
            }

        }

        requestAnimationFrame(animateTotalEvents);

    }


    // ======================================
    // ACTIVE ALERTS COUNTER ANIMATION
    // ======================================

    const activeAlertsElement =
        document.getElementById("activeAlerts");

    if (activeAlertsElement) {

        const targetAlerts = 24;
        const duration = 1200;
        const startTime = performance.now();

        function animateActiveAlerts(currentTime) {

            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentValue = Math.floor(
                targetAlerts * easedProgress
            );

            activeAlertsElement.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animateActiveAlerts);
            }

        }

        requestAnimationFrame(animateActiveAlerts);

    }


    // ======================================
    // CRITICAL INCIDENTS COUNTER ANIMATION
    // ======================================

    const criticalIncidentsElement =
        document.getElementById("criticalIncidents");

    if (criticalIncidentsElement) {

        const targetIncidents = 3;
        const duration = 1200;
        const startTime = performance.now();

        function animateCriticalIncidents(currentTime) {

            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentValue = Math.floor(
                targetIncidents * easedProgress
            );

            criticalIncidentsElement.textContent =
                String(currentValue).padStart(2, "0");

            if (progress < 1) {
                requestAnimationFrame(animateCriticalIncidents);
            }

        }

        requestAnimationFrame(animateCriticalIncidents);

    }


    // ======================================
    // DASHBOARD INITIALIZATION COMPLETE
    // ======================================

    console.log(
        "SentinelAI dashboard initialized successfully."
    );

});
