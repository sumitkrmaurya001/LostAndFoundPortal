document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
        const response = await fetch(`${API_URL}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("authToken", data.token);
            window.location.href = "index.html";
        } else alert(data.message || "Login failed.");
    } catch { alert("Server connection failed. Make sure the backend is running."); }
});
