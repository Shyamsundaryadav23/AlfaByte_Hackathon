/**
 * Attendance & Certificate Policy Engine
 *
 * Inputs:
 * - attendanceRows: [{ day, status }]
 * - totalDays: number
 * - attendancePolicy: ENUM
 * - certificatePolicy: JSON
 *
 * Output:
 * {
 *   attendedDays,
 *   attendancePercent,
 *   attended,
 *   certificateEligible,
 *   explanation
 * }
 */

export function evaluateParticipation({
  attendanceRows = [],
  totalDays = 1,
  attendancePolicy = "ENTRY_EXIT",
  certificatePolicy = {},
}) {
  const presentDays = attendanceRows.filter(a => a.status === "Present").length;
  const attendancePercent = totalDays
    ? Math.round((presentDays / totalDays) * 100)
    : 0;

  let attended = false;
  let certificateEligible = false;
  let explanation = [];

  /* ================= ATTENDANCE RULES ================= */

  switch (attendancePolicy) {
    case "SINGLE_QR":
      attended = presentDays >= 1;
      explanation.push(
        attended
          ? "Attendance verified via single QR scan."
          : "Attendance not verified."
      );
      break;

    case "ENTRY_EXIT":
      attended = presentDays >= 1;
      explanation.push(
        attended
          ? "Entry and Exit verified."
          : "Entry/Exit incomplete."
      );
      break;

    case "MANUAL":
      attended = presentDays >= 1;
      explanation.push(
        attended
          ? "Manually marked present."
          : "Not marked present."
      );
      break;

    case "HYBRID":
      attended = presentDays >= 1;
      explanation.push(
        attended
          ? "Attendance verified via hybrid method."
          : "Attendance incomplete."
      );
      break;

    default:
      attended = presentDays >= 1;
      explanation.push("Default attendance rule applied.");
  }

  /* ================= CERTIFICATE RULES ================= */

  if (certificatePolicy?.rule === "ALL_DAYS") {
    certificateEligible = presentDays === totalDays;
    explanation.push(
      certificateEligible
        ? "Attended all days."
        : `Attended ${presentDays}/${totalDays} days. All days required.`
    );
  }

  else if (certificatePolicy?.min_percent) {
    certificateEligible = attendancePercent >= certificatePolicy.min_percent;
    explanation.push(
      certificateEligible
        ? `Attendance ${attendancePercent}% meets requirement.`
        : `Attendance ${attendancePercent}% below required ${certificatePolicy.min_percent}%.`
    );
  }

  else if (certificatePolicy?.required_days) {
    certificateEligible = certificatePolicy.required_days.every(
      d => attendanceRows.some(a => a.day === d && a.status === "Present")
    );
    explanation.push(
      certificateEligible
        ? "Required key days attended."
        : "Missed required key days."
    );
  }

  else {
    // Default: attend at least once
    certificateEligible = attended;
    explanation.push(
      certificateEligible
        ? "Attendance sufficient for certificate."
        : "Attendance insufficient for certificate."
    );
  }

  return {
    attendedDays: presentDays,
    attendancePercent,
    attended,
    certificateEligible,
    explanation: explanation.join(" "),
  };
}
