if (!requireLogin()) throw new Error("Login required");
const params = new URLSearchParams(window.location.search);
const itemId = params.get("id");
const editForm = document.getElementById("editForm");

async function loadItem() {
    try {
        const response = await fetch(`${API_URL}/api/items/${encodeURIComponent(itemId)}`);
        const item = await response.json();
        const user = getUser();

        if (!response.ok) throw new Error(item.message || "Item not found");
        if (!item.ownerId || String(item.ownerId) !== String(user.id)) {
            alert("You can only edit your own reports.");
            window.location.href = `details.html?id=${encodeURIComponent(itemId)}`;
            return;
        }

        document.getElementById("itemName").value = item.name || "";
        document.getElementById("type").value = item.type || "Lost";
        document.getElementById("category").value = item.category || "Others";
        document.getElementById("description").value = item.description || "";
        document.getElementById("location").value = item.location || "";
        document.getElementById("date").value = item.date || "";
        document.getElementById("contact").value = item.contact || "";
        document.getElementById("status").value = item.status || "Active";
    } catch (error) {
        alert(error.message || "Unable to load item.");
        window.location.href = "index.html";
    }
}

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const updatedData = {
        name: document.getElementById("itemName").value.trim(),
        type: document.getElementById("type").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        date: document.getElementById("date").value,
        contact: document.getElementById("contact").value.trim(),
        status: document.getElementById("status").value
    };

    try {
        const response = await fetch(`${API_URL}/api/items/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(updatedData)
        });
        const data = await response.json();
        if (response.ok) {
            alert("Report updated successfully!");
            window.location.href = `details.html?id=${encodeURIComponent(itemId)}`;
        } else if (response.status === 401 || response.status === 403) {
            alert(data.message || "You are not allowed to edit this report.");
            window.location.href = `details.html?id=${encodeURIComponent(itemId)}`;
        } else alert(data.message || "Unable to update report.");
    } catch { alert("Server connection failed."); }
});
loadItem();
