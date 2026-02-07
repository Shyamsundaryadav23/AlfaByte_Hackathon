import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchEventParticipants,
  setManualAttendance,
  issueCertificate,
  openAttendance,
  openEventQr,
} from "../../services/apiOrganizer";
import EventPolicyPanel from "../../components/common/EventPolicyPanel";

import { QRCodeCanvas } from "qrcode.react";

const MIN_30 = 30 * 60 * 1000;

function toISODate(d) {
  // YYYY-MM-DD
  return new Date(d).toISOString().slice(0, 10);
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Build day segments for a multi-day event.
 * For each day:
 * - first day: dayStart = start_time, dayEnd = endOfDay
 * - middle day: full day
 * - last day: dayStart = startOfDay, dayEnd = end_time
 * - single day: dayStart = start_time, dayEnd = end_time
 */
function buildEventDays(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startDate = startOfDay(start);
  const endDate = startOfDay(end);

  const days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayDate = new Date(d);
    const key = toISODate(dayDate);

    const isFirst = toISODate(dayDate) === toISODate(start);
    const isLast = toISODate(dayDate) === toISODate(end);

    let dayStart = startOfDay(dayDate);
    let dayEnd = endOfDay(dayDate);

    if (isFirst) dayStart = new Date(start);
    if (isLast) dayEnd = new Date(end);

    // if single-day event => both first+last
    if (isFirst && isLast) {
      dayStart = new Date(start);
      dayEnd = new Date(end);
    }

    days.push({
      key,          // YYYY-MM-DD
      label: dayDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
      dayStart,
      dayEnd,
    });
  }
  return days;
}

