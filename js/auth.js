const API_URL = "https://lostandfound-api-fzdh.onrender.com";

function getUser() {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
}

function getToken() { return localStorage.getItem("authToken") || ""; }

function authHeaders(extra = {}) {
    const headers = { ...extra };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    window.location.href = "login.html";
}

function setupAuthArea() {
    const area = document.getElementById("authArea");
    if (!area) return;
    const user = getUser();

    if (user && getToken()) {
        area.innerHTML = `<span class="user-pill">Hi, ${escapeHtml(user.name.split(" ")[0])}</span><a class="logout-link" href="#" id="logoutLink">Logout</a>`;
        document.getElementById("logoutLink").addEventListener("click", (e) => { e.preventDefault(); logout(); });
    } else {
        area.innerHTML = `<a class="user-pill" href="login.html">Login / Register</a>`;
    }
}

function requireLogin() {
    if (!getUser() || !getToken()) {
        alert("Please login first.");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

document.addEventListener("DOMContentLoaded", setupAuthArea);
