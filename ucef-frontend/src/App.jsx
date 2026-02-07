import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Public Pages */
import Home from "./pages/public/Home";
import ClubEventsPage from "./pages/public/ClubEventsPage";
import EventExplorePage from "./pages/public/EventExplorePage";

/* Student */
import StudentDashboard from "./pages/student/StudentDashboard";
import FirstTimeJoinFlow from "./pages/student/FirstTimeJoinFlow";
/* Organizer */
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import EventManagement from "./pages/organizer/EventManagement";

/* Admin */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import ManageClubs from "./pages/admin/ManageClubs";
import ManageMembers from "./pages/admin/ManageMembers";


/* Auth */
import StudentLogin from "./pages/auth/Login";        // student only
import ClubLogin from "./pages/auth/ClubLogin";
import AdminLogin from "./pages/auth/AdminLogin";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ================= PUBLIC ================= */}
        {/* Landing Page */}
        <Route path="/" element={<Home />} /> 
        <Route path="/club/:clubId" element={<ClubEventsPage />} />
        <Route path="/event/:eventId" element={<EventExplorePage />} />

        {/* ================= STUDENT ================= */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/club/:clubId/event/:eventId/join" element={<FirstTimeJoinFlow />} />

        {/* ================= ORGANIZER ================= */}
        <Route path="/organizer/login" element={<ClubLogin />} />
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/event/:eventId" element={<EventManagement />} />

        

        {/* ================= ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="/admin/clubs" element={<ManageClubs />} />
        <Route path="/admin/clubs/:clubId/members" element={<ManageMembers />} />

        {/* ================= FALLBACK ================= */}
        {/* <Route path="*" element={<NotFound />} /> */}

      </Routes>
    </Router>
  );
}
