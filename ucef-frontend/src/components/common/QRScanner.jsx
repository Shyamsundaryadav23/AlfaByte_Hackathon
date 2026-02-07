// components/common/QRScanner.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { toast } from "sonner";
import { Camera, QrCode, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const SCAN_COOLDOWN_MS = 2000;

export default function QRScanner({ profile }) {
  // ✅ Make region id stable AND unique (avoids conflicts if component mounts twice quickly)
  const regionIdRef = useRef(`qr-reader-region-${Math.random().toString(36).slice(2)}`);
  const regionId = regionIdRef.current;

  const qrRef = useRef(null);            // Html5Qrcode instance
  const lastScanAtRef = useRef(0);       // throttle scans
  const mountedRef = useRef(false);      // strict-mode safe
  const startLockRef = useRef(false);    // hard-lock double start race
  const sessionRef = useRef(0);          // ignore callbacks from old sessions

  const jwt = localStorage.getItem("token");

  const [status, setStatus] = useState({
    type: "idle", // idle | scanning | success | error | stopped
    title: "Ready to scan",
    message: "Point your camera at the QR code.",
  });

  const [scannedPayload, setScannedPayload] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [scannerActive, setScannerActive] = useState(false); // ✅ use state for UI (not refs)

  const studentInfo = useMemo(() => {
    return {
      name: profile?.name || localStorage.getItem("studentName") || "Student",
      email: profile?.email || localStorage.getItem("studentEmail") || "—",
      rollNo: profile?.rollNo || "—",
      department: profile?.department || "—",
    };
  }, [profile]);

  const setErr = (title, message) => setStatus({ type: "error", title, message });
  const setOk = (title, message) => setStatus({ type: "success", title, message });

  const parseQr = (decodedText) => {
    try {
      const obj = JSON.parse(decodedText);
      if (!obj?.eventId || !obj?.token) return null;
      return obj;
    } catch {
      return null;
    }
  };

  const hardClearRegion = () => {
    const el = document.getElementById(regionId);
    if (el) el.innerHTML = ""; // ✅ removes old injected <video> frame
  };

  const stopScanner = async (reason = "stopped") => {
    // prevent overlap stop/start
    if (isStopping) return;

    setIsStopping(true);

    try {
      // invalidate all older callbacks
      sessionRef.current += 1;

      if (qrRef.current) {
        try {
          // stop() throws if not running; safe in try
          await qrRef.current.stop();
        } catch {
          // ignore
        }

        try {
          await qrRef.current.clear();
        } catch {
          // ignore
        }

        qrRef.current = null;
      }

      // ✅ always clear DOM container too
      hardClearRegion();
    } finally {
      setScannerActive(false);
      setIsStopping(false);

      setStatus((s) => ({
        ...s,
        type: "stopped",
        title: reason === "success" ? "Scan completed" : "Scanner closed",
        message:
          reason === "success"
            ? "You can close this tab or scan again later."
            : "Tap Start to scan again.",
      }));
    }
  };

  const startScanner = async () => {
    if (!mountedRef.current) return;

    // ✅ strict hard lock to prevent double start (React strict mode / fast tab switching)
    if (startLockRef.current) return;
    startLockRef.current = true;

    if (isStarting || scannerActive) {
      startLockRef.current = false;
      return;
    }

    if (!jwt) {
      toast.error("Please login to scan QR.", { duration: 3500 });
      setErr("Not logged in", "Please login to scan QR codes.");
      startLockRef.current = false;
      return;
    }

    setIsStarting(true);
    setScannedPayload(null);
    setStatus({ type: "scanning", title: "Scanning…", message: "Align QR inside the frame." });

    // ✅ new session id; callbacks from older sessions are ignored
    const mySession = sessionRef.current + 1;
    sessionRef.current = mySession;

    try {
      // ✅ ensure only ONE frame: clear any old injected dom first
      hardClearRegion();

      // ✅ if an instance exists (rare), stop it first
      if (qrRef.current) {
        await stopScanner("stopped");
      }

      if (!mountedRef.current || sessionRef.current !== mySession) return;

      const html5Qr = new Html5Qrcode(regionId);
      qrRef.current = html5Qr;

      const config = { fps: 10, qrbox: { width: 260, height: 260 } };

      await html5Qr.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          // ignore callbacks from stale sessions
          if (!mountedRef.current || sessionRef.current !== mySession) return;

          // throttle
          const now = Date.now();
          if (now - lastScanAtRef.current < SCAN_COOLDOWN_MS) return;
          lastScanAtRef.current = now;

          const payload = parseQr(decodedText);
          if (!payload) {
            toast.warning("Invalid QR format", { duration: 2500 });
            setErr("Invalid QR", "This QR is not from Unified Campus Events.");
            return;
          }

          setScannedPayload(payload);

          try {
            const res = await axios.post(
              `${BACKEND}/api/students/events/${payload.eventId}/qr/scan`,
              {
                token: payload.token,
                day: payload.day,
                qr_type: payload.qr_type,
              },
              { headers: { Authorization: `Bearer ${jwt}` } }
            );

            const msg = res.data?.message || "Scan success!";
            toast.success("Scan successful ✅", { description: msg, duration: 3000 });
            setOk("Scan successful ✅", msg);

            // ✅ Auto close scanner after success
            setTimeout(() => {
              if (mountedRef.current) stopScanner("success");
            }, 700);
          } catch (err) {
            const apiErr =
              err?.response?.data?.error ||
              err?.message ||
              "Scan failed. Please try again.";

            if (String(err?.response?.status) === "401") {
              toast.error("Session expired. Please login again.", { duration: 3500 });
              setErr("Unauthorized", "Your session expired. Please login again.");
              setTimeout(() => {
                if (mountedRef.current) stopScanner("error");
              }, 800);
              return;
            }

            if (String(err?.response?.status) === "400") {
              toast.warning(apiErr, { duration: 3500 });
              setErr("Cannot accept scan", apiErr);
              return;
            }

            toast.error(apiErr, { duration: 3500 });
            setErr("Scan failed", apiErr);
          }
        },
        () => {}
      );

      // ✅ if start succeeds:
      if (!mountedRef.current || sessionRef.current !== mySession) return;
      setScannerActive(true);
    } catch (e) {
      setScannerActive(false);
      qrRef.current = null;
      hardClearRegion();

      const msg = String(e?.message || e);
      if (msg.toLowerCase().includes("permission")) {
        setErr("Camera permission denied", "Please allow camera access in browser settings.");
      } else if (msg.toLowerCase().includes("not found")) {
        setErr("No camera found", "No camera device detected on this device.");
      } else {
        setErr("Unable to start scanner", "Please refresh and try again.");
      }

      toast.error("Unable to start QR scanner", { duration: 3500 });
    } finally {
      setIsStarting(false);
      startLockRef.current = false; // ✅ release lock
    }
  };

  // ✅ Auto start when tab opens (StrictMode safe)
  useEffect(() => {
    mountedRef.current = true;

    // start on next tick (helps DOM be ready + avoids some double frame issues)
    const t = setTimeout(() => startScanner(), 0);

    return () => {
      clearTimeout(t);
      mountedRef.current = false;
      stopScanner("stopped");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatusIcon = () => {
    if (status.type === "success") return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (status.type === "error") return <XCircle className="w-5 h-5 text-red-400" />;
    if (status.type === "scanning") return <QrCode className="w-5 h-5 text-blue-400" />;
    return <Camera className="w-5 h-5 text-gray-300" />;
  };

  return (
    <div className="w-full">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Scanner
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Scan <b>ENTRY</b> on arrival and <b>EXIT</b> before leaving.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {scannerActive && (
              <button
                onClick={() => stopScanner("stopped")}
                disabled={isStopping}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-semibold"
              >
                {isStopping ? "Closing..." : "Close"}
              </button>
            )}

            {!scannerActive && (
              <button
                onClick={startScanner}
                disabled={isStarting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
              >
                {isStarting ? "Starting..." : "Start"}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* Scanner box */}
          <div className="relative">
            <div className="relative rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-4 top-4 w-8 h-8 border-l-4 border-t-4 border-blue-500/80 rounded-tl-2xl" />
                <div className="absolute right-4 top-4 w-8 h-8 border-r-4 border-t-4 border-blue-500/80 rounded-tr-2xl" />
                <div className="absolute left-4 bottom-4 w-8 h-8 border-l-4 border-b-4 border-blue-500/80 rounded-bl-2xl" />
                <div className="absolute right-4 bottom-4 w-8 h-8 border-r-4 border-b-4 border-blue-500/80 rounded-br-2xl" />

                {status.type === "scanning" && (
                  <div className="absolute left-0 right-0 top-10 h-[2px] bg-blue-500/70 animate-pulse" />
                )}
              </div>

              {/* Html5-qrcode mounts here */}
              <div id={regionId} className="w-full min-h-[320px]" />
            </div>

            <div
              className={`mt-4 rounded-2xl border p-4 flex items-start gap-3 ${
                status.type === "success"
                  ? "border-green-500/20 bg-green-500/10"
                  : status.type === "error"
                  ? "border-red-500/20 bg-red-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="mt-0.5">
                <StatusIcon />
              </div>
              <div>
                <p className="font-semibold">{status.title}</p>
                <p className="text-sm text-gray-300 mt-1">{status.message}</p>
              </div>
            </div>

            {scannedPayload && (
              <div className="mt-4 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-auto">
                <p className="font-semibold text-gray-200 mb-2">Scanned QR payload</p>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(scannedPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Student card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-gray-300" />
              <h3 className="font-semibold text-lg">Student Details</h3>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Name" value={studentInfo.name} />
              <Row label="Email" value={studentInfo.email} />
              <Row label="Roll No" value={studentInfo.rollNo} />
              <Row label="Department" value={studentInfo.department} />
            </div>

            <div className="mt-5 text-xs text-gray-400 leading-relaxed">
              <p>Your profile is attached to the scan automatically using your login token.</p>
              <p className="mt-2">Tip: Use good lighting and hold the phone steady for 1–2 seconds.</p>
            </div>

            {status.type === "stopped" && (
              <div className="mt-5">
                <button
                  onClick={startScanner}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                >
                  Scan another QR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-100 font-semibold truncate max-w-[60%]" title={value}>
        {value}
      </span>
    </div>
  );
}
