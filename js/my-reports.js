const API_URL = "https://lostandfound-api-fzdh.onrender.com";
const reportsGrid = document.getElementById("reportsGrid");


// Check login
const token = localStorage.getItem("authToken");

if (!token) {

    reportsGrid.innerHTML = `
        <div class="empty-reports">
            <h2>Please Login</h2>

            <p>
                You need to login to see your reports.
            </p>

            <a href="login.html" class="btn primary">
                Login
            </a>
        </div>
    `;

} else {

    loadMyReports();
}


// Load user's reports
async function loadMyReports() {

    try {

        const response = await fetch(
            `${API_URL}/api/my-items`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load reports");
        }

        const items = await response.json();

        displayReports(items);

    } catch (error) {

        console.error(error);

        reportsGrid.innerHTML = `
            <div class="empty-reports">
                <h2>Unable to load reports</h2>

                <p>
                    Please make sure the server is running.
                </p>
            </div>
        `;
    }
}


// Display reports
function displayReports(items) {

    document.getElementById("totalCount").textContent =
        items.length;

    document.getElementById("lostCount").textContent =
        items.filter(item => item.type === "Lost").length;

    document.getElementById("foundCount").textContent =
        items.filter(item => item.type === "Found").length;

    document.getElementById("resolvedCount").textContent =
        items.filter(
            item =>
                item.status &&
                item.status.toLowerCase() === "resolved"
        ).length;


    if (items.length === 0) {

        reportsGrid.innerHTML = `
            <div class="empty-reports">

                <div class="empty-icon">📦</div>

                <h2>No reports yet</h2>

                <p>
                    You haven't reported any lost or found items.
                </p>

                <a href="lost-item.html" class="btn primary">
                    Report Your First Item
                </a>

            </div>
        `;

        return;
    }


    reportsGrid.innerHTML = "";


    items.forEach(item => {

        const card = document.createElement("article");

        card.className = "my-report-card";


        const image = item.image
            ? item.image
            : "https://via.placeholder.com/500x300?text=No+Image";


        const timeAgo = getTimeAgo(item.date);


        card.innerHTML = `

            <div class="report-image">

                <img
                    src="${image}"
                    alt="${escapeHtml(item.name)}"
                >

                <span class="report-type ${item.type.toLowerCase()}">
                    ${item.type === "Lost" ? "🔴" : "🟢"}
                    ${item.type}
                </span>

            </div>


            <div class="report-content">

                <div class="report-time">
                    ${item.type} ${timeAgo}
                </div>


                <h3>
                    ${escapeHtml(item.name)}
                </h3>


                <p class="category">
                    ${escapeHtml(item.category || "Others")}
                </p>


                <p class="description">
                    ${escapeHtml(item.description || "No description")}
                </p>


                <div class="location">
                    📍 ${escapeHtml(item.location || "Location not specified")}
                </div>


                <div class="report-status">
                    <span>
                        ${escapeHtml(item.status || "Active")}
                    </span>
                </div>


                <div class="report-buttons">

                    <a
                        href="details.html?id=${item._id}"
                        class="view-btn"
                    >
                        View
                    </a>

                    <a
                        href="edit-item.html?id=${item._id}"
                        class="edit-btn"
                    >
                        ✏️ Edit
                    </a>

                    <button
                        class="delete-btn"
                        onclick="deleteReport('${item._id}')"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>
        `;


        reportsGrid.appendChild(card);

    });
}


// Days ago
function getTimeAgo(dateString) {

    if (!dateString) {
        return "Date unavailable";
    }

    const parts = dateString.split("-");

    const itemDate = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);

    const difference =
        today.getTime() - itemDate.getTime();

    const days =
        Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );


    if (days === 0) {
        return "Today";
    }

    if (days === 1) {
        return "Yesterday";
    }

    return `${days} days ago`;
}


// Delete report
async function deleteReport(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this report?"
        );

    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/items/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            alert(
                "You are not allowed to delete this report."
            );

            return;
        }


        alert("Report deleted successfully.");

        loadMyReports();


    } catch (error) {

        console.error(error);

        alert("Something went wrong.");
    }
}


// Escape HTML
function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Filter
document
    .getElementById("filterReports")
    .addEventListener("change", async function () {

        const filter = this.value;

        try {

            const response = await fetch(
                `${API_URL}/api/my-items`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const items = await response.json();


            let filteredItems = items;


            if (filter === "Lost") {

                filteredItems =
                    items.filter(
                        item => item.type === "Lost"
                    );

            }

            else if (filter === "Found") {

                filteredItems =
                    items.filter(
                        item => item.type === "Found"
                    );

            }

            else if (filter === "resolved") {

                filteredItems =
                    items.filter(
                        item =>
                            item.status &&
                            item.status.toLowerCase() === "resolved"
                    );
            }


            displayReports(filteredItems);

        } catch (error) {

            console.error(error);
        }

    });