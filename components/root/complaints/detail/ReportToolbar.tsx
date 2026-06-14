"use client";

import { useEffect, useRef } from "react";
import { Printer, X } from "lucide-react";

interface ReportToolbarProps {
  /** Auto-open the print dialog once images have finished loading. */
  autoPrint?: boolean;
}

/**
 * Screen-only control bar that sits above the printable paper.
 * Hidden from the printed/PDF output via `print:hidden`.
 */
export default function ReportToolbar({ autoPrint = true }: ReportToolbarProps) {
  const printed = useRef(false);

  useEffect(() => {
    if (!autoPrint) return;

    const imgs = Array.from(document.querySelectorAll("img"));
    let pending = imgs.filter((img) => !img.complete).length;

    const tryPrint = () => {
      if (printed.current || pending > 0) return;
      printed.current = true;
      // Small delay so the layout settles before the dialog opens.
      setTimeout(() => window.print(), 350);
    };

    if (pending === 0) {
      tryPrint();
      return;
    }

    const handlers: Array<() => void> = [];
    imgs.forEach((img) => {
      if (img.complete) return;
      const onSettled = () => {
        pending -= 1;
        tryPrint();
      };
      img.addEventListener("load", onSettled);
      img.addEventListener("error", onSettled);
      handlers.push(() => {
        img.removeEventListener("load", onSettled);
        img.removeEventListener("error", onSettled);
      });
    });

    return () => handlers.forEach((off) => off());
  }, [autoPrint]);

  return (
    <div className="sticky top-0 z-10 mb-6 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur print:hidden">
      <p className="text-sm text-neutral-500">
        Use <span className="font-medium text-neutral-700">&ldquo;Save as PDF&rdquo;</span>{" "}
        as the destination in the print dialog.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
        >
          <X size={15} />
          Close
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
        >
          <Printer size={15} />
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
