import React, { useState } from "react";
import { toast } from "sonner";
import { Download, BadgeCheck } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function CertificateCard({ participation }) {
  const [downloading, setDownloading] = useState(false);

  const certificateId = participation?.certificateId;

  const downloadCertificate = async () => {
    if (!certificateId) {
      toast.error("Certificate not available yet.", { duration: 3000 });
      return;
    }

    setDownloading(true);
    const tId = toast.loading("Preparing certificate...", { duration: Infinity });

    try {
      // ✅ If your backend returns a file URL, use that
      // Example expected: { url: "https://..." } OR directly a PDF stream
      const res = await fetch(
        `${BACKEND}/api/students/certificates/${certificateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // If you haven't built this API yet:
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.dismiss(tId);
        toast.error(data.error || "Download failed", { duration: 3500 });
        return;
      }

      // ✅ Download blob (PDF)
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(tId);
      toast.success("Certificate downloaded ✅", { duration: 2500 });
    } catch (err) {
      toast.dismiss(tId);
      toast.error("Network error. Please try again.", { duration: 3500 });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white line-clamp-1">
            {participation?.eventName || "Event"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {participation?.club || "Club"} · {participation?.year || "—"}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
          <BadgeCheck className="w-4 h-4" />
          Certified
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-300">
        <p>
          Certificate ID:{" "}
          <span className="font-mono text-xs text-gray-200 break-all">
            {certificateId || "—"}
          </span>
        </p>
      </div>

      <button
        onClick={downloadCertificate}
        disabled={!certificateId || downloading}
        className={`mt-5 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition ${
          !certificateId || downloading
            ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/10"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        <Download className="w-4 h-4" />
        {downloading ? "Downloading..." : "Download Certificate"}
      </button>

      {!certificateId && (
        <p className="mt-3 text-xs text-gray-500">
          Certificate will appear after attendance is verified and organizer issues it.
        </p>
      )}
    </div>
  );
}
