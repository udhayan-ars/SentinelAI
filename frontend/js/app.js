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
        settings: "Settings",
        alertDetails: "Alert Details"
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

            const isInitiallyActive =
                button.dataset.period === "24h";

            button.classList.toggle("active", isInitiallyActive);
            button.setAttribute(
                "aria-pressed",
                String(isInitiallyActive)
            );

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

                const searchableRow = row.cloneNode(true);

                const searchStatus =
                    searchableRow.querySelector(".status-select");

                if (searchStatus) {
                    searchStatus.replaceWith(
                        document.createTextNode(
                            searchStatus.selectedOptions[0]?.textContent || ""
                        )
                    );
                }

                const alertText =
                    searchableRow.textContent.toLowerCase();

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
    // TASK 13 - ALERT DETAILS PAGE
    // ======================================

    const alertDetailsData = {

        "ALT-001": {
            destinationIP: "192.168.1.1",
            description:
                "Multiple failed login attempts were detected from the same source IP address. This activity may indicate a brute-force login attempt.",
            steps: [
                "Review the failed login events and identify the targeted account.",
                "Check whether any successful login occurred after the failures.",
                "Investigate the source IP address and related activity.",
                "Check for similar login attempts against other accounts.",
                "Escalate the incident if suspicious activity is confirmed."
            ]
        },

        "ALT-002": {
            destinationIP: "192.168.1.50",
            description:
                "Suspicious PowerShell execution was detected. Review the command and process activity to determine whether it is legitimate or malicious.",
            steps: [
                "Review the PowerShell command-line arguments.",
                "Identify the parent process and executing user.",
                "Check related endpoint security alerts.",
                "Look for suspicious network connections or downloaded files.",
                "Escalate if malicious execution is confirmed."
            ]
        },

        "ALT-003": {
            destinationIP: "10.0.0.1",
            description:
                "Port scanning activity was detected from the source IP. This may indicate network reconnaissance against internal systems.",
            steps: [
                "Identify the destination host and scanned ports.",
                "Review firewall logs for blocked and allowed connections.",
                "Check whether the source IP has generated other alerts.",
                "Determine whether the scanning activity was authorized.",
                "Escalate any unauthorized reconnaissance activity."
            ]
        },

        "ALT-004": {
            destinationIP: "192.168.1.1",
            description:
                "An unusual network connection was detected. Review the destination and connection history to determine whether the activity is expected.",
            steps: [
                "Review the destination IP and connection details.",
                "Check DNS and network logs for related activity.",
                "Identify the process responsible for the connection.",
                "Compare the activity with normal network behavior.",
                "Document the investigation findings."
            ]
        }

    };

    // Reuse the existing alerts table body
    const detailsTableBody = alertsTableBody;

    function setDetailText(elementId, value) {

        const element = document.getElementById(elementId);

        if (element) {
            element.textContent = value;
        }

    }

    function openAlertDetails(row) {

        const alertId = row.dataset.alertId;
        const details = alertDetailsData[alertId];

        if (!details) {
            console.warn("Alert details not found:", alertId);
            return;
        }

        const cells = row.querySelectorAll("td");

        const alertTitle =
            cells[0]?.textContent.trim() || "Unknown Alert";

        const sourceIP =
            cells[1]?.textContent.trim() || "Unknown";

        const severity =
            cells[2]?.textContent.trim() || "Unknown";

        const timestamp =
            cells[3]?.textContent.trim() || "Unknown";

        const status =
            cells[4]?.querySelector(".status-select")
                ?.selectedOptions[0]?.textContent.trim() ||
            cells[4]?.textContent.trim() ||
            "Unknown";

        // ALERT INFORMATION

        setDetailText("detailAlertTitle", alertTitle);

        setDetailText(
            "detailAlertId",
            `Alert ID: ${alertId}`
        );

        setDetailText("detailSourceIP", sourceIP);

        setDetailText(
            "detailDestinationIP",
            details.destinationIP
        );

        setDetailText("detailTimestamp", timestamp);

        // STATUS BADGE

        const statusElement =
            document.getElementById("detailStatus");

        if (statusElement) {

            const normalizedStatus =
                status.toLowerCase().replace(/\s+/g, "-");

            statusElement.textContent = status;

            statusElement.className =
                `status ${normalizedStatus}`;

        }

        // SEVERITY BADGE

        const severityElement =
            document.getElementById("detailSeverity");

        if (severityElement) {

            const normalizedSeverity =
                severity.toLowerCase().replace(/\s+/g, "-");

            severityElement.textContent = severity;

            severityElement.className =
                `severity ${normalizedSeverity}`;

        }

        // ALERT DESCRIPTION

        setDetailText(
            "detailDescription",
            details.description
        );

        // INVESTIGATION STEPS

        const stepsList =
            document.getElementById("detailInvestigationSteps");

        if (stepsList) {

            stepsList.replaceChildren();

            details.steps.forEach(step => {

                const listItem = document.createElement("li");

                listItem.textContent = step;

                stepsList.appendChild(listItem);

            });

        }

        showPage("alertDetails");

    }


    if (detailsTableBody) {

        const detailRows =
            detailsTableBody.querySelectorAll("tr");

        // ASSIGN ALERT IDs WITHOUT OVERWRITING EXISTING IDs

        detailRows.forEach((row, index) => {

            const alertId =
                row.dataset.alertId ||
                `ALT-${String(index + 1).padStart(3, "0")}`;

            row.dataset.alertId = alertId;

            row.tabIndex = 0;

            row.style.cursor = "pointer";

            row.setAttribute(
                "aria-label",
                `View details for alert ${alertId}`
            );

        });


        // OPEN DETAILS WHEN ROW IS CLICKED

        detailsTableBody.addEventListener("click", event => {

            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            // Do not open details when status dropdown is clicked

            if (target.closest(".status-select")) {
                return;
            }

            const row =
                target.closest("tr[data-alert-id]");

            if (row) {
                openAlertDetails(row);
            }

        });


        // KEYBOARD ACCESSIBILITY

        detailsTableBody.addEventListener("keydown", event => {

            if (
                (event.key === "Enter" || event.key === " ") &&
                event.target.matches("tr[data-alert-id]")
            ) {

                event.preventDefault();

                openAlertDetails(event.target);

            }

        });

    }


    // ======================================
    // BACK TO ALERTS BUTTON
    // ======================================

    const backToAlertsButton =
        document.getElementById("backToAlerts");

    if (backToAlertsButton) {

        backToAlertsButton.addEventListener("click", () => {

            showPage("overview");

            document.getElementById("alertsTable")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        });

    }


    // ======================================
    // TASK 14 - ALERT STATUS MANAGEMENT
    // ======================================

    const alertStatusStorageKey =
        "sentinelAI.alertStatuses";

    const validAlertStatuses = [
        "open",
        "investigating",
        "resolved"
    ];


    // LOAD SAVED ALERT STATUSES

    function loadAlertStatuses() {

        try {

            const savedStatuses = JSON.parse(
                localStorage.getItem(alertStatusStorageKey) || "{}"
            );

            return savedStatuses &&
                typeof savedStatuses === "object" &&
                !Array.isArray(savedStatuses)
                ? savedStatuses
                : {};

        } catch (error) {

            console.warn(
                "Unable to load saved alert statuses:",
                error
            );

            return {};

        }

    }

    let savedAlertStatuses = loadAlertStatuses();


    // CREATE STATUS SUMMARY ELEMENT

    const alertStatusSummary =
        document.createElement("div");

    alertStatusSummary.id = "alertStatusSummary";

    alertStatusSummary.className = "alert-status-summary";

    alertStatusSummary.setAttribute(
        "aria-live",
        "polite"
    );

    if (alertsTable) {

        alertsTable.insertAdjacentElement(
            "beforebegin",
            alertStatusSummary
        );

    }


    // UPDATE STATUS SUMMARY COUNTS

    function updateAlertStatusSummary() {

        const statusCounts = {
            open: 0,
            investigating: 0,
            resolved: 0
        };

        if (detailsTableBody) {

            detailsTableBody
                .querySelectorAll(".status-select")
                .forEach(select => {

                    if (statusCounts[select.value] !== undefined) {
                        statusCounts[select.value]++;
                    }

                });

        }

        alertStatusSummary.textContent =
            `Open: ${statusCounts.open} | ` +
            `Investigating: ${statusCounts.investigating} | ` +
            `Resolved: ${statusCounts.resolved}`;

    }


    // SAVE ALERT STATUSES TO LOCAL STORAGE

    function saveAlertStatuses() {

        try {

            localStorage.setItem(
                alertStatusStorageKey,
                JSON.stringify(savedAlertStatuses)
            );

        } catch (error) {

            console.warn(
                "Unable to save alert statuses:",
                error
            );

        }

    }


    if (detailsTableBody) {

        const statusRows =
            detailsTableBody.querySelectorAll("tr[data-alert-id]");


        // RESTORE SAVED STATUSES WHEN PAGE LOADS

        statusRows.forEach(row => {

            const alertId = row.dataset.alertId;

            const statusSelect =
                row.querySelector(".status-select");

            if (!statusSelect) {
                return;
            }

            const savedStatus =
                savedAlertStatuses[alertId];

            if (validAlertStatuses.includes(savedStatus)) {
                statusSelect.value = savedStatus;
            }

            // APPLY STATUS CLASS

            statusSelect.className =
                `status-select ${statusSelect.value}`;

            statusSelect.setAttribute(
                "aria-label",
                `Update status for alert ${alertId}`
            );

        });


        // HANDLE STATUS CHANGES

        detailsTableBody.addEventListener("change", event => {

            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            const statusSelect =
                target.closest(".status-select");

            if (!statusSelect) {
                return;
            }

            const row =
                statusSelect.closest("tr[data-alert-id]");

            if (
                !row ||
                !validAlertStatuses.includes(statusSelect.value)
            ) {
                return;
            }

            const alertId = row.dataset.alertId;

            const newStatus = statusSelect.value;


            // UPDATE STATUS DROPDOWN STYLE

            statusSelect.className =
                `status-select ${newStatus}`;


            // SAVE UPDATED STATUS

            savedAlertStatuses[alertId] = newStatus;

            saveAlertStatuses();


            // UPDATE SUMMARY COUNTS

            updateAlertStatusSummary();


            // REFRESH SEARCH RESULTS
            // So the updated status is searchable immediately

            if (alertSearch) {

                alertSearch.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

            }


            console.log(
                `Alert ${alertId} status updated to ${newStatus}.`
            );

        });

    }


    // INITIAL STATUS SUMMARY

    updateAlertStatusSummary();


    // REFRESH SEARCH AFTER RESTORING SAVED STATUSES

    if (alertSearch) {

        alertSearch.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

    }


    // ======================================
    // DASHBOARD INITIALIZATION COMPLETE
    // ======================================

    console.log(
        "SentinelAI dashboard initialized successfully."
    );

});