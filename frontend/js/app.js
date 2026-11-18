
// ==========================================
// SENTINELAI - DASHBOARD INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ======================================
    // SIDEBAR NAVIGATION
    // ======================================

    const navigationLinks =
        document.querySelectorAll(".nav-link[data-page]");

    const pageSections =
        document.querySelectorAll(".page-section");

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

        const selectedPage =
            document.getElementById(pageName);

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

        const pageTitleElement =
            document.getElementById("pageTitle");

        const breadcrumbElement =
            document.getElementById("breadcrumbPage");

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

    document.querySelectorAll(".view-all[data-page]")
        .forEach(link => {

            link.addEventListener("click", function (event) {
                event.preventDefault();
                showPage(this.dataset.page);
            });

        });

    const initialPage =
        window.location.hash.replace("#", "");

    if (
        initialPage &&
        document.getElementById(initialPage)
    ) {
        showPage(initialPage);
    } else {
        showPage("overview");
    }

    window.addEventListener("hashchange", function () {

        const page =
            window.location.hash.replace("#", "");

        if (document.getElementById(page)) {
            showPage(page);
        }

    });


    // ======================================
    // TOPBAR SEARCH FUNCTIONALITY
    // ======================================

    const topbarSearch =
        document.getElementById("topbarSearch");

    if (topbarSearch) {

        topbarSearch.addEventListener("keydown", function (event) {

            if (event.key !== "Enter") {
                return;
            }

            const query =
                this.value.trim().toLowerCase();

            if (!query) {
                return;
            }

            const matchingLink =
                Array.from(navigationLinks).find(link =>
                    link.textContent.trim().toLowerCase()
                        .includes(query)
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
    // ======================================

    const eventsCanvas =
        document.getElementById("eventsChart");

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
                data: [
                    1200, 1900, 1500,
                    2400, 1800, 2800, 2600
                ]
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

            button.classList.toggle(
                "active",
                isInitiallyActive
            );

            button.setAttribute(
                "aria-pressed",
                String(isInitiallyActive)
            );

            button.addEventListener("click", function () {

                const selectedPeriod =
                    this.dataset.period;

                const periodData =
                    chartPeriods[selectedPeriod];

                if (!periodData) {
                    return;
                }

                eventsChart.data.labels =
                    periodData.labels;

                eventsChart.data.datasets[0].data =
                    periodData.data;

                eventsChart.update();

                chartFilterButtons.forEach(filter => {

                    const isActive =
                        filter === this;

                    filter.classList.toggle(
                        "active",
                        isActive
                    );

                    filter.setAttribute(
                        "aria-pressed",
                        String(isActive)
                    );

                });

            });

        });

    }


    // ======================================
    // SECURITY SEVERITY CHART
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

                                const values =
                                    context.dataset.data;

                                const total =
                                    values.reduce(
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


    // ==========================================
    // TASK 15 - ALERT ASSIGNMENT & NOTES STORAGE
    // ==========================================

    const alertAssignmentStorageKey =
        "sentinelAI.alertAssignments";

    let currentAlertId = null;

    function loadAlertAssignments() {

        try {

            const saved = JSON.parse(
                localStorage.getItem(
                    alertAssignmentStorageKey
                ) || "{}"
            );

            return (
                saved &&
                typeof saved === "object" &&
                !Array.isArray(saved)
            ) ? saved : {};

        } catch (error) {

            console.warn(
                "Unable to load alert assignments:",
                error
            );

            return {};

        }

    }

    let savedAlertAssignments =
        loadAlertAssignments();

    function saveAlertAssignments() {

        try {

            localStorage.setItem(
                alertAssignmentStorageKey,
                JSON.stringify(savedAlertAssignments)
            );

            return true;

        } catch (error) {

            console.warn(
                "Unable to save alert assignments:",
                error
            );

            return false;

        }

    }

    function getAlertAssignment(alertId) {

        const assignment =
            savedAlertAssignments[alertId];

        if (
            !assignment ||
            typeof assignment !== "object" ||
            Array.isArray(assignment)
        ) {
            return {
                analyst: "",
                notes: ""
            };
        }

        return {

            analyst:
                typeof assignment.analyst === "string"
                    ? assignment.analyst
                    : "",

            notes:
                typeof assignment.notes === "string"
                    ? assignment.notes
                    : ""

        };

    }


    // ======================================
    // ALERT TABLE ELEMENTS
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

    const alertRows = alertsTableBody
        ? Array.from(alertsTableBody.querySelectorAll("tr"))
        : [];

    const totalAlertCount =
        alertRows.length;


    // ======================================
    // TASK 12 - ENHANCED ALERT SEARCH
    // ======================================

    function filterSecurityAlerts() {

        if (
            !alertSearch ||
            !severityFilter ||
            !alertsTableBody ||
            !alertCount ||
            !noAlertsMessage ||
            !alertsTable
        ) {
            return;
        }

        const searchValue =
            alertSearch.value.trim().toLowerCase();

        const selectedSeverity =
            severityFilter.value.trim().toLowerCase();

        let visibleCount = 0;

        alertRows.forEach(row => {

            const searchableRow =
                row.cloneNode(true);

            const searchStatus =
                searchableRow.querySelector(".status-select");

            if (searchStatus) {

                searchStatus.replaceWith(
                    document.createTextNode(
                        searchStatus.selectedOptions[0]
                            ?.textContent || ""
                    )
                );

            }

            const alertId =
                row.dataset.alertId || "";

            const assignment =
                getAlertAssignment(alertId);

            const alertText = (
                searchableRow.textContent + " " +
                assignment.analyst + " " +
                assignment.notes
            ).toLowerCase();

            const rowSeverity =
                (row.dataset.severity || "").toLowerCase();

            const matchesSearch =
                alertText.includes(searchValue);

            const matchesSeverity =
                selectedSeverity === "all" ||
                rowSeverity === selectedSeverity;

            const shouldDisplay =
                matchesSearch && matchesSeverity;

            row.hidden = !shouldDisplay;

            if (shouldDisplay) {
                visibleCount++;
            }

        });

        alertCount.textContent =
            `Showing ${visibleCount} of ${totalAlertCount} alerts`;

        const noResults =
            visibleCount === 0;

        noAlertsMessage.hidden = !noResults;
        alertsTable.hidden = noResults;

        if (clearAlertSearch) {
            clearAlertSearch.hidden =
                searchValue.length === 0;
        }

    }

    if (alertSearch) {

        alertSearch.addEventListener(
            "input",
            filterSecurityAlerts
        );

    }

    if (severityFilter) {

        severityFilter.addEventListener(
            "change",
            filterSecurityAlerts
        );

    }

    if (clearAlertSearch) {

        clearAlertSearch.addEventListener("click", function () {

            if (alertSearch) {
                alertSearch.value = "";
                filterSecurityAlerts();
                alertSearch.focus();
            }

        });

    }


    // ======================================
    // COUNTER ANIMATION HELPER
    // ======================================

    function animateCounter(element, targetValue, duration, formatter) {

        if (!element) {
            return;
        }

        const startTime = performance.now();

        function updateCounter(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(elapsed / duration, 1);

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentValue =
                Math.floor(targetValue * easedProgress);

            element.textContent =
                formatter
                    ? formatter(currentValue)
                    : String(currentValue);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }

        }

        requestAnimationFrame(updateCounter);

    }


    // ======================================
    // TOTAL EVENTS COUNTER
    // ======================================

    animateCounter(
        document.getElementById("totalEvents"),
        12480,
        1500,
        value => value.toLocaleString("en-US")
    );


    // ======================================
    // ACTIVE ALERTS COUNTER
    // ======================================

    animateCounter(
        document.getElementById("activeAlerts"),
        24,
        1200
    );


    // ======================================
    // CRITICAL INCIDENTS COUNTER
    // ======================================

    animateCounter(
        document.getElementById("criticalIncidents"),
        3,
        1200,
        value => String(value).padStart(2, "0")
    );


    // ======================================
    // TASK 13 - ALERT DETAILS DATA
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


    // ======================================
    // ALERT DETAILS HELPER FUNCTIONS
    // ======================================

    const detailsTableBody =
        alertsTableBody;

    function setDetailText(elementId, value) {

        const element =
            document.getElementById(elementId);

        if (element) {
            element.textContent = value;
        }

    }


    // ======================================
    // OPEN ALERT DETAILS
    // ======================================

    function openAlertDetails(row) {

        const alertId =
            row.dataset.alertId;

        const details =
            alertDetailsData[alertId];

        if (!details) {
            console.warn(
                "Alert details not found:",
                alertId
            );
            return;
        }

        currentAlertId = alertId;

        const cells =
            row.querySelectorAll("td");

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

        setDetailText(
            "detailAlertTitle",
            alertTitle
        );

        setDetailText(
            "detailAlertId",
            `Alert ID: ${alertId}`
        );

        setDetailText(
            "detailSourceIP",
            sourceIP
        );

        setDetailText(
            "detailDestinationIP",
            details.destinationIP
        );

        setDetailText(
            "detailTimestamp",
            timestamp
        );


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

                const listItem =
                    document.createElement("li");

                listItem.textContent = step;

                stepsList.appendChild(listItem);

            });

        }


        // ======================================
        // TASK 15 - RESTORE ASSIGNMENT AND NOTES
        // ======================================

        const assignment =
            getAlertAssignment(alertId);

        const analystSelect =
            document.getElementById("alertAnalystSelect");

        const assignedAnalyst =
            document.getElementById("detailAssignedAnalyst");

        const investigationNotes =
            document.getElementById("alertInvestigationNotes");

        const analystMessage =
            document.getElementById("analystSaveMessage");

        const notesMessage =
            document.getElementById("notesSaveMessage");

        if (analystSelect) {
            analystSelect.value =
                assignment.analyst || "";
        }

        if (assignedAnalyst) {
            assignedAnalyst.textContent =
                assignment.analyst || "Unassigned";
        }

        if (investigationNotes) {
            investigationNotes.value =
                assignment.notes || "";
        }

        if (analystMessage) {
            analystMessage.textContent = "";
        }

        if (notesMessage) {
            notesMessage.textContent = "";
        }

        showPage("alertDetails");

    }


    // ======================================
    // ALERT ROW INITIALIZATION
    // ======================================

    if (detailsTableBody) {

        const detailRows =
            detailsTableBody.querySelectorAll("tr");

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

        backToAlertsButton.addEventListener("click", function () {

            showPage("overview");

            document.getElementById("alertsTable")
                ?.scrollIntoView({
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

    function loadAlertStatuses() {

        try {

            const savedStatuses = JSON.parse(
                localStorage.getItem(
                    alertStatusStorageKey
                ) || "{}"
            );

            return (
                savedStatuses &&
                typeof savedStatuses === "object" &&
                !Array.isArray(savedStatuses)
            ) ? savedStatuses : {};

        } catch (error) {

            console.warn(
                "Unable to load saved alert statuses:",
                error
            );

            return {};

        }

    }

    let savedAlertStatuses =
        loadAlertStatuses();


    // STATUS SUMMARY ELEMENT

    let alertStatusSummary =
        document.getElementById("alertStatusSummary");

    if (!alertStatusSummary) {

        alertStatusSummary =
            document.createElement("div");

        alertStatusSummary.id =
            "alertStatusSummary";

        alertStatusSummary.className =
            "alert-status-summary";

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

                    if (
                        Object.prototype.hasOwnProperty.call(
                            statusCounts,
                            select.value
                        )
                    ) {
                        statusCounts[select.value]++;
                    }

                });

        }

        if (alertStatusSummary) {

            alertStatusSummary.textContent =
                `Open: ${statusCounts.open} | ` +
                `Investigating: ${statusCounts.investigating} | ` +
                `Resolved: ${statusCounts.resolved}`;

        }

    }


    // SAVE ALERT STATUSES

    function saveAlertStatuses() {

        try {

            localStorage.setItem(
                alertStatusStorageKey,
                JSON.stringify(savedAlertStatuses)
            );

            return true;

        } catch (error) {

            console.warn(
                "Unable to save alert statuses:",
                error
            );

            return false;

        }

    }


    if (detailsTableBody) {

        const statusRows =
            detailsTableBody.querySelectorAll(
                "tr[data-alert-id]"
            );


        // RESTORE SAVED STATUSES

        statusRows.forEach(row => {

            const alertId =
                row.dataset.alertId;

            const statusSelect =
                row.querySelector(".status-select");

            if (!statusSelect) {
                return;
            }

            const savedStatus =
                savedAlertStatuses[alertId];

            if (
                validAlertStatuses.includes(savedStatus)
            ) {
                statusSelect.value = savedStatus;
            }

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

            const alertId =
                row.dataset.alertId;

            const newStatus =
                statusSelect.value;

            statusSelect.className =
                `status-select ${newStatus}`;

            savedAlertStatuses[alertId] =
                newStatus;

            saveAlertStatuses();

            updateAlertStatusSummary();

            filterSecurityAlerts();

            console.log(
                `Alert ${alertId} status updated to ${newStatus}.`
            );

        });

    }


    // INITIAL STATUS SUMMARY

    updateAlertStatusSummary();


    // ==========================================
    // TASK 15 - ALERT ASSIGNMENT & ANALYST NOTES
    // ==========================================

    const analystSelect =
        document.getElementById("alertAnalystSelect");

    const assignedAnalyst =
        document.getElementById("detailAssignedAnalyst");

    const investigationNotes =
        document.getElementById("alertInvestigationNotes");

    const saveNotesButton =
        document.getElementById("saveAlertNotes");

    const analystSaveMessage =
        document.getElementById("analystSaveMessage");

    const notesSaveMessage =
        document.getElementById("notesSaveMessage");


    // SAVE ANALYST ASSIGNMENT

    if (analystSelect) {

        analystSelect.addEventListener("change", function () {

            if (!currentAlertId) {
                return;
            }

            const assignment =
                getAlertAssignment(currentAlertId);

            assignment.analyst =
                this.value;

            savedAlertAssignments[currentAlertId] =
                assignment;

            const saved =
                saveAlertAssignments();

            if (assignedAnalyst) {

                assignedAnalyst.textContent =
                    this.value || "Unassigned";

            }

            if (analystSaveMessage) {

                analystSaveMessage.textContent =
                    saved
                        ? "Analyst assignment saved."
                        : "Unable to save assignment.";

            }

            filterSecurityAlerts();

            console.log(
                `Alert ${currentAlertId} assigned to ${this.value || "Unassigned"}.`
            );

        });

    }


    // SAVE INVESTIGATION NOTES

    if (saveNotesButton) {

        saveNotesButton.addEventListener("click", function () {

            if (!currentAlertId) {
                return;
            }

            const assignment =
                getAlertAssignment(currentAlertId);

            assignment.notes =
                investigationNotes
                    ? investigationNotes.value.trim()
                    : "";

            savedAlertAssignments[currentAlertId] =
                assignment;

            const saved =
                saveAlertAssignments();

            if (notesSaveMessage) {

                notesSaveMessage.textContent =
                    saved
                        ? "Investigation notes saved successfully."
                        : "Unable to save notes.";

            }

            filterSecurityAlerts();

            console.log(
                `Investigation notes saved for ${currentAlertId}.`
            );

        });

    }


    // ======================================
    // INITIAL ALERT FILTER STATE
    // ======================================

    filterSecurityAlerts();


    // ======================================
    // DASHBOARD INITIALIZATION COMPLETE
    // ======================================

    console.log(
        "SentinelAI dashboard initialized successfully."
    );

});
