import * as AttendanceService from "../services/attendance.service.js";

export const registerForEvent = async (req, res, next) => {
  try {
    const data = await AttendanceService.register(req.body.eventId, req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
// Student QR scan
// Use JWT userId from authMiddleware
export const markAttendanceQR = async (req, res, next) => {
  try {
    const { eventId, type } = req.body;
    const studentId = req.user.userId; // Automatically from JWT

    if (type !== "entry" && type !== "exit") {
      throw new Error("Invalid type. Use 'entry' or 'exit'.");
    }

    const record = await AttendanceService.mark(eventId, studentId, type);
    res.json({ message: "Attendance marked successfully", record });
  } catch (err) {
    next(err);
  }
};


export const getAttendance = async (req, res, next) => {
  try {
    const list = await AttendanceService.listAttendance(req.params.eventId);
    res.json(list);
  } catch (err) {
    next(err);
  }
};
