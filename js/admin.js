
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

verifyAdmin();