export default function EventManagement() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventStatus, setEventStatus] = useState("-");
  const [eventMeta, setEventMeta] = useState(null); // {start_time,end_time,title...}
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR modal state
  const [qr, setQr] = useState(null); // { token, expiresAt, qr_type, day }

  // selected day (YYYY-MM-DD)
  const [selectedDay, setSelectedDay] = useState("");

  const load = async (day) => {
    setLoading(true);
    try {
      const res = await fetchEventParticipants(eventId, day);
      setEventStatus(res?.eventStatus || "-");
      setParticipants(Array.isArray(res?.participants) ? res.participants : []);
      setEventMeta(res?.event || null);
    } catch {
      alert("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    load();
  }, [eventId]);

  // ✅ reload when selected day changes
  useEffect(() => {
    if (!selectedDay) return;
    load(selectedDay);
  }, [selectedDay]);


  const days = useMemo(() => {
    if (!eventMeta?.start_time || !eventMeta?.end_time) return [];
    return buildEventDays(eventMeta.start_time, eventMeta.end_time);
  }, [eventMeta?.start_time, eventMeta?.end_time]);

  useEffect(() => {
    if (!days.length) return;

    // if already selected and still valid -> keep
    if (selectedDay && days.some((d) => d.key === selectedDay)) return;

    // pick today if exists else first day
    const todayKey = toISODate(new Date());
    const todayMatch = days.find((x) => x.key === todayKey);
    setSelectedDay(todayMatch ? todayMatch.key : days[0].key);
  }, [days, selectedDay]);


  const selectedDayObj = useMemo(() => {
    return days.find((d) => d.key === selectedDay) || null;
  }, [days, selectedDay]);

  // Button visibility rules
  const now = new Date();

  const canOpenEntryQr = useMemo(() => {
    if (!selectedDayObj) return false;
    const { dayStart, dayEnd } = selectedDayObj;
    return now >= new Date(dayStart.getTime() - MIN_30) && now <= dayEnd;
  }, [selectedDayObj, now]);

  const canOpenExitQr = useMemo(() => {
    if (!selectedDayObj) return false;
    const { dayEnd } = selectedDayObj;
    return now >= new Date(dayEnd.getTime() - MIN_30) && now <= new Date(dayEnd.getTime() + MIN_30);
  }, [selectedDayObj, now]);

  /* ================= ACTIONS ================= */

  const openAtt = async () => {
    const res = await openAttendance(eventId);
    alert(`Attendance Code: ${res.code}`);
  };

  // ✅ Day-wise QR (ENTRY/EXIT) — sends day
  const openQr = async (type) => {
    if (!selectedDayObj) return;
    const res = await openEventQr(eventId, type, selectedDayObj.key); // 👈 pass day YYYY-MM-DD
    setQr({ token: res.token, expiresAt: res.expiresAt, qr_type: type, day: selectedDayObj.key });
  };

  const mark = async (studentId, status) => {
    await setManualAttendance(eventId, studentId, status);
    load();
  };

  const issue = async (studentId) => {
    await issueCertificate(eventId, studentId);
    alert("Certificate issued");
    load();
  };

  const dayStats = useMemo(() => {
  const total = participants.length;
  const present = participants.filter(p => p.attendance_status === "Present").length;
  const absent = total - present;
  return { total, present, absent };
}, [participants]);


  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline text-sm mb-2">
              ← Back
            </button>
            <h1 className="text-3xl font-bold">Event Management</h1>
          </div>

          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
            Status: <b>{eventStatus}</b>
          </span>
        </div>

        {/* ✅ QR / Attendance Panel (NO lifecycle section) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">Attendance</h2>
            </div>

            {/* Day selector */}
            {days.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDay(d.key)}
                    className={`px-4 py-2 rounded-xl text-sm border transition ${
                      selectedDay === d.key
                        ? "bg-blue-600 border-blue-500"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-400">Registered (Day)</p>
              <p className="text-2xl font-bold">{dayStats.total}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-400">Present</p>
              <p className="text-2xl font-bold text-green-300">{dayStats.present}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-400">Absent</p>
              <p className="text-2xl font-bold text-red-300">{dayStats.absent}</p>
            </div>
          </div>

          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {/* optional attendance code */}
            <button
              onClick={openAtt}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Open Attendance
            </button>

            <button
              onClick={() => openQr("ENTRY")}
              disabled={!canOpenEntryQr}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                canOpenEntryQr
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-600/20 text-green-200/60 cursor-not-allowed"
              }`}
              title={!canOpenEntryQr ? "Entry QR is available 30 minutes before day start" : ""}
            >
              Open Entry QR
            </button>

            <button
              onClick={() => openQr("EXIT")}
              disabled={!canOpenExitQr}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                canOpenExitQr
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-600/20 text-red-200/60 cursor-not-allowed"
              }`}
              title={!canOpenExitQr ? "Exit QR is available 30 minutes before day end" : ""}
            >
              Open Exit QR
            </button>
          </div>

          {selectedDayObj && (
            <p className="text-xs text-gray-400 mt-4">
              Selected day window:{" "}
              <b>{selectedDayObj.dayStart.toLocaleString()}</b> →{" "}
              <b>{selectedDayObj.dayEnd.toLocaleString()}</b>
            </p>
          )}
          
        </div>

        {/* PARTICIPANTS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="text-xl font-semibold">Participants</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-400">Loading participants...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-gray-300">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4">Attendance</th>
                    <th className="p-4">Certificate</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map((p) => {
                    const eligible =
                      p.attendance_status === "Present" &&
                      ["Completed", "Archived"].includes(eventStatus) &&
                      !p.certified;

                    return (
                      <tr key={p.student_id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-4 font-medium">{p.name}</td>
                        <td className="p-4 text-gray-300">{p.email}</td>

                        <td className="p-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs border ${
                              p.attendance_status === "Present"
                                ? "border-green-500 text-green-300"
                                : "border-red-500 text-red-300"
                            }`}
                          >
                            {p.attendance_status}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          {p.certified ? (
                            <span className="text-green-300">Issued</span>
                          ) : eligible ? (
                            <span className="text-blue-300">Eligible</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="p-4 flex flex-wrap gap-2 justify-center">
                          {eventStatus === "Live" && (
                            <>
                              <button
                                onClick={() => mark(p.student_id, "Present")}
                                className="bg-green-600 px-3 py-1 rounded-lg text-xs"
                              >
                                Present
                              </button>
                              <button
                                onClick={() => mark(p.student_id, "Absent")}
                                className="bg-red-600 px-3 py-1 rounded-lg text-xs"
                              >
                                Absent
                              </button>
                            </>
                          )}

                          {eligible && (
                            <button
                              onClick={() => issue(p.student_id)}
                              className="bg-blue-600 px-3 py-1 rounded-lg text-xs"
                            >
                              Issue Cert
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {participants.length === 0 && <p className="p-6 text-gray-400">No registrations yet.</p>}
            </div>
          )}
        </div>
      </div>

      {/* QR MODAL */}
      {qr && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white text-black rounded-2xl p-6 text-center relative w-full max-w-sm">
            <button onClick={() => setQr(null)} className="absolute top-2 right-3 text-xl">
              ✕
            </button>

            <h3 className="font-bold mb-1">{qr.qr_type} QR</h3>
            <p className="text-xs text-gray-600 mb-4">Day: <b>{qr.day}</b></p>

            {/* ✅ Include day + type in QR payload */}
            <QRCodeCanvas
              value={JSON.stringify({ eventId, token: qr.token, day: qr.day, qr_type: qr.qr_type })}
              size={220}
            />

            <p className="text-xs mt-3 break-all">
              Token: <b>{qr.token}</b>
            </p>

            {qr.expiresAt && (
              <p className="text-xs text-gray-600 mt-1">
                Expires: {new Date(qr.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
      {eventMeta && (
        <EventPolicyPanel event={{ id: eventId, ...eventMeta }} />
      )}

    </div>
  );
}
