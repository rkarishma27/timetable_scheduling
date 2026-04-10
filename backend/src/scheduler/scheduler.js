const { isValid } = require("./constraints");

function schedule(subjects, slots, rooms) {

    let timetable = [];

    subjects.sort((a, b) => a.hoursPerWeek - b.hoursPerWeek);

    function backtrack(index) {

        if (index >= subjects.length) return true;

        let subject = subjects[index];

        if (subject.type === "lab") {

            for (let i = 0; i < slots.length - 1; i++) {

                let s1 = slots[i];
                let s2 = slots[i + 1];

                if (s1.day !== s2.day) continue;

                for (let room of rooms) {

                    if (room.type !== "lab") continue;

                    if (
                        isValid({}, timetable, subject, s1, room) &&
                        isValid({}, timetable, subject, s2, room)
                    ) {

                        timetable.push({
                            slotId: s1._id,
                            subjectId: subject._id,
                            facultyId: subject.facultyId,
                            roomId: room._id
                        });

                        timetable.push({
                            slotId: s2._id,
                            subjectId: subject._id,
                            facultyId: subject.facultyId,
                            roomId: room._id
                        });

                        if (backtrack(index + 1)) return true;

                        timetable.pop();
                        timetable.pop();
                    }
                }
            }
        }

        // THEORY
        else {
            for (let slot of slots) {
                for (let room of rooms) {

                    if (room.type !== "theory") continue;

                    if (isValid({}, timetable, subject, slot, room)) {

                        timetable.push({
                            slotId: slot._id,
                            subjectId: subject._id,
                            facultyId: subject.facultyId,
                            roomId: room._id
                        });

                        if (backtrack(index + 1)) return true;

                        timetable.pop();
                    }
                }
            }
        }

        return false;
    }

    const ok = backtrack(0);
    return ok ? timetable : [];
}

module.exports = { schedule };