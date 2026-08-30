const params = new URLSearchParams(window.location.search);
const itemId = params.get("id");
const itemDetails = document.getElementById("itemDetails");

async function loadDetails() {
    try {
        const response = await fetch(`${API_URL}/api/items/${encodeURIComponent(itemId)}`);
        const item = await response.json();
        if (!response.ok) throw new Error(item.message || "Item not found");

        const user = getUser();
        const isOwner = !!(user && item.ownerId && String(item.ownerId) === String(user.id) && getToken());
        const typeClass = item.type.toLowerCase();
        const image = item.image
            ? `<img class="detail-image" src="${API_URL}/uploads/${encodeURIComponent(item.image)}" alt="${escapeHtml(item.name)}">`
            : `<div class="detail-image" style="display:grid;place-items:center;font-size:90px">${item.category === "Mobile" ? "📱" : item.category === "Bag" ? "🎒" : item.category === "Wallet" ? "👛" : item.category === "Keys" ? "🔑" : "📦"}</div>`;

        itemDetails.innerHTML = `<div class="detail-grid"><div>${image}</div><div class="detail-info">
            <span class="status-badge ${typeClass}" style="position:static;display:inline-block;box-shadow:none">${escapeHtml(item.type)} report</span>
            <h1>${escapeHtml(item.name)}</h1>
            <p class="description">${escapeHtml(item.description)}</p>
            <div class="detail-list">
                <div><span>Category</span><strong>${escapeHtml(item.category || "Others")}</strong></div>
                <div><span>Location</span><strong>${escapeHtml(item.location || "Not provided")}</strong></div>
                <div><span>Date</span><strong>${escapeHtml(item.date || "Not provided")}</strong></div>
                <div><span>Contact</span><strong>${escapeHtml(item.contact || "Not provided")}</strong></div>
                <div><span>Status</span><strong>${escapeHtml(item.status || "Active")}</strong></div>
                <div><span>Reported by</span><strong>${escapeHtml(item.ownerName || "Community member")}</strong></div>
            </div>
            ${isOwner ? `<div class="detail-actions"><a class="btn btn-primary" href="edit-item.html?id=${item._id}">✎ Edit report</a><button class="btn danger" id="deleteBtn">Delete</button></div><p class="owner-note">🔐 Only you can edit or delete this report.</p>` : `<p class="owner-note">🔐 This report belongs to another user, so editing and deleting are disabled.</p>`}
        </div></div>`;

        if (isOwner) document.getElementById("deleteBtn").addEventListener("click", () => deleteItem(item._id));
    } catch (error) {
        itemDetails.innerHTML = `<div class="empty-state"><div>⚠️</div><h3>Report unavailable</h3><p>${escapeHtml(error.message)}</p></div>`;
    }
}

async function deleteItem(id) {
    if (!confirm("Delete this report permanently?")) return;
    try {
        const response = await fetch(`${API_URL}/api/items/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
        const data = await response.json();
        if (response.ok) {
            alert("Report deleted successfully.");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Unable to delete report.");
        }
    } catch { alert("Server connection failed."); }
}

loadDetails();
