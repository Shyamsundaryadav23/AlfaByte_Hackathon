import React from "react";

const CertificateCard = ({ participation }) => {
  const downloadCertificate = () => {
    alert(`Downloading certificate ${participation.certificateId}`);
    // Replace with actual download logic
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-1">
        {participation.eventName}
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        {participation.club} · {participation.year}
      </p>
      <p className="text-sm mb-3">
        Certificate ID:{" "}
        <span className="font-mono text-xs">
          {participation.certificateId}
        </span>
      </p>
      <button
        onClick={downloadCertificate}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Download Certificate
      </button>
    </div>
  );
};

export default CertificateCard;
