function isLunch(slot) {
    return slot.start >= "12:30" && slot.start < "14:00";
}

function isSlotUsed(slotId, timetable) {
    return timetable.some(t => t.slotId.toString() === slotId.toString());
}

function isFacultyBusy(facultyId, slotId, timetable) {
    return timetable.some(
        t => t.facultyId === facultyId && t.slotId.toString() === slotId.toString()
    );
}

function isRoomBusy(roomId, slotId, timetable) {
    return timetable.some(
        t => t.roomId.toString() === roomId.toString() &&
             t.slotId.toString() === slotId.toString()
    );
}

function isValid(assign, timetable, subject, slot, room) {

    if (isLunch(slot)) return false;

    if (isSlotUsed(slot._id, timetable)) return false;

    if (isFacultyBusy(subject.facultyId, slot._id, timetable)) return false;

    if (isRoomBusy(room._id, slot._id, timetable)) return false;

    if (subject.type === "lab" && room.type !== "lab") return false;

    if (subject.type === "theory" && room.type !== "theory") return false;

    return true;
}

module.exports = { isValid };