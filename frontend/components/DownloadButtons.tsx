import React from "react";

export default function DownloadButtons({ csvUrl, pdfUrl }: { csvUrl: string; pdfUrl: string }) {
  return (
    <div className="flex gap-3 mt-2">
      <a href={csvUrl} download className="btn btn-sm btn-accent">Download CSV</a>
      <a href={pdfUrl} download className="btn btn-sm btn-accent">Download PDF</a>
    </div>
  );
}
