const searchInput = document.getElementById("searchInput");
const itemsContainer = document.getElementById("itemsContainer");
const emptyState = document.getElementById("emptyState");
let allItems = [];
let activeType = "All";
let activeCategory = "All";

async function loadItems() {
    try {
        const response = await fetch(`${API_URL}/api/items`);
        if (!response.ok) throw new Error("Failed to fetch items");
        allItems = await response.json();
        updateStats();
        applyFilters();
    } catch (error) {
        console.error(error);
        itemsContainer.innerHTML = `<div class="loading">Unable to load reports. Make sure the backend is running.</div>`;
    }
}

function updateStats() {
    document.getElementById("totalCount").textContent = allItems.length;
    document.getElementById("lostCount").textContent = allItems.filter(i => i.type === "Lost").length;
    document.getElementById("foundCount").textContent = allItems.filter(i => i.type === "Found").length;
}

function applyFilters() {
    const query = (searchInput.value || "").toLowerCase().trim();
    const filtered = allItems.filter(item => {
        const searchable = [item.name, item.category, item.type, item.description, item.location].join(" ").toLowerCase();
        const typeOk = activeType === "All" || item.type === activeType;
        const catOk = activeCategory === "All" || (item.category || "Others") === activeCategory;
        return typeOk && catOk && searchable.includes(query);
    });
    displayItems(filtered);
}
function getTimeAgo(dateString) {
    if (!dateString) return "Date not available";

    const parts = dateString.split("-");

    const itemDate = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);

    const difference = today.getTime() - itemDate.getTime();

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
        return "Upcoming";
    }

    if (days === 0) {
        return "Today";
    }

    if (days === 1) {
        return "Yesterday";
    }

    return `${days} days ago`;
}
function displayItems(items) {
    itemsContainer.innerHTML = "";
    emptyState.style.display = items.length ? "none" : "block";
    if (!items.length) return;

    items.forEach(item => {
        const card = document.createElement("article");
        card.className = "card";
        const typeClass = item.type.toLowerCase();
        const category = escapeHtml(item.category || "Others");

        const timeAgo = getTimeAgo(item.date);
        const image = item.image
            ? `<img src="${API_URL}/uploads/${encodeURIComponent(item.image)}" alt="${escapeHtml(item.name)}">`
            : `<div style="height:100%;display:grid;place-items:center;font-size:52px">${item.category === "Mobile" ? "📱" : item.category === "Bag" ? "🎒" : item.category === "Wallet" ? "👛" : item.category === "Keys" ? "🔑" : "📦"}</div>`;
        card.innerHTML = `
            <div class="card-media">${image}<span class="status-badge ${typeClass}">${escapeHtml(item.type)}</span></div>
            <div class="card-body">
<div class="card-meta">
    ${category} • ${escapeHtml(item.status || "Active")}
</div>

<div class="time-ago ${typeClass}">
    ${item.type === "Lost" ? "🔴" : "🟢"}
    ${escapeHtml(item.type)} ${timeAgo}
</div>                <h3>${escapeHtml(item.name)}</h3>
                <p>${escapeHtml(item.description)}</p>
                <div class="card-bottom">
                    <span class="location">📍 ${escapeHtml(item.location || "Location not added")}</span>
                    <a class="view-link" href="details.html?id=${encodeURIComponent(item._id)}">View →</a>
                </div>
            </div>`;
        itemsContainer.appendChild(card);
    });
}

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        activeType = button.dataset.filter;
        applyFilters();
    });
});

document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category").forEach(b => b.classList.remove("active-cat"));
        button.classList.add("active-cat");
        activeCategory = button.dataset.category;
        applyFilters();
    });
});

searchInput.addEventListener("input", applyFilters);
loadItems();
