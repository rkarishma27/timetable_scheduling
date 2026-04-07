const Subject = require("../models/Subject");
const Slot = require("../models/Slot");
const Room = require("../models/Room");
const Timetable = require("../models/Timetable");

const { schedule } = require("../scheduler/scheduler");

exports.generateTimetable = async (req, res) => {
    try {
        const subjects = await Subject.find();
        const slots = await Slot.find();
        const rooms = await Room.find();

        const timetable = schedule(subjects, slots, rooms);

        res.json({
            success: true,
            timetable
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveTimetable = async (req, res) => {
    try {
        await Timetable.deleteMany({});
        await Timetable.insertMany(req.body.timetable);

        res.json({ message: "Saved successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTimetable = async (req, res) => {
    const data = await Timetable.find();
    res.json(data);
};