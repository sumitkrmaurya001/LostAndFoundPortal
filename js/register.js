document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) return alert("Passwords do not match!");
    try {
        const response = await fetch(`${API_URL}/api/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(), password
        }) });
        const data = await response.json();
        if (response.ok) { alert("Registration successful! Please login."); window.location.href = "login.html"; }
        else alert(data.message || "Registration failed.");
    } catch { alert("Server connection failed."); }
});
