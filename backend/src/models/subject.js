const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ["theory", "lab"], required: true },
    hoursPerWeek: { type: Number, required: true },
    facultyId: { type: String, required: true }
});

module.exports = mongoose.model("Subject", subjectSchema);