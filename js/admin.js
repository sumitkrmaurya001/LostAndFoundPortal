
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

document.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
        message.textContent =
            `${button.dataset.section} management will be connected next.`;
    });
});

verifyAdmin();
