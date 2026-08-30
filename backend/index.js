require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Item = require("./models/items");
const User = require("./models/users");

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || "lost-found-portal-change-this-secret";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, Date.now() + "-" + safeName);
    }
});
const upload = multer({ storage });

// Signed session token. The browser cannot change the user id without invalidating the signature.
function createToken(user) {
    const payload = Buffer.from(JSON.stringify({
        id: String(user._id),
        name: user.name,
        email: user.email,
        exp: Date.now() + (24 * 60 * 60 * 1000)
    })).toString("base64url");

    const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
    return `${payload}.${signature}`;
}

function verifyToken(token) {
    if (!token || !token.includes(".")) return null;
    const [payload, signature] = token.split(".");
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");

    if (signature.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    try {
        const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        return data.exp > Date.now() ? data : null;
    } catch {
        return null;
    }
}

function requireAuth(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ message: "Please login to continue." });
    req.user = user;
    next();
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("MongoDB Error:", err));

// -------------------- ITEMS --------------------
app.get("/api/items", async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/items/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch {
        res.status(400).json({ message: "Invalid item id" });
    }
});

app.get("/api/my-items", requireAuth, async (req, res) => {
    try {
        const items = await Item.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/items", requireAuth, upload.single("image"), async (req, res) => {
    try {
        const newItem = new Item({
            name: req.body.name,
            type: req.body.type,
            category: req.body.category || "Others",
            description: req.body.description,
            location: req.body.location,
            date: req.body.date,
            contact: req.body.contact,
            image: req.file ? req.file.filename : "",
            ownerId: req.user.id,
            ownerName: req.user.name,
            status: "Active"
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// -------------------- AUTH --------------------
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "Please fill all fields." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) return res.status(400).json({ message: "User already registered with this email" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({
            name: name.trim(),
            email: cleanEmail,
            phone: phone.trim(),
            password: hashedPassword
        }).save();

        res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(400).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: "Invalid password" });

        const safeUser = { id: user._id, name: user.name, email: user.email };
        res.json({ message: "Login successful", user: safeUser, token: createToken(user) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// -------------------- OWNER-ONLY EDIT --------------------
app.put("/api/items/:id", requireAuth, async (req, res) => {
    try {
        const updatedItem = await Item.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.id },
            {
                name: req.body.name,
                type: req.body.type,
                category: req.body.category || "Others",
                description: req.body.description,
                location: req.body.location,
                date: req.body.date,
                contact: req.body.contact,
                status: req.body.status || "Active"
            },
            { new: true, runValidators: true }
        );

        if (!updatedItem) return res.status(403).json({ message: "You can only edit your own items." });
        res.json({ message: "Item updated successfully", item: updatedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// -------------------- OWNER-ONLY DELETE --------------------
app.delete("/api/items/:id", requireAuth, async (req, res) => {
    try {
        const deletedItem = await Item.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
        if (!deletedItem) return res.status(403).json({ message: "You can only delete your own items." });
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
