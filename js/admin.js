
const API_URL = "https://lostandfound-api-fzdh.onrender.com";

const message = document.getElementById("adminMessage");


async function verifyAdmin() {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    if (!token) {
        message.textContent = "Please log in first.";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/admin/verify`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.isAdmin) {
            message.textContent = "Access denied. Admin account required.";
            return;
        }

        message.textContent = "Admin access verified successfully.";
        await loadAdminStats(token);
    } catch (error) {
        message.textContent = "Could not connect to the server.";
        console.error(error);
    }
}

async function loadAdminStats(token) {
    try {
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load statistics");
        }

        document.getElementById("totalUsers").textContent =
            data.totalUsers;

        document.getElementById("lostReports").textContent =
            data.lostReports;

        document.getElementById("foundReports").textContent =
            data.foundReports;

        document.getElementById("pendingClaims").textContent =
            data.pendingClaims;
    } catch (error) {
        message.textContent = "Unable to load statistics.";
        console.error("Dashboard stats error:", error);
    }
}


document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "index.html";
});


const usersSection = document.getElementById("usersSection");
const usersTableBody = document.getElementById("usersTableBody");
const usersMessage = document.getElementById("usersMessage");

document.querySelector('[data-section="users"]')
    .addEventListener("click", loadUsers);

document.getElementById("backToManagement")
    .addEventListener("click", () => {
        usersSection.hidden = true;
    });

async function loadUsers() {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    usersSection.hidden = false;
    usersMessage.textContent = "Loading users...";
    usersTableBody.replaceChildren();

    try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load users.");
        }

        usersMessage.textContent =
            `Total registered users: ${data.users.length}`;

        data.users.forEach(user => {
            const row = document.createElement("tr");

            [
                user.name,
                user.email,
                user.phone,
                user.role,
                user.isBlocked ? "Blocked" : "Active"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.style.padding = "12px";
                cell.style.borderTop = "1px solid #ddd";
                cell.textContent = value ?? "—";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            actionCell.style.padding = "12px";

            if (user.role === "admin") {
                actionCell.textContent = "Protected Admin";
            } else {
                const button = document.createElement("button");
                button.className = "admin-btn";
                button.textContent = user.isBlocked ? "Unblock" : "Block";

                button.addEventListener("click", () => {
                    updateUserStatus(user._id, !user.isBlocked);
                });

                actionCell.appendChild(button);
            }

            row.appendChild(actionCell);
            usersTableBody.appendChild(row);
        });

    } catch (error) {
        usersMessage.textContent = error.message;
        console.error("Users loading error:", error);
    }
}

async function updateUserStatus(userId, isBlocked) {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    const action = isBlocked ? "block" : "unblock";

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/admin/users/${userId}/block`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isBlocked })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Action failed.");
        }

        alert(data.message);
        await loadUsers();

    } catch (error) {
        alert(error.message);
        console.error("User update error:", error);
    }
}

// ---------------- ADMIN REPORT MANAGEMENT ----------------

const reportsSection = document.getElementById("reportsSection");
const reportsTableBody = document.getElementById("reportsTableBody");
const reportsMessage = document.getElementById("reportsMessage");
// Close Report Details Modal
document.getElementById("closeReportModal")
    .addEventListener("click", () => {
        const modal = document.getElementById("reportDetailsModal");
        modal.hidden = true;
        modal.style.display = "none";
    });

document.querySelector('[data-section="reports"]')
    .addEventListener("click", loadReports);

document.getElementById("filterReportsBtn")
    .addEventListener("click", loadReports);

document.getElementById("backFromReports")
    .addEventListener("click", () => {
        reportsSection.hidden = true;
    });

async function loadReports() {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    reportsSection.hidden = false;
    reportsMessage.textContent = "Loading reports...";
    reportsTableBody.replaceChildren();

    const params = new URLSearchParams();

    const type = document.getElementById("reportTypeFilter").value;
    const status = document.getElementById("reportStatusFilter").value;

    if (type) params.append("type", type);
    if (status) params.append("status", status);

    try {
        const response = await fetch(
            `${API_URL}/api/admin/reports?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load reports.");
        }

        reportsMessage.textContent = `Total reports: ${data.totalReports}`;

        if (!data.reports.length) {
            reportsMessage.textContent = "No reports found.";
            return;
        }

        data.reports.forEach(item => {
            const row = document.createElement("tr");

            const imageCell = document.createElement("td");
            imageCell.style.padding = "12px";

            if (item.image && item.image.startsWith("http")) {
                const img = document.createElement("img");
                img.src = item.image;
                img.alt = item.name || "Item image";
                img.style.width = "60px";
                img.style.height = "60px";
                img.style.objectFit = "cover";
                imageCell.appendChild(img);
            } else {
                imageCell.textContent = "No image";
            }

            row.appendChild(imageCell);

            const ownerName =
                item.ownerId?.name || item.ownerName || "Unknown";

            [
                item.name,
                item.type,
                item.category,
                item.location,
                ownerName,
                item.status
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.style.padding = "12px";
                cell.textContent = value || "—";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            // View Report Details Button
const viewBtn = document.createElement("button");

viewBtn.textContent = "View Details";
viewBtn.type = "button";
viewBtn.className = "admin-btn";

viewBtn.addEventListener("click", () => {
    const modal = document.getElementById("reportDetailsModal");
    const content = document.getElementById("reportDetailsContent");

    if (!modal || !content) {
        alert("Report details modal not found!");
        return;
    }

    content.replaceChildren();

    if (item.image && item.image.startsWith("http")) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name || "Item image";
        img.style.width = "100%";
        img.style.maxHeight = "220px";
        img.style.objectFit = "contain";
        content.appendChild(img);
    }

    const details = [
        ["Item Name", item.name],
        ["Type", item.type],
        ["Category", item.category],
        ["Location", item.location],
        ["Description", item.description],
        ["Owner", item.ownerId?.name || item.ownerName],
        ["Owner Email", item.ownerId?.email],
        ["Status", item.status],
        ["Created Date", item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "Not available"]
    ];

    details.forEach(([label, value]) => {
        const p = document.createElement("p");
        p.textContent = `${label}: ${value || "Not available"}`;
        content.appendChild(p);
    });

    modal.hidden = false;

    Object.assign(modal.style, {
        display: "flex",
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "99999",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)"
    });
});

actionCell.appendChild(viewBtn);
           // Status Action Button
const statusBtn = document.createElement("button");

statusBtn.textContent =
    item.status === "Active" ? "Mark Resolved" : "Reopen";

statusBtn.className = "admin-btn";

statusBtn.addEventListener("click", async () => {
    const newStatus =
        item.status === "Active" ? "Resolved" : "Active";

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    statusBtn.disabled = true;
    statusBtn.textContent = "Updating...";

    try {
        const response = await fetch(
            `${API_URL}/api/admin/reports/${item._id}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Update failed.");
        }

        alert(result.message);
        loadReports();

    } catch (error) {
        alert(error.message);
        statusBtn.disabled = false;
        statusBtn.textContent =
            item.status === "Active" ? "Mark Resolved" : "Reopen";
    }
});

actionCell.appendChild(statusBtn);
            row.appendChild(actionCell);

            reportsTableBody.appendChild(row);
        });

    } catch (error) {
        reportsMessage.textContent = error.message;
        console.error("Admin reports error:", error);
    }
}

verifyAdmin();


