const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["Lost", "Found"] },
    category: { type: String, default: "Others", trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    date: { type: String },
    contact: { type: String, trim: true },
    image: { type: String, default: "" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    ownerName: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Resolved"], default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
