const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
    regNum: { type: String, index: true },
    slotId: String,
    subjectId: String,
    facultyId: String,
    roomId: String
});

module.exports = mongoose.model("Timetable", timetableSchema);