// utils/certificates.js
import crypto from "crypto";

const SECRET = process.env.CERTIFICATE_SECRET;
const PREFIX = process.env.CERT_PREFIX || "PCCOE";

export function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function buildCertificateNo({ year, eventSeq, serial }) {
  const serialStr = String(serial).padStart(5, "0");
  return `${PREFIX}-${year}-EVT-${eventSeq}-${serialStr}`;
}

export function buildVerificationHash({ certificateNo, studentId, eventId, issuedAtISO }) {
  if (!SECRET) throw new Error("CERTIFICATE_SECRET missing");
  const raw = `${certificateNo}|${studentId}|${eventId}|${issuedAtISO}|${SECRET}`;
  return sha256(raw);
}
