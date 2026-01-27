import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/public/LandingPage"; // Make sure this file exists
import ClubEventsPage from "./pages/public/ClubEventsPage"; // Make sure this file exists
import EventExplorePage from "./pages/public/EventExplorePage"; // Make sure this file exists
import StudentDashboard from "./pages/student/StudentDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Route for landing page */}
        <Route path="/" element={<LandingPage />} />
        {/* Club Events Page */}
        <Route path="/club/:clubId" element={<ClubEventsPage />} />
        <Route path="/event/:eventId" element={<EventExplorePage />} />
        {/* Optional: 404 Page */}
        {/* <Route path="*" element={<NotFound />} /> */}

        <Route path="/studentdashboard" element={<StudentDashboard/>} />
      </Routes>
    </Router>
  );
}
