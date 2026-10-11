if (!requireLogin()) throw new Error("Login required");
const form = document.getElementById("lostForm");
const imageInput = document.getElementById("image");
const preview = document.getElementById("imagePreview");

imageInput.addEventListener("change", () => showPreview(imageInput, preview));

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", document.getElementById("itemName").value.trim());
    formData.append("type", "Lost");
    formData.append("category", document.getElementById("category").value);
    formData.append("description", document.getElementById("description").value.trim());
    formData.append("location", document.getElementById("location").value.trim());
    formData.append("date", document.getElementById("date").value);
    formData.append("contact", document.getElementById("contact").value.trim());
    if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

    try {
        const response = await fetch(`${API_URL}/api/items`, { method: "POST", headers: authHeaders(), body: formData });
        const data = await response.json();
        if (response.ok) { alert("Lost report published!"); window.location.href = `details.html?id=${data._id}`; }
        else alert(data.message || "Unable to publish report.");
    } catch { alert("Server connection failed."); }
});

function showPreview(input, box) {
    const file = input.files[0];
    if (!file) { box.textContent = "📷 Add a clear photo to improve matching"; return; }
    const reader = new FileReader();
    reader.onload = e => box.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    reader.readAsDataURL(file);
}
