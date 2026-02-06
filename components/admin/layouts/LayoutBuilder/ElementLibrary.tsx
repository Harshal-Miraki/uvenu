"use client";

import { useState } from "react";
import { LayoutElement, PriceZone } from "@/types/layout";
import { v4 as uuidv4 } from "uuid";
import {
  Armchair,
  Rows3,
  LayoutGrid,
  Theater,
  Users,
  Square,
  Circle,
  Type,
  Minus,
  DoorOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ElementLibraryProps {
  onAddElement: (element: LayoutElement) => void;
  onAddSection: (
    sectionName: string,
    rows: number,
    seatsPerRow: number,
    startX: number,
    startY: number,
    priceZoneId: string,
    rowSpacing: number,
    seatSpacing: number
  ) => void;
  priceZones: PriceZone[];
  canvasWidth: number;
  canvasHeight: number;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: ElementItem[];
}

interface ElementItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export function ElementLibrary({
  onAddElement,
  onAddSection,
  priceZones,
  canvasWidth,
  canvasHeight,
}: ElementLibraryProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "seats",
    "areas",
  ]);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [sectionConfig, setSectionConfig] = useState({
    name: "Section A",
    rows: 5,
    seatsPerRow: 10,
    priceZoneId: priceZones[0]?.id || "",
    rowSpacing: 8,
    seatSpacing: 6,
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const defaultZoneId = priceZones[0]?.id || "";

  const createSeat = (x?: number, y?: number) => {
    onAddElement({
      id: uuidv4(),
      type: "seat",
      x: x ?? Math.round(canvasWidth / 2),
      y: y ?? Math.round(canvasHeight / 2),
      width: 28,
      height: 28,
      rotation: 0,
      zIndex: 10,
      locked: false,
      visible: true,
      properties: {
        kind: "seat",
        section: "A",
        row: "A",
        number: "1",
        priceZoneId: defaultZoneId,
        status: "available",
        accessibility: false,
      },
    });
  };

  const createSeatRow = (count: number) => {
    const seatSize = 28;
    const spacing = 6;
    const startX = Math.round(canvasWidth / 2 - ((count * (seatSize + spacing)) / 2));
    const startY = Math.round(canvasHeight / 2);

    for (let i = 0; i < count; i++) {
      onAddElement({
        id: uuidv4(),
        type: "seat",
        x: startX + i * (seatSize + spacing),
        y: startY,
        width: seatSize,
        height: seatSize,
        rotation: 0,
        zIndex: 10,
        locked: false,
        visible: true,
        properties: {
          kind: "seat",
          section: "A",
          row: "A",
          number: String(i + 1),
          priceZoneId: defaultZoneId,
          status: "available",
          accessibility: false,
        },
      });
    }
  };

  const createStage = () => {
    onAddElement({
      id: uuidv4(),
      type: "stage",
      x: Math.round(canvasWidth / 2 - 150),
      y: 40,
      width: 300,
      height: 80,
      rotation: 0,
      zIndex: 5,
      locked: false,
      visible: true,
      properties: {
        kind: "stage",
        label: "Main Stage",
        backgroundColor: "#1f2937",
        borderColor: "#D4AF37",
        shape: "rectangle",
      },
    });
  };

  const createStandingArea = () => {
    onAddElement({
      id: uuidv4(),
      type: "standing-area",
      x: Math.round(canvasWidth / 2 - 100),
      y: Math.round(canvasHeight / 2 - 60),
      width: 200,
      height: 120,
      rotation: 0,
      zIndex: 3,
      locked: false,
      visible: true,
      properties: {
        kind: "standing-area",
        label: "Standing Area",
        capacity: 50,
        backgroundColor: "#dbeafe",
        borderColor: "#3b82f6",
      },
    });
  };

  const createShape = (shapeType: "rectangle" | "circle") => {
    onAddElement({
      id: uuidv4(),
      type: "shape",
      x: Math.round(canvasWidth / 2 - 50),
      y: Math.round(canvasHeight / 2 - 50),
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 2,
      locked: false,
      visible: true,
      properties: {
        kind: "shape",
        shapeType,
        fill: "#e5e7eb",
        stroke: "#9ca3af",
        strokeWidth: 2,
      },
    });
  };

  const createLabel = () => {
    onAddElement({
      id: uuidv4(),
      type: "label",
      x: Math.round(canvasWidth / 2 - 40),
      y: Math.round(canvasHeight / 2),
      width: 80,
      height: 30,
      rotation: 0,
      zIndex: 20,
      locked: false,
      visible: true,
      properties: {
        kind: "label",
        text: "Label",
        fontSize: 14,
        fontWeight: "bold",
        color: "#374151",
        backgroundColor: "transparent",
      },
    });
  };

  const createWall = () => {
    onAddElement({
      id: uuidv4(),
      type: "wall",
      x: Math.round(canvasWidth / 2 - 100),
      y: Math.round(canvasHeight / 2),
      width: 200,
      height: 4,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      properties: {
        kind: "wall",
        thickness: 4,
        color: "#374151",
      },
    });
  };

  const createEntrance = (type: "entrance" | "exit" | "emergency") => {
    onAddElement({
      id: uuidv4(),
      type: "entrance",
      x: type === "entrance" ? 20 : canvasWidth - 60,
      y: Math.round(canvasHeight / 2),
      width: 40,
      height: 40,
      rotation: 0,
      zIndex: 15,
      locked: false,
      visible: true,
      properties: {
        kind: "entrance",
        label: type === "entrance" ? "Entry" : type === "exit" ? "Exit" : "Emergency",
        type,
        color: type === "emergency" ? "#ef4444" : "#22c55e",
      },
    });
  };

  const handleCreateSection = () => {
    onAddSection(
      sectionConfig.name,
      sectionConfig.rows,
      sectionConfig.seatsPerRow,
      Math.round(canvasWidth / 2 - (sectionConfig.seatsPerRow * 34) / 2),
      Math.round(canvasHeight / 2 - (sectionConfig.rows * 36) / 2),
      sectionConfig.priceZoneId,
      sectionConfig.rowSpacing,
      sectionConfig.seatSpacing
    );
    setShowSectionDialog(false);
  };

  const categories: Category[] = [
    {
      id: "seats",
      label: "Seating",
      icon: <Armchair className="w-4 h-4" />,
      items: [
        {
          id: "single-seat",
          label: "Single Seat",
          description: "Add one seat",
          icon: <Armchair className="w-4 h-4" />,
          action: () => createSeat(),
        },
        {
          id: "row-5",
          label: "Row (5 seats)",
          description: "Quick row of 5",
          icon: <Rows3 className="w-4 h-4" />,
          action: () => createSeatRow(5),
        },
        {
          id: "row-10",
          label: "Row (10 seats)",
          description: "Quick row of 10",
          icon: <Rows3 className="w-4 h-4" />,
          action: () => createSeatRow(10),
        },
        {
          id: "row-20",
          label: "Row (20 seats)",
          description: "Quick row of 20",
          icon: <Rows3 className="w-4 h-4" />,
          action: () => createSeatRow(20),
        },
        {
          id: "section",
          label: "Seat Section",
          description: "Custom section grid",
          icon: <LayoutGrid className="w-4 h-4" />,
          action: () => setShowSectionDialog(true),
        },
      ],
    },
    {
      id: "areas",
      label: "Stage & Areas",
      icon: <Theater className="w-4 h-4" />,
      items: [
        {
          id: "stage",
          label: "Stage",
          description: "Performance area",
          icon: <Theater className="w-4 h-4" />,
          action: createStage,
        },
        {
          id: "standing",
          label: "Standing Area",
          description: "With capacity",
          icon: <Users className="w-4 h-4" />,
          action: createStandingArea,
        },
        {
          id: "entrance",
          label: "Entrance",
          description: "Entry point",
          icon: <DoorOpen className="w-4 h-4" />,
          action: () => createEntrance("entrance"),
        },
        {
          id: "exit",
          label: "Exit",
          description: "Exit point",
          icon: <DoorOpen className="w-4 h-4" />,
          action: () => createEntrance("exit"),
        },
        {
          id: "emergency",
          label: "Emergency Exit",
          description: "Emergency exit",
          icon: <DoorOpen className="w-4 h-4" />,
          action: () => createEntrance("emergency"),
        },
      ],
    },
    {
      id: "shapes",
      label: "Shapes & Labels",
      icon: <Square className="w-4 h-4" />,
      items: [
        {
          id: "rectangle",
          label: "Rectangle",
          description: "Rectangular shape",
          icon: <Square className="w-4 h-4" />,
          action: () => createShape("rectangle"),
        },
        {
          id: "circle",
          label: "Circle",
          description: "Circular shape",
          icon: <Circle className="w-4 h-4" />,
          action: () => createShape("circle"),
        },
        {
          id: "label",
          label: "Text Label",
          description: "Add text",
          icon: <Type className="w-4 h-4" />,
          action: createLabel,
        },
        {
          id: "wall",
          label: "Wall / Barrier",
          description: "Structural line",
          icon: <Minus className="w-4 h-4" />,
          action: createWall,
        },
      ],
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Element Library
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((cat) => (
          <div key={cat.id} className="mb-2">
            <button
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              {cat.icon}
              <span className="flex-1 text-left">{cat.label}</span>
              {expandedCategories.includes(cat.id) ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            {expandedCategories.includes(cat.id) && (
              <div className="ml-2 space-y-0.5">
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gold-50 hover:text-gold-700 rounded-md transition-colors group"
                  >
                    <span className="text-gray-400 group-hover:text-gold-500">
                      {item.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-gray-400 text-[10px]">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Section Creator Dialog */}
      {showSectionDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Seat Section
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  value={sectionConfig.name}
                  onChange={(e) =>
                    setSectionConfig((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Rows
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={sectionConfig.rows}
                    onChange={(e) =>
                      setSectionConfig((p) => ({
                        ...p,
                        rows: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Seats per Row
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={sectionConfig.seatsPerRow}
                    onChange={(e) =>
                      setSectionConfig((p) => ({
                        ...p,
                        seatsPerRow: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Price Zone
                </label>
                <select
                  value={sectionConfig.priceZoneId}
                  onChange={(e) =>
                    setSectionConfig((p) => ({
                      ...p,
                      priceZoneId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  {priceZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.zoneName} - {zone.basePrice} QAR
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Row Spacing (px)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={sectionConfig.rowSpacing}
                    onChange={(e) =>
                      setSectionConfig((p) => ({
                        ...p,
                        rowSpacing: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Seat Spacing (px)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={sectionConfig.seatSpacing}
                    onChange={(e) =>
                      setSectionConfig((p) => ({
                        ...p,
                        seatSpacing: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                Total seats:{" "}
                <span className="font-bold text-gray-900">
                  {sectionConfig.rows * sectionConfig.seatsPerRow}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSectionDialog(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateSection}>
                Create Section
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
