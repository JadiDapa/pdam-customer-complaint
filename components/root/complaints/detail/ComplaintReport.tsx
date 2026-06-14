import { format } from "date-fns";
import { ComplaintStatus, DisturbanceType } from "@/generated/prisma";
import ReportToolbar from "./ReportToolbar";

// ─── Types ──────────────────────────────────────────────────────────────────

type ReportComplaint = {
  id: number;
  title: string;
  description: string | null;
  disturbanceType: DisturbanceType;
  status: ComplaintStatus;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    customerId: string;
    phoneNumber: string | null;
    address: string;
    user: { fullname: string };
  } | null;
  technician: {
    fullname: string;
    region: string | null;
    phoneNumber: string;
  } | null;
  images: {
    id: number;
    url: string;
    filename: string;
    type: "COMPLAINT" | "EVIDENCE";
  }[];
};

interface ComplaintReportProps {
  complaint: ReportComplaint;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const COMPANY = {
  name: "PDAM Tirta Musi",
  tagline: "Perusahaan Daerah Air Minum",
  unit: "Complaint Management Unit",
  logo: "https://fornews.co/news/inline/2021/02/Logo-PDAM-Tirta-Musi.png",
};

const disturbanceLabels: Record<DisturbanceType, string> = {
  KEBOCORAN_PIPA: "Pipe Leakage",
  AIR_TIDAK_MENGALIR: "No Water Flow",
  AIR_KERUH: "Turbid Water",
  TEKANAN_RENDAH: "Low Pressure",
  PIPA_PECAH: "Burst Pipe",
  METER_RUSAK: "Broken Meter",
  LAINNYA: "Other",
};

const statusConfig: Record<
  ComplaintStatus,
  { label: string; text: string; bg: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    text: "#b45309",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  IN_PROGRESS: {
    label: "In Progress",
    text: "#1d4ed8",
    bg: "#eff6ff",
    border: "#93c5fd",
  },
  RESOLVED: {
    label: "Resolved",
    text: "#15803d",
    bg: "#f0fdf4",
    border: "#86efac",
  },
  CANCELLED: {
    label: "Cancelled",
    text: "#525252",
    bg: "#f5f5f5",
    border: "#d4d4d4",
  },
};

const timelineSteps: { key: ComplaintStatus; label: string }[] = [
  { key: "PENDING", label: "Submitted" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
];

const stepOrder: Record<ComplaintStatus, number> = {
  PENDING: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CANCELLED: 0,
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ComplaintReport({ complaint }: ComplaintReportProps) {
  const status = statusConfig[complaint.status];
  const reportRef = `PDAM/CR/${complaint.id.toString().padStart(5, "0")}`;
  const generatedAt = new Date();

  const complaintImages = complaint.images.filter((i) => i.type === "COMPLAINT");
  const evidenceImages = complaint.images.filter((i) => i.type === "EVIDENCE");

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .report-paper { box-shadow: none !important; margin: 0 !important; }
        }
        .report-paper, .report-paper * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      <ReportToolbar autoPrint />

      <div className="flex justify-center px-4 pb-10 print:p-0">
        <div
          className="report-paper w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[14mm] text-neutral-800 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_18px_50px_-20px_rgba(0,0,0,0.25)] print:shadow-none"
          style={{ fontSize: "11px", lineHeight: 1.5 }}
        >
          {/* ── Letterhead ─────────────────────────────────────── */}
          <header className="flex items-start justify-between gap-6 border-b-2 border-sky-700 pb-5">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMPANY.logo}
                alt={COMPANY.name}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 object-contain"
              />
              <div>
                <h1 className="text-[18px] font-black tracking-wide text-sky-800 uppercase">
                  {COMPANY.name}
                </h1>
                <p className="text-[10px] tracking-wide text-neutral-500 uppercase">
                  {COMPANY.tagline}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-neutral-600">
                  {COMPANY.unit}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block rounded-md bg-sky-700 px-3 py-1.5 text-[12px] font-bold tracking-wider text-white uppercase">
                Complaint Report
              </div>
              <dl className="mt-2 space-y-0.5 text-[10px] text-neutral-500">
                <div className="flex justify-end gap-2">
                  <dt>Ref. No.</dt>
                  <dd className="font-mono font-semibold text-neutral-700">
                    {reportRef}
                  </dd>
                </div>
                <div className="flex justify-end gap-2">
                  <dt>Generated</dt>
                  <dd className="font-medium text-neutral-700">
                    {format(generatedAt, "dd MMM yyyy, HH:mm")}
                  </dd>
                </div>
              </dl>
            </div>
          </header>

          {/* ── Title + status banner ──────────────────────────── */}
          <section className="mt-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-semibold tracking-widest text-sky-700 uppercase">
                {disturbanceLabels[complaint.disturbanceType]} · Complaint #
                {complaint.id}
              </p>
              <h2 className="mt-1 text-[18px] leading-snug font-bold text-neutral-900">
                {complaint.title}
              </h2>
            </div>
            <span
              className="shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide uppercase"
              style={{
                color: status.text,
                backgroundColor: status.bg,
                borderColor: status.border,
              }}
            >
              {status.label}
            </span>
          </section>

          {/* ── Progress timeline ──────────────────────────────── */}
          <ProgressBar status={complaint.status} />

          {/* ── Detail grid ────────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6">
            <Section title="Complaint Information">
              <Field label="Complaint ID" value={`#${complaint.id}`} mono />
              <Field
                label="Disturbance Type"
                value={disturbanceLabels[complaint.disturbanceType]}
              />
              <Field label="Status" value={status.label} />
              <Field
                label="Submitted On"
                value={format(
                  new Date(complaint.createdAt),
                  "dd MMMM yyyy, HH:mm",
                )}
              />
              <Field
                label="Last Updated"
                value={format(
                  new Date(complaint.updatedAt),
                  "dd MMMM yyyy, HH:mm",
                )}
              />
            </Section>

            <Section title="Assignment & Schedule">
              <Field
                label="Scheduled Visit"
                value={
                  complaint.scheduledAt
                    ? format(
                        new Date(complaint.scheduledAt),
                        "dd MMMM yyyy, HH:mm",
                      )
                    : "Not scheduled"
                }
              />
              <Field
                label="Assigned Technician"
                value={complaint.technician?.fullname ?? "Not assigned"}
              />
              <Field
                label="Service Region"
                value={complaint.technician?.region ?? "—"}
              />
              <Field
                label="Technician Contact"
                value={complaint.technician?.phoneNumber ?? "—"}
              />
            </Section>
          </div>

          {/* ── Customer ───────────────────────────────────────── */}
          <Section title="Customer Information" className="mt-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field
                label="Full Name"
                value={complaint.customer?.user.fullname ?? "—"}
              />
              <Field
                label="Customer ID"
                value={complaint.customer?.customerId ?? "—"}
                mono
              />
              <Field
                label="Phone Number"
                value={complaint.customer?.phoneNumber ?? "—"}
              />
              <Field
                label="Service Address"
                value={complaint.customer?.address ?? "—"}
              />
            </div>
          </Section>

          {/* ── Description ────────────────────────────────────── */}
          <Section title="Complaint Description" className="mt-6">
            {complaint.description ? (
              <p className="leading-relaxed whitespace-pre-line text-neutral-700">
                {complaint.description}
              </p>
            ) : (
              <p className="text-neutral-400 italic">No description provided.</p>
            )}
          </Section>

          {/* ── Photos ─────────────────────────────────────────── */}
          <PhotoSection
            title="Complaint Photos"
            images={complaintImages}
            emptyText="No photos were attached to this complaint."
          />

          {evidenceImages.length > 0 && (
            <PhotoSection
              title="Follow-up Evidence"
              images={evidenceImages}
              accent
            />
          )}

          {/* ── Signatures ─────────────────────────────────────── */}
          <section className="mt-10 grid grid-cols-2 gap-12 break-inside-avoid">
            <SignatureBlock
              role="Customer"
              name={complaint.customer?.user.fullname ?? ""}
            />
            <SignatureBlock
              role="Field Officer"
              name={complaint.technician?.fullname ?? ""}
            />
          </section>

          {/* ── Footer ─────────────────────────────────────────── */}
          <footer className="mt-10 border-t border-neutral-200 pt-3 text-[9px] text-neutral-400">
            <div className="flex items-center justify-between">
              <span>
                {COMPANY.name} — {COMPANY.unit}
              </span>
              <span>
                Document ref. {reportRef} · Generated{" "}
                {format(generatedAt, "dd MMM yyyy HH:mm")}
              </span>
            </div>
            <p className="mt-1">
              This document is computer-generated from the PDAM complaint
              management system and is valid without a wet signature.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`break-inside-avoid ${className}`}>
      <h3 className="mb-2.5 border-b border-neutral-200 pb-1.5 text-[11px] font-bold tracking-wider text-sky-800 uppercase">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-medium tracking-wide text-neutral-400 uppercase">
        {label}
      </p>
      <p
        className={`mt-0.5 font-medium text-neutral-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressBar({ status }: { status: ComplaintStatus }) {
  const current = stepOrder[status];
  const cancelled = status === "CANCELLED";

  return (
    <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 break-inside-avoid">
      {cancelled ? (
        <p className="text-center text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          This complaint was cancelled
        </p>
      ) : (
        <div className="flex items-center">
          {timelineSteps.map((step, i) => {
            const done = stepOrder[step.key] < current;
            const active = step.key === status;
            const reached = done || active;
            const isLast = i === timelineSteps.length - 1;
            return (
              <div
                key={step.key}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{
                      backgroundColor: reached ? "#0369a1" : "#d4d4d4",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-[9px] font-semibold tracking-wide uppercase"
                    style={{ color: reached ? "#0369a1" : "#a3a3a3" }}
                  >
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className="mx-2 mb-4 h-0.5 flex-1"
                    style={{
                      backgroundColor:
                        stepOrder[step.key] < current ? "#0369a1" : "#d4d4d4",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PhotoSection({
  title,
  images,
  emptyText,
  accent = false,
}: {
  title: string;
  images: { id: number; url: string; filename: string }[];
  emptyText?: string;
  accent?: boolean;
}) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h3
        className={`mb-2.5 flex items-center justify-between border-b pb-1.5 text-[11px] font-bold tracking-wider uppercase ${
          accent
            ? "border-green-200 text-green-700"
            : "border-neutral-200 text-sky-800"
        }`}
      >
        {title}
        <span className="text-[9px] font-medium normal-case text-neutral-400">
          {images.length} photo{images.length !== 1 ? "s" : ""}
        </span>
      </h3>
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {images.map((img) => (
            <div
              key={img.id}
              className={`overflow-hidden rounded-md border ${
                accent ? "border-green-200" : "border-neutral-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.filename}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-3 text-center text-neutral-400 italic">{emptyText}</p>
      )}
    </section>
  );
}

function SignatureBlock({ role, name }: { role: string; name: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-neutral-500">{role}</p>
      <div className="mt-12 border-t border-neutral-400" />
      <p className="mt-1.5 text-[11px] font-semibold text-neutral-800">
        {name || "(....................................)"}
      </p>
    </div>
  );
}
