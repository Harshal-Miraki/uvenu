"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { VenueLayout, LayoutElement, PriceZone } from "@/types/layout";

interface LayoutCanvasProps {
  layout: VenueLayout;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  tool: "select" | "pan" | "draw";
  zoom: number;
  setZoom: (zoom: number) => void;
  showGrid: boolean;
  showZones: boolean;
  onMoveElement: (id: string, x: number, y: number) => void;
  onUpdateElement: (id: string, updates: Partial<LayoutElement>) => void;
  onDeleteElements: (ids: string[]) => void;
  onAddElement: (element: LayoutElement) => void;
}

export function LayoutCanvas({
  layout,
  selectedIds,
  setSelectedIds,
  tool,
  zoom,
  setZoom,
  showGrid,
  showZones,
  onMoveElement,
  onUpdateElement,
  onDeleteElements,
  onAddElement,
}: LayoutCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpaceHeld(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(Math.max(0.25, Math.min(2, zoom + delta)));
      }
    },
    [zoom, setZoom]
  );

  const CANVAS_MARGIN = 40;

  const canvasToLocal = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - panOffset.x - CANVAS_MARGIN) / zoom,
      y: (clientY - rect.top - panOffset.y - CANVAS_MARGIN) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || tool === "pan" || spaceHeld) {
      // Middle mouse or pan mode
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (tool === "select") {
      const local = canvasToLocal(e.clientX, e.clientY);
      // Check if clicking on an element
      const clicked = findElementAt(local.x, local.y);

      if (clicked) {
        if (e.shiftKey) {
          // Multi-select
          setSelectedIds(
            selectedIds.includes(clicked.id)
              ? selectedIds.filter((id) => id !== clicked.id)
              : [...selectedIds, clicked.id]
          );
        } else if (!selectedIds.includes(clicked.id)) {
          setSelectedIds([clicked.id]);
        }

        // Start drag
        setDragState({
          elementId: clicked.id,
          startX: clicked.x,
          startY: clicked.y,
          offsetX: local.x - clicked.x,
          offsetY: local.y - clicked.y,
        });
      } else {
        // Start selection box or deselect
        if (!e.shiftKey) {
          setSelectedIds([]);
        }
        setSelectionBox({
          startX: local.x,
          startY: local.y,
          endX: local.x,
          endY: local.y,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (dragState) {
      const local = canvasToLocal(e.clientX, e.clientY);
      let newX = local.x - dragState.offsetX;
      let newY = local.y - dragState.offsetY;

      // Snap to grid
      if (layout.canvas.snapToGrid) {
        const gridSize = layout.canvas.gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      onMoveElement(dragState.elementId, newX, newY);

      // Move other selected elements by the same delta
      if (selectedIds.includes(dragState.elementId)) {
        const dx = newX - dragState.startX;
        const dy = newY - dragState.startY;
        selectedIds.forEach((id) => {
          if (id !== dragState.elementId) {
            const el = layout.elements.find((e) => e.id === id);
            if (el) {
              onMoveElement(id, el.x + dx, el.y + dy);
            }
          }
        });
        setDragState((prev) => prev ? { ...prev, startX: newX, startY: newY } : null);
      }
    }

    if (selectionBox) {
      const local = canvasToLocal(e.clientX, e.clientY);
      setSelectionBox((prev) =>
        prev ? { ...prev, endX: local.x, endY: local.y } : null
      );
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (selectionBox) {
      // Find elements within selection box
      const box = normalizeBox(selectionBox);
      const selected = layout.elements.filter(
        (el) =>
          el.x >= box.x &&
          el.y >= box.y &&
          el.x + el.width <= box.x + box.width &&
          el.y + el.height <= box.y + box.height
      );
      setSelectedIds(selected.map((el) => el.id));
      setSelectionBox(null);
    }

    setDragState(null);
  };

  const findElementAt = (x: number, y: number): LayoutElement | null => {
    // Search in reverse order (top elements first)
    const sorted = [...layout.elements].sort((a, b) => b.zIndex - a.zIndex);
    for (const el of sorted) {
      if (el.locked) continue;
      if (
        x >= el.x &&
        x <= el.x + el.width &&
        y >= el.y &&
        y <= el.y + el.height
      ) {
        return el;
      }
    }
    return null;
  };

  const normalizeBox = (box: typeof selectionBox) => {
    if (!box) return { x: 0, y: 0, width: 0, height: 0 };
    return {
      x: Math.min(box.startX, box.endX),
      y: Math.min(box.startY, box.endY),
      width: Math.abs(box.endX - box.startX),
      height: Math.abs(box.endY - box.startY),
    };
  };

  const getZoneColor = (priceZoneId: string) => {
    const zone = layout.priceZones.find((z) => z.id === priceZoneId);
    return zone?.colorHex || "#6b7280";
  };

  const renderElement = (el: LayoutElement) => {
    const isSelected = selectedIds.includes(el.id);
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      zIndex: el.zIndex,
      cursor: el.locked ? "not-allowed" : tool === "select" ? "move" : "default",
      outline: isSelected ? "2px solid #D4AF37" : "none",
      outlineOffset: isSelected ? "2px" : "0",
    };

    switch (el.type) {
      case "seat": {
        const props = el.properties as unknown as Record<string, unknown>;
        const zoneColor =
          showZones && props.priceZoneId
            ? getZoneColor(props.priceZoneId as string)
            : "#6b7280";
        const seatColor =
          props.status === "broken"
            ? "#ef4444"
            : props.status === "wheelchair"
              ? "#3b82f6"
              : props.status === "reserved_admin"
                ? "#f59e0b"
                : zoneColor;

        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              borderRadius: "6px",
              backgroundColor: showZones ? `${seatColor}33` : "#f3f4f6",
              border: `2px solid ${showZones ? seatColor : "#d1d5db"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8px",
              fontWeight: 600,
              color: showZones ? seatColor : "#6b7280",
              transition: "background-color 0.15s, border-color 0.15s",
            }}
            title={`${props.section}-${props.row}${props.number}`}
          >
            {(props.number as string)?.length <= 3 ? props.number as string : ""}
          </div>
        );
      }

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
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "1px",
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
              fontSize: "12px",
              color: props.borderColor as string,
            }}
          >
            <span className="font-semibold">{props.label as string}</span>
            <span className="text-[10px] opacity-75">
              Cap: {props.capacity as number}
            </span>
          </div>
        );
      }

      case "shape": {
        const props = el.properties as unknown as Record<string, unknown>;
        const isCircle = props.shapeType === "circle";
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              backgroundColor: props.fill as string,
              border: `${props.strokeWidth}px solid ${props.stroke}`,
              borderRadius: isCircle ? "50%" : "4px",
            }}
          />
        );
      }

      case "label": {
        const props = el.properties as unknown as Record<string, unknown>;
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              backgroundColor: props.backgroundColor as string,
              color: props.color as string,
              fontSize: `${props.fontSize}px`,
              fontWeight: props.fontWeight as string,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {props.text as string}
          </div>
        );
      }

      case "wall": {
        const props = el.properties as unknown as Record<string, unknown>;
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              backgroundColor: props.color as string,
              borderRadius: "2px",
            }}
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8px",
              fontWeight: 600,
              color: props.color as string,
            }}
          >
            <span>{props.label as string}</span>
          </div>
        );
      }

      default:
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              backgroundColor: "#e5e7eb",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
        );
    }
  };

  const selectionBoxNorm = selectionBox ? normalizeBox(selectionBox) : null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden relative bg-gray-200"
      style={{
        cursor: isPanning || spaceHeld || tool === "pan"
          ? "grab"
          : tool === "draw"
            ? "crosshair"
            : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Zoom & Pan Container */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: layout.canvas.width,
          height: layout.canvas.height,
          position: "relative",
          backgroundColor: layout.canvas.backgroundColor,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          margin: `${CANVAS_MARGIN}px`,
        }}
      >
        {/* Grid */}
        {showGrid && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={layout.canvas.width}
            height={layout.canvas.height}
          >
            <defs>
              <pattern
                id="grid"
                width={layout.canvas.gridSize}
                height={layout.canvas.gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${layout.canvas.gridSize} 0 L 0 0 0 ${layout.canvas.gridSize}`}
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        )}

        {/* Zone overlays */}
        {showZones &&
          layout.priceZones.map((zone) => {
            const zoneElements = layout.elements.filter(
              (el) =>
                el.properties.kind === "seat" &&
                (el.properties as unknown as { priceZoneId?: string }).priceZoneId === zone.id
            );
            if (zoneElements.length === 0) return null;

            const minX = Math.min(...zoneElements.map((e) => e.x)) - 10;
            const minY = Math.min(...zoneElements.map((e) => e.y)) - 10;
            const maxX = Math.max(...zoneElements.map((e) => e.x + e.width)) + 10;
            const maxY = Math.max(...zoneElements.map((e) => e.y + e.height)) + 10;

            return (
              <div
                key={zone.id}
                className="absolute pointer-events-none"
                style={{
                  left: minX,
                  top: minY,
                  width: maxX - minX,
                  height: maxY - minY,
                  backgroundColor: `${zone.colorHex}15`,
                  border: `2px dashed ${zone.colorHex}55`,
                  borderRadius: "8px",
                }}
              >
                <span
                  className="absolute -top-5 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: zone.colorHex,
                    backgroundColor: `${zone.colorHex}15`,
                  }}
                >
                  {zone.zoneName}
                </span>
              </div>
            );
          })}

        {/* Elements */}
        {layout.elements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => renderElement(el))}

        {/* Selection Box */}
        {selectionBoxNorm && selectionBoxNorm.width > 2 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: selectionBoxNorm.x,
              top: selectionBoxNorm.y,
              width: selectionBoxNorm.width,
              height: selectionBoxNorm.height,
              border: "1px dashed #D4AF37",
              backgroundColor: "rgba(212, 175, 55, 0.08)",
              zIndex: 9999,
            }}
          />
        )}
      </div>

      {/* Canvas info */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-500 shadow-sm">
        {layout.canvas.width} x {layout.canvas.height}px | {layout.elements.length} elements | {layout.totalCapacity} capacity
      </div>
    </div>
  );
}
