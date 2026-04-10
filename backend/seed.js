const mongoose = require("mongoose");
require("dotenv").config();

const Subject = require("./src/models/subject");
const Slot = require("./src/models/slot");
const Room = require("./src/models/room");

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];


const TIME_BLOCKS = [
  { start: "08:00", end: "08:50" },
  { start: "09:00", end: "09:50" },
  { start: "10:00", end: "10:50" },
  { start: "11:00", end: "11:50" },
  { start: "12:00", end: "12:50" },
  { start: "14:00", end: "14:50" },
  { start: "15:00", end: "15:50" },
  { start: "16:00", end: "16:50" },
  { start: "17:00", end: "17:50" },
  { start: "18:00", end: "18:50" },
];

const THEORY_ROOMS = ["T101", "T102", "T103"];
const LAB_ROOMS = ["L201", "L202"];

const FACULTY = [
  "Dr. Ramesh Kumar",
  "Prof. Anita Sharma",
  "Dr. Venkat Raman",
  "Dr. Priya Nair",
  "Prof. Suresh Babu",
];

async function seed() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/timetable";

  await mongoose.connect(mongoUri);

  await Promise.all([Subject.deleteMany({}), Slot.deleteMany({}), Room.deleteMany({})]);

  const rooms = [
    ...THEORY_ROOMS.map((name) => ({ name, type: "theory" })),
    ...LAB_ROOMS.map((name) => ({ name, type: "lab" })),
  ];
  await Room.insertMany(rooms);

  const slots = [];
  for (const day of DAYS) {
    for (const tb of TIME_BLOCKS) {
      slots.push({ day, start: tb.start, end: tb.end, isLabSlot: false });
    }
  }
  for (const day of DAYS) {
    for (const tb of TIME_BLOCKS) {
      slots.push({ day, start: tb.start, end: tb.end, isLabSlot: true });
    }
  }
  await Slot.insertMany(slots);


  const subjects = [];
  for (const facultyId of FACULTY) {
    subjects.push({
      name: `${facultyId} Theory`,
      code: `${facultyId.replace(/\\W+/g, "").slice(0, 6)}TH`,
      type: "theory",
      hoursPerWeek: 2,
      facultyId,
    });
    subjects.push({
      name: `${facultyId} Lab`,
      code: `${facultyId.replace(/\\W+/g, "").slice(0, 6)}LB`,
      type: "lab",
      hoursPerWeek: 2,
      facultyId,
    });
  }
  await Subject.insertMany(subjects);

  console.log("Seed complete:");
  console.log("  rooms:", await Room.countDocuments({}));
  console.log("  slots:", await Slot.countDocuments({}));
  console.log("  subjects:", await Subject.countDocuments({}));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

