"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon, Upload, X } from "lucide-react";
import { submitEvidence } from "@/app/actions/complaint.actions";
import { compressImages } from "@/lib/compress-image";
import { toast } from "sonner";

interface EvidenceActionPanelProps {
  complaintId: number;
}

export default function EvidenceActionPanel({
  complaintId,
}: EvidenceActionPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPreviews = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (previews.length === 0) {
      setError("Please upload at least one evidence photo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Shrink images in the browser so the request body stays under
      // Vercel's 4.5 MB function limit (FUNCTION_PAYLOAD_TOO_LARGE).
      const compressed = await compressImages(previews.map((p) => p.file));
      const formData = new FormData();
      compressed.forEach((file) => formData.append("files", file));
      await submitEvidence(complaintId, formData);
      toast.success("Bukti berhasil diunggah! Keluhan ditandai Resolved.");
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-orange-500/20">
      <CardHeader className="px-5 pt-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wide text-orange-600 uppercase">
          <Upload size={15} />
          Upload Evidence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        <p className="text-muted-foreground text-xs">
          Upload follow-up photos to mark this complaint as{" "}
          <strong>Resolved</strong>.
        </p>

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-border flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors hover:border-orange-400 hover:bg-orange-500/5"
        >
          <ImageIcon size={24} className="text-muted-foreground/50" />
          <span className="text-muted-foreground text-xs">
            Click to upload photos
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((p, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button
          className="w-full bg-orange-500 text-white hover:bg-orange-600"
          disabled={loading || previews.length === 0}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            `Submit Evidence (${previews.length} photo${previews.length !== 1 ? "s" : ""})`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
