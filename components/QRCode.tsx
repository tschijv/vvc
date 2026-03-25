"use client";

import { useState } from "react";

interface Props {
  url: string;
  title?: string;
}

export default function QRCode({ url, title }: Props) {
  const [open, setOpen] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=500");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>QR Code${title ? ` — ${title}` : ""}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:Arial,sans-serif;">
          <h2 style="margin-bottom:1rem;color:#1a6ca8;">${title || "QR Code"}</h2>
          <img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;" />
          <p style="margin-top:0.75rem;font-size:0.75rem;color:#666;max-width:280px;word-break:break-all;text-align:center;">${url}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        title="Toon QR-code"
        aria-label="Toon QR-code"
        aria-expanded={open}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013 9.375v-4.5zM4.875 4.5a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zM14.625 4.5a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013 19.125v-4.5zM4.875 14.25a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5z" clipRule="evenodd" />
          <path d="M12.75 12.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H13.5a.75.75 0 01-.75-.75v-.008zM15 12.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM17.25 12.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H18a.75.75 0 01-.75-.75v-.008zM12.75 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H13.5a.75.75 0 01-.75-.75V15zM15 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75V15zM12.75 17.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H13.5a.75.75 0 01-.75-.75v-.008zM15 17.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM17.25 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H18a.75.75 0 01-.75-.75V15zM17.25 17.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H18a.75.75 0 01-.75-.75v-.008z" />
        </svg>
        <span className="hidden sm:inline text-xs">QR</span>
      </button>

      {open && (
        <div className="mt-2 p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm inline-block">
          <img
            src={qrUrl}
            alt={`QR code voor ${title || url}`}
            width={150}
            height={150}
            className="rounded"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handlePrint}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Print QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
