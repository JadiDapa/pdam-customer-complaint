import { Card } from "@/components/ui/card";
import { AlertTriangle, User, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { ComplaintType } from "@/servers/validators/complaint.validator";

export default function ComplaintCard({
  complaint,
}: {
  complaint: ComplaintType;
}) {
  return (
    <Card className="space-y-4 border-l-4 p-5 transition-all hover:border-yellow-500 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Complaint #{complaint.id}
          </h2>

          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            {complaint.customer?.user?.fullname ?? "Unknown Customer"}
          </p>
        </div>

        <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
          {complaint.disturbanceType.replace(/_/g, " ")}
        </span>
      </div>

      {/* Images */}
      {complaint.images && complaint.images.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4" />
            Evidence ({complaint.images.length})
          </p>

          <div className="flex gap-2 overflow-x-auto">
            {complaint.images.slice(0, 5).map((img, i) => (
              <Image
                unoptimized
                key={i}
                src={img.url}
                width={80}
                height={80}
                alt={`complaint-${i}`}
                className="rounded-md border object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-muted-foreground flex justify-between pt-2 text-xs">
        <span>{format(new Date(complaint.createdAt), "dd MMM yyyy")}</span>
        <span>
          Updated {format(new Date(complaint.updatedAt), "dd MMM yyyy")}
        </span>
      </div>
    </Card>
  );
}
