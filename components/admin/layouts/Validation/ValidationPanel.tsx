"use client";

import { VenueLayout } from "@/types/layout";
import { Button } from "@/components/ui/Button";
import {
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useMemo } from "react";

interface ValidationPanelProps {
  layout: VenueLayout;
  onClose: () => void;
}

interface ValidationMessage {
  type: "error" | "warning" | "success" | "info";
  message: string;
}

export function ValidationPanel({ layout, onClose }: ValidationPanelProps) {
  const messages = useMemo(() => {
    const msgs: ValidationMessage[] = [];

    // Check: At least one seat exists
    const seats = layout.elements.filter((el) => el.type === "seat");
    if (seats.length === 0) {
      msgs.push({ type: "error", message: "No seats found in the layout" });
    } else {
      msgs.push({
        type: "success",
        message: `${seats.length} seats configured`,
      });
    }

    // Check: All seats have price zone
    const seatsWithoutZone = seats.filter(
      (el) =>
        el.properties.kind === "seat" &&
        !(el.properties as unknown as { priceZoneId?: string }).priceZoneId
    );
    if (seatsWithoutZone.length > 0) {
      msgs.push({
        type: "error",
        message: `${seatsWithoutZone.length} seats without price zone assigned`,
      });
    } else if (seats.length > 0) {
      msgs.push({
        type: "success",
        message: "All seats have price zones assigned",
      });
    }

    // Check: All seats have section
    const seatsWithoutSection = seats.filter(
      (el) =>
        el.properties.kind === "seat" &&
        !(el.properties as unknown as { section?: string }).section
    );
    if (seatsWithoutSection.length > 0) {
      msgs.push({
        type: "warning",
        message: `${seatsWithoutSection.length} seats without section assigned`,
      });
    } else if (seats.length > 0) {
      msgs.push({
        type: "success",
        message: "All seats have sections assigned",
      });
    }

    // Check: All seats have row
    const seatsWithoutRow = seats.filter(
      (el) =>
        el.properties.kind === "seat" &&
        !(el.properties as unknown as { row?: string }).row
    );
    if (seatsWithoutRow.length > 0) {
      msgs.push({
        type: "warning",
        message: `${seatsWithoutRow.length} seats without row assigned`,
      });
    }

    // Check overlapping seats
    const seatPositions = seats.map((s) => ({
      id: s.id,
      x: s.x,
      y: s.y,
      w: s.width,
      h: s.height,
    }));
    let overlaps = 0;
    for (let i = 0; i < seatPositions.length; i++) {
      for (let j = i + 1; j < seatPositions.length; j++) {
        const a = seatPositions[i];
        const b = seatPositions[j];
        if (
          a.x < b.x + b.w &&
          a.x + a.w > b.x &&
          a.y < b.y + b.h &&
          a.y + a.h > b.y
        ) {
          overlaps++;
        }
      }
    }
    if (overlaps > 0) {
      msgs.push({
        type: "warning",
        message: `${overlaps} overlapping seat pairs detected`,
      });
    } else if (seats.length > 1) {
      msgs.push({ type: "success", message: "No overlapping seats" });
    }

    // Check: Entrance/exit markers
    const entrances = layout.elements.filter((el) => el.type === "entrance");
    if (entrances.length === 0) {
      msgs.push({
        type: "warning",
        message: "No entrance/exit markers placed",
      });
    } else {
      msgs.push({
        type: "success",
        message: `${entrances.length} entrance/exit markers placed`,
      });
    }

    // Check: Accessibility
    const accessibleSeats = seats.filter(
      (el) =>
        el.properties.kind === "seat" &&
        (el.properties as unknown as { accessibility?: boolean }).accessibility
    );
    if (accessibleSeats.length === 0 && seats.length > 0) {
      msgs.push({
        type: "warning",
        message: "No wheelchair-accessible seats designated",
      });
    } else if (accessibleSeats.length > 0) {
      msgs.push({
        type: "success",
        message: `${accessibleSeats.length} accessible seats designated`,
      });
    }

    // Check: Stage exists
    const stages = layout.elements.filter((el) => el.type === "stage");
    if (stages.length === 0) {
      msgs.push({
        type: "info",
        message: "Consider adding a stage or performance area",
      });
    }

    // Check: Price zones have seats
    layout.priceZones.forEach((zone) => {
      const count = seats.filter(
        (el) =>
          el.properties.kind === "seat" &&
          (el.properties as unknown as { priceZoneId?: string }).priceZoneId === zone.id
      ).length;
      if (count === 0) {
        msgs.push({
          type: "info",
          message: `Zone "${zone.zoneName}" has no seats assigned`,
        });
      }
    });

    return msgs;
  }, [layout]);

  const errors = messages.filter((m) => m.type === "error");
  const warnings = messages.filter((m) => m.type === "warning");
  const successes = messages.filter((m) => m.type === "success");
  const infos = messages.filter((m) => m.type === "info");

  const canPublish = errors.length === 0;

  const iconMap = {
    error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  const bgMap = {
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    success: "bg-green-50 border-green-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[95vw] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Layout Validation
            </h2>
            <p className="text-sm text-gray-500">
              {canPublish
                ? "Layout is ready to publish"
                : "Fix errors before publishing"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>{errors.length} errors</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>{warnings.length} warnings</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{successes.length} passed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{infos.length} info</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {[...errors, ...warnings, ...infos, ...successes].map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 p-3 rounded-lg border ${bgMap[msg.type]}`}
            >
              {iconMap[msg.type]}
              <span className="text-sm text-gray-700">{msg.message}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-5 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
