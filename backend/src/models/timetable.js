const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
    slotId: String,
    subjectId: String,
    facultyId: String,
    roomId: String
});

module.exports = mongoose.model("Timetable", timetableSchema);