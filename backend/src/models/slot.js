const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    day: String,
    start: String,
    end: String,
    isLabSlot: Boolean
});

module.exports = mongoose.model("Slot", slotSchema);