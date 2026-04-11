const Subject = require("../models/subject");
const Slot = require("../models/slot");
const Room = require("../models/room");
const Timetable = require("../models/timetable");

const { schedule } = require("../scheduler/scheduler");
const { connectToDatabase } = require("../lib/db");

exports.generateTimetable = async (req, res) => {
    try {
        const selections = req.body?.selections;

        if (Array.isArray(selections) && selections.length > 0) {
            const ttMap = {};
            const timetable = [];

            selections.forEach((sel) => {
                if (!sel || !sel.course) return;
                const short = (sel.course.code || "").toString().slice(-4);

                if (sel.theorySlot) {
                    ttMap[sel.theorySlot] = short;
                    timetable.push({
                        slotId: sel.theorySlot,
                        subjectId: sel.course.code,
                        facultyId: sel.teacher || "",
                        roomId: "",
                    });
                }

                if (sel.labSlot) {
                    sel.labSlot.split("+").forEach((labCode) => {
                        if (!labCode) return;
                        ttMap[labCode] = short;
                        timetable.push({
                            slotId: labCode,
                            subjectId: sel.course.code,
                            facultyId: sel.teacher || "",
                            roomId: "",
                        });
                    });
                }
            });

            return res.status(200).json({
                success: true,
                message: "Timetable generated from client selections",
                timetable,
                ttMap,
            });
        }

        const subjects = await Subject.find();
        const slots = await Slot.find();
        const rooms = await Room.find();


        if (subjects.length === 0 || slots.length === 0 || rooms.length === 0) {
            return res.status(200).json({
                success: true,
                message: "DB not seeded; returning client selections",
                timetable: Array.isArray(selections) ? selections : []
            });
        }

        const timetable = schedule(subjects, slots, rooms);

        const SLOT_GRID = {
            MON: ["A1/L1","F1/L2","D1/L3","TB1/L4","TG1/L5","L6","LUNCH","A2/L31","F2/L32","D2/L33","TB2/L34","TG2/L35","L36"],
            TUE: ["B1/L7","G1/L8","E1/L9","TC1/L10","TAA1/L11","L12","LUNCH","B2/L37","G2/L38","E2/L39","TC2/L40","TAA2/L41","L42"],
            WED: ["C1/L13","A1/L14","F1/L15","V1/L16","V2/L17","L18","LUNCH","C2/L43","A2/L44","F2/L45","TD2/L46","TBB2/L47","L48"],
            THU: ["D1/L19","B1/L20","G1/L21","TE1/L22","TCC1/L23","L24","LUNCH","D2/L49","B2/L50","G2/L51","TE2/L52","TCC2/L53","L54"],
            FRI: ["E1/L25","C1/L26","TA1/L27","TF1/L28","TD1/L29","L30","LUNCH","E2/L55","C2/L56","TA2/L57","TF2/L58","TDD2/L59","L60"],
        };

        const TIME_INDICES = {
            "08:00": 0,
            "09:00": 1,
            "10:00": 2,
            "11:00": 3,
            "12:00": 4,
            "14:00": 7,
            "15:00": 8,
            "16:00": 9,
            "17:00": 10,
            "18:00": 11,
        };

        const parseCell = (cell) => {
            if (!cell || cell === "LUNCH") return { theory: null, lab: null };
            const [theory, lab] = cell.split("/");
            return { theory: theory || null, lab: lab || null };
        };

        const slotById = new Map(slots.map((s) => [s._id.toString(), s]));
        const subjectById = new Map(subjects.map((s) => [s._id.toString(), s]));

        const ttMap = {};
        for (const item of timetable) {
            const slotDoc = slotById.get(item.slotId?.toString());
            const subjectDoc = subjectById.get(item.subjectId?.toString());
            if (!slotDoc || !subjectDoc) continue;

            const dayKey = slotDoc.day;
            const idx = TIME_INDICES[slotDoc.start];
            if (!dayKey || idx === undefined) continue;

            const cell = SLOT_GRID[dayKey]?.[idx];
            const { theory, lab } = parseCell(cell);
            if (!theory && !lab) continue;

            const slotCode = slotDoc.isLabSlot ? lab : theory;
            if (!slotCode) continue;

            const short = (subjectDoc.code || "").toString().slice(-4) || "";
            if (!short) continue;

            ttMap[slotCode] = short;
        }

        if (!timetable || timetable.length === 0) {
            return res.status(200).json({
                success: Array.isArray(selections) && selections.length > 0,
                message: Array.isArray(selections) && selections.length > 0
                    ? "No DB schedule found; returning client selections"
                    : "Unable to generate a timetable with the given constraints",
                timetable: Array.isArray(selections) ? selections : []
            });
        }

        res.json({
            success: true,
            timetable,
            ttMap
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveTimetable = async (req, res) => {
    try {
        await connectToDatabase();

        const regNum = req.body?.regNum;
        const timetable = Array.isArray(req.body?.timetable) ? req.body.timetable : [];

        if (!regNum) {
            return res.status(400).json({ error: "regNum is required" });
        }

        await Timetable.deleteMany({ regNum });
        await Timetable.insertMany(timetable.map((row) => ({ ...row, regNum })));

        res.json({ message: "Saved successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTimetable = async (req, res) => {
    try {
        await connectToDatabase();

        const regNum = req.query?.regNum;
        if (!regNum) return res.status(400).json({ error: "regNum is required" });
        const data = await Timetable.find({ regNum });
        res.json(data);
    } catch (err) {
        res.status(503).json({ error: "Database unavailable", detail: err.message });
    }
};
