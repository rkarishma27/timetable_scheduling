const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: String,
    type: { type: String, enum: ["theory", "lab"] }
});

module.exports = mongoose.model("Room", roomSchema);