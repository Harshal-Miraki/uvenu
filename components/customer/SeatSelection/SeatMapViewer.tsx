"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { VenueLayout, LayoutElement, PriceZone, SeatAvailability } from "@/types/layout";
import { Button } from "@/components/ui/Button";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

interface SeatMapViewerProps {
  layout: VenueLayout;
  bookedSeatIds: string[];
  onSeatsSelected: (seats: SeatAvailability[]) => void;
  currency?: string;
}

export function SeatMapViewer({
  layout,
  bookedSeatIds,
  onSeatsSelected,
  currency = "QAR",
}: SeatMapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [hoveredSeat, setHoveredSeat] = useState<LayoutElement | null>(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string | null>(null);

  const seatElements = useMemo(
    () => layout.elements.filter((el) => el.type === "seat"),
    [layout.elements]
  );

  const getZone = (zoneId: string): PriceZone | undefined =>
    layout.priceZones.find((z) => z.id === zoneId);

  const getSeatStatus = (el: LayoutElement): "available" | "booked" | "selected" | "reserved" => {
    if (bookedSeatIds.includes(el.id)) return "booked";
    if (selectedSeatIds.includes(el.id)) return "selected";
    if (el.properties.kind === "seat" && (el.properties as unknown as { status?: string }).status === "reserved_admin")
      return "reserved";
    if (el.properties.kind === "seat" && (el.properties as unknown as { status?: string }).status === "broken")
      return "booked";
    return "available";
  };

  const handleSeatClick = (el: LayoutElement) => {
    const status = getSeatStatus(el);
    if (status === "booked" || status === "reserved") return;

    const newSelected = selectedSeatIds.includes(el.id)
      ? selectedSeatIds.filter((id) => id !== el.id)
      : [...selectedSeatIds, el.id];

    setSelectedSeatIds(newSelected);

    // Build seat availability list
    const selectedSeats: SeatAvailability[] = newSelected
      .map((id) => {
        const seat = layout.elements.find((e) => e.id === id);
        if (!seat || seat.properties.kind !== "seat") return null;
        const props = seat.properties as unknown as Record<string, unknown>;
        const zone = getZone(props.priceZoneId as string);
        return {
          seatId: id,
          elementId: id,
          section: props.section as string,
          row: props.row as string,
          number: props.number as string,
          priceZoneId: props.priceZoneId as string,
          zoneName: zone?.zoneName || "Standard",
          price: zone?.basePrice || 0,
          zoneColor: zone?.colorHex || "#6b7280",
          status: "selected" as const,
          x: seat.x,
          y: seat.y,
        };
      })
      .filter(Boolean) as SeatAvailability[];

    onSeatsSelected(selectedSeats);
  };

  const handleFindBestSeats = (count: number = 2) => {
    // Simple best seats algorithm: prefer seats closest to center-front
    const availableSeats = seatElements
      .filter((el) => getSeatStatus(el) === "available")
      .map((el) => ({
        element: el,
        score:
          Math.abs(el.x + el.width / 2 - layout.canvas.width / 2) +
          el.y * 0.5,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, count);

    const ids = availableSeats.map((s) => s.element.id);
    setSelectedSeatIds(ids);

    const selectedSeats: SeatAvailability[] = availableSeats
      .map((s) => {
        const props = s.element.properties as unknown as Record<string, unknown>;
        const zone = getZone(props.priceZoneId as string);
        return {
          seatId: s.element.id,
          elementId: s.element.id,
          section: props.section as string,
          row: props.row as string,
          number: props.number as string,
          priceZoneId: props.priceZoneId as string,
          zoneName: zone?.zoneName || "Standard",
          price: zone?.basePrice || 0,
          zoneColor: zone?.colorHex || "#6b7280",
          status: "selected" as const,
          x: s.element.x,
          y: s.element.y,
        };
      });

    onSeatsSelected(selectedSeats);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(Math.max(0.3, Math.min(3, zoom + delta)));
    }
  };

  const totalPrice = selectedSeatIds.reduce((sum, id) => {
    const el = layout.elements.find((e) => e.id === id);
    if (!el || el.properties.kind !== "seat") return sum;
    const zone = getZone((el.properties as unknown as { priceZoneId?: string }).priceZoneId || "");
    return sum + (zone?.basePrice || 0);
  }, 0);

  const availablePerZone = useMemo(() => {
    const counts: Record<string, number> = {};
    seatElements.forEach((el) => {
      if (getSeatStatus(el) === "available") {
        const zoneId = (el.properties as unknown as { priceZoneId?: string }).priceZoneId || "";
        counts[zoneId] = (counts[zoneId] || 0) + 1;
      }
    });
    return counts;
  }, [seatElements, bookedSeatIds]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Main viewer */}
      <div className="flex-1 flex flex-col">
        {/* Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.3, zoom - 0.2))}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.2))}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleFindBestSeats(2)}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Find Best Seats
          </Button>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="border border-gray-200 rounded-xl overflow-hidden bg-gray-100 relative"
          style={{ height: "500px", cursor: isPanning ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              width: layout.canvas.width,
              height: layout.canvas.height,
              position: "relative",
              backgroundColor: layout.canvas.backgroundColor,
            }}
          >
            {/* Render non-seat elements first */}
            {layout.elements
              .filter((el) => el.type !== "seat")
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => renderStaticElement(el))}

            {/* Render seats */}
            {seatElements.map((el) => {
              const status = getSeatStatus(el);
              const props = el.properties as unknown as Record<string, unknown>;
              const zone = getZone(props.priceZoneId as string);
              const zoneColor = zone?.colorHex || "#6b7280";
              const isFiltered = activeZoneFilter && props.priceZoneId !== activeZoneFilter;

              return (
                <div
                  key={el.id}
                  style={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    borderRadius: "6px",
                    cursor: status === "booked" || status === "reserved" ? "not-allowed" : "pointer",
                    backgroundColor:
                      status === "booked"
                        ? "#d1d5db"
                        : status === "selected"
                          ? zoneColor
                          : status === "reserved"
                            ? "#e5e7eb"
                            : `${zoneColor}30`,
                    border: `2px solid ${status === "booked" ? "#9ca3af" : status === "selected" ? zoneColor : status === "reserved" ? "#d1d5db" : zoneColor}`,
                    opacity: isFiltered ? 0.2 : 1,
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: status === "selected" ? 15 : 10,
                    transform: hoveredSeat?.id === el.id && status === "available" ? "scale(1.15)" : undefined,
                    boxShadow: status === "selected" ? `0 0 8px ${zoneColor}66` : hoveredSeat?.id === el.id ? "0 2px 8px rgba(0,0,0,0.15)" : undefined,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeatClick(el);
                  }}
                  onMouseEnter={() => setHoveredSeat(el)}
                  onMouseLeave={() => setHoveredSeat(null)}
                >
                  {status === "selected" && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {status === "booked" && (
                    <span className="text-[8px] text-gray-400 font-bold">X</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Seat tooltip */}
          {hoveredSeat && hoveredSeat.properties.kind === "seat" && (
            <div
              className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg z-50"
              style={{
                left: (hoveredSeat.x + hoveredSeat.width / 2) * zoom + panOffset.x,
                top: (hoveredSeat.y - 10) * zoom + panOffset.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="font-semibold">
                {(hoveredSeat.properties as unknown as Record<string, unknown>).section as string}-{(hoveredSeat.properties as unknown as Record<string, unknown>).row as string}
                {(hoveredSeat.properties as unknown as Record<string, unknown>).number as string}
              </div>
              <div className="text-gray-300">
                {getZone((hoveredSeat.properties as unknown as Record<string, unknown>).priceZoneId as string)?.zoneName} | {getZone((hoveredSeat.properties as unknown as Record<string, unknown>).priceZoneId as string)?.basePrice} {currency}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Legend & Selection */}
      <div className="w-full lg:w-72 space-y-4">
        {/* Legend */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Price Zones
          </h3>
          <div className="space-y-2">
            {layout.priceZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() =>
                  setActiveZoneFilter(
                    activeZoneFilter === zone.id ? null : zone.id
                  )
                }
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${activeZoneFilter === zone.id ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: zone.colorHex }}
                  />
                  <span className="text-sm text-gray-700">{zone.zoneName}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {zone.basePrice} {currency}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {availablePerZone[zone.id] || 0} left
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" />
              <span className="text-gray-500">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gold-500 border border-gold-600" />
              <span className="text-gray-500">Selected</span>
            </div>
          </div>
        </div>

        {/* Selected Seats */}
        {selectedSeatIds.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Selected Seats ({selectedSeatIds.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedSeatIds.map((id) => {
                const el = layout.elements.find((e) => e.id === id);
                if (!el || el.properties.kind !== "seat") return null;
                const props = el.properties as unknown as Record<string, unknown>;
                const zone = getZone(props.priceZoneId as string);
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: zone?.colorHex }}
                      />
                      <span className="text-xs text-gray-700">
                        Row {props.row as string}, Seat {props.number as string}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {zone?.zoneName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {zone?.basePrice} {currency}
                      </span>
                      <button
                        onClick={() => handleSeatClick(el)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {totalPrice.toLocaleString()} {currency}
                </span>
              </div>
              <Button className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Continue to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderStaticElement(el: LayoutElement) {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    zIndex: el.zIndex,
    pointerEvents: "none",
  };

  switch (el.type) {
    case "stage": {
      const props = el.properties as unknown as Record<string, unknown>;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            backgroundColor: props.backgroundColor as string,
            border: `2px solid ${props.borderColor}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          {props.label as string}
        </div>
      );
    }

    case "standing-area": {
      const props = el.properties as unknown as Record<string, unknown>;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            backgroundColor: props.backgroundColor as string,
            border: `2px dashed ${props.borderColor}`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            color: props.borderColor as string,
          }}
        >
          <span className="font-semibold">{props.label as string}</span>
          <span className="text-[10px] opacity-75">
            Capacity: {props.capacity as number}
          </span>
        </div>
      );
    }

    case "label": {
      const props = el.properties as unknown as Record<string, unknown>;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            color: props.color as string,
            fontSize: `${props.fontSize}px`,
            fontWeight: props.fontWeight as string,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {props.text as string}
        </div>
      );
    }

    case "shape": {
      const props = el.properties as unknown as Record<string, unknown>;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            backgroundColor: props.fill as string,
            border: `${props.strokeWidth}px solid ${props.stroke}`,
            borderRadius: props.shapeType === "circle" ? "50%" : "4px",
          }}
        />
      );
    }

    case "wall": {
      const props = el.properties as unknown as Record<string, unknown>;
      return (
        <div
          key={el.id}
          style={{ ...baseStyle, backgroundColor: props.color as string, borderRadius: "2px" }}
        />
      );
    }

    case "entrance": {
      const props = el.properties as unknown as Record<string, unknown>;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            backgroundColor: `${props.color}22`,
            border: `2px solid ${props.color}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontWeight: 700,
            color: props.color as string,
          }}
        >
          {props.label as string}
        </div>
      );
    }

    default:
      return null;
  }
}
