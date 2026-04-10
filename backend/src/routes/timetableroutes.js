const express = require("express");
const router = express.Router();

const {
    generateTimetable,
    saveTimetable,
    getTimetable
} = require("../controllers/timetablecontroller");

router.post("/generate", generateTimetable);
router.post("/save", saveTimetable);
router.get("/", getTimetable);

module.exports = router;