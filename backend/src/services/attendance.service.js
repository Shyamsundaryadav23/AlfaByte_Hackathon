import {
  registerStudent,
  markAttendance as markAttendanceModel,
  getEventAttendance,
  hasStudentAttended
} from "../models/attendance.model.js";

export const register = async (eventId, studentId) => {
  return await registerStudent(eventId, studentId);
};

/**
 * Mark attendance using an action/type ("entry" | "exit").
 * The model handles timestamps + validation.
 */
export const mark = async (eventId, studentId, type) => {
  return await markAttendanceModel(eventId, studentId, type);
};

export const listAttendance = async (eventId) => {
  return await getEventAttendance(eventId);
};

export const checkAttendance = async (eventId, studentId) => {
  return await hasStudentAttended(eventId, studentId);
};
