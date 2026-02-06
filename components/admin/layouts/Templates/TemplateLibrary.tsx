"use client";

import { useState } from "react";
import {
  VenueLayout,
  LayoutElement,
  PriceZone,
  DEFAULT_CANVAS,
  DEFAULT_PRICE_ZONES,
  TemplateCategory,
} from "@/types/layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Theater,
  Music,
  Presentation,
  Trophy,
  UtensilsCrossed,
  Film,
  X,
  Check,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface TemplateLibraryProps {
  onSelectTemplate: (layout: VenueLayout) => void;
  onClose: () => void;
}

interface TemplateInfo {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  icon: React.ReactNode;
  capacity: number;
  zones: number;
  generator: () => { elements: LayoutElement[]; priceZones: PriceZone[] };
}

function createSeatGrid(
  startX: number,
  startY: number,
  rows: number,
  seatsPerRow: number,
  seatSize: number,
  seatSpacing: number,
  rowSpacing: number,
  sectionName: string,
  priceZoneId: string,
  startRowChar: string = "A"
): LayoutElement[] {
  const elements: LayoutElement[] = [];
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(startRowChar.charCodeAt(0) + r);
    for (let s = 0; s < seatsPerRow; s++) {
      elements.push({
        id: uuidv4(),
        type: "seat",
        x: startX + s * (seatSize + seatSpacing),
        y: startY + r * (seatSize + rowSpacing),
        width: seatSize,
        height: seatSize,
        rotation: 0,
        zIndex: 10,
        locked: false,
        visible: true,
        properties: {
          kind: "seat",
          section: sectionName,
          row: rowLabel,
          number: String(s + 1),
          priceZoneId,
          status: "available",
          accessibility: false,
        },
      });
    }
  }
  return elements;
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: "theater",
    name: "Theater Style",
    category: "theater",
    description: "Classic theater with orchestra, mezzanine, and balcony sections",
    icon: <Theater className="w-8 h-8" />,
    capacity: 210,
    zones: 4,
    generator: () => {
      const zones = DEFAULT_PRICE_ZONES.slice(0, 4);
      const elements: LayoutElement[] = [];

      // Stage
      elements.push({
        id: uuidv4(),
        type: "stage",
        x: 300,
        y: 20,
        width: 400,
        height: 70,
        rotation: 0,
        zIndex: 5,
        locked: false,
        visible: true,
        properties: {
          kind: "stage",
          label: "STAGE",
          backgroundColor: "#1f2937",
          borderColor: "#D4AF37",
          shape: "rectangle",
        },
      });

      // VIP (first 3 rows) - Orchestra
      elements.push(
        ...createSeatGrid(200, 120, 3, 20, 26, 5, 7, "Orchestra", zones[0].id)
      );

      // Premium (next 3 rows)
      elements.push(
        ...createSeatGrid(200, 240, 3, 20, 26, 5, 7, "Orchestra", zones[1].id, "D")
      );

      // Standard (5 rows)
      elements.push(
        ...createSeatGrid(200, 360, 5, 20, 26, 5, 7, "Mezzanine", zones[2].id, "G")
      );

      // Economy (3 rows - Balcony)
      elements.push(
        ...createSeatGrid(250, 560, 3, 16, 26, 5, 7, "Balcony", zones[3].id, "L")
      );

      // Labels
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 80,
        y: 170,
        width: 100,
        height: 25,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "Orchestra", fontSize: 12, fontWeight: "bold", color: "#6b7280", backgroundColor: "transparent" },
      });
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 80,
        y: 400,
        width: 100,
        height: 25,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "Mezzanine", fontSize: 12, fontWeight: "bold", color: "#6b7280", backgroundColor: "transparent" },
      });
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 130,
        y: 590,
        width: 100,
        height: 25,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "Balcony", fontSize: 12, fontWeight: "bold", color: "#6b7280", backgroundColor: "transparent" },
      });

      // Entrances
      elements.push({
        id: uuidv4(),
        type: "entrance",
        x: 20,
        y: 350,
        width: 40,
        height: 40,
        rotation: 0,
        zIndex: 15,
        locked: false,
        visible: true,
        properties: { kind: "entrance", label: "Entry", type: "entrance", color: "#22c55e" },
      });
      elements.push({
        id: uuidv4(),
        type: "entrance",
        x: 940,
        y: 350,
        width: 40,
        height: 40,
        rotation: 0,
        zIndex: 15,
        locked: false,
        visible: true,
        properties: { kind: "entrance", label: "Exit", type: "exit", color: "#22c55e" },
      });

      return { elements, priceZones: zones };
    },
  },
  {
    id: "concert",
    name: "Concert Hall",
    category: "concert",
    description: "Standing pit area with seated sections and VIP balcony",
    icon: <Music className="w-8 h-8" />,
    capacity: 250,
    zones: 4,
    generator: () => {
      const zones = [
        { ...DEFAULT_PRICE_ZONES[0], zoneName: "VIP Balcony" },
        { ...DEFAULT_PRICE_ZONES[1], zoneName: "Front Section" },
        { ...DEFAULT_PRICE_ZONES[2], zoneName: "Rear Section" },
        { ...DEFAULT_PRICE_ZONES[3], zoneName: "General" },
      ];
      const elements: LayoutElement[] = [];

      // Stage
      elements.push({
        id: uuidv4(),
        type: "stage",
        x: 250,
        y: 15,
        width: 500,
        height: 90,
        rotation: 0,
        zIndex: 5,
        locked: false,
        visible: true,
        properties: { kind: "stage", label: "MAIN STAGE", backgroundColor: "#1f2937", borderColor: "#D4AF37", shape: "rectangle" },
      });

      // Standing area (pit)
      elements.push({
        id: uuidv4(),
        type: "standing-area",
        x: 300,
        y: 120,
        width: 400,
        height: 120,
        rotation: 0,
        zIndex: 3,
        locked: false,
        visible: true,
        properties: { kind: "standing-area", label: "General Standing", capacity: 100, backgroundColor: "#dbeafe", borderColor: "#3b82f6" },
      });

      // Front seated section (Premium)
      elements.push(
        ...createSeatGrid(200, 270, 4, 22, 26, 5, 7, "Front", zones[1].id)
      );

      // Rear section (Standard)
      elements.push(
        ...createSeatGrid(200, 420, 4, 22, 26, 5, 7, "Rear", zones[2].id, "E")
      );

      // VIP Balcony
      elements.push(
        ...createSeatGrid(300, 600, 2, 14, 28, 6, 8, "VIP Balcony", zones[0].id)
      );

      // Labels
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 50,
        y: 310,
        width: 120,
        height: 25,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "Front Section", fontSize: 11, fontWeight: "bold", color: "#6b7280", backgroundColor: "transparent" },
      });

      return { elements, priceZones: zones };
    },
  },
  {
    id: "conference",
    name: "Conference Hall",
    category: "conference",
    description: "Rows of chairs facing a stage with AV booth at back",
    icon: <Presentation className="w-8 h-8" />,
    capacity: 180,
    zones: 3,
    generator: () => {
      const zones = DEFAULT_PRICE_ZONES.slice(0, 3);
      const elements: LayoutElement[] = [];

      // Stage / Podium
      elements.push({
        id: uuidv4(),
        type: "stage",
        x: 350,
        y: 20,
        width: 300,
        height: 60,
        rotation: 0,
        zIndex: 5,
        locked: false,
        visible: true,
        properties: { kind: "stage", label: "PODIUM", backgroundColor: "#374151", borderColor: "#6b7280", shape: "rectangle" },
      });

      // VIP Front rows
      elements.push(
        ...createSeatGrid(200, 110, 3, 18, 28, 6, 8, "VIP", zones[0].id)
      );

      // Center aisle gap, then Standard rows
      elements.push(
        ...createSeatGrid(200, 250, 5, 18, 28, 6, 8, "Standard", zones[1].id, "D")
      );

      // Back rows (Economy)
      elements.push(
        ...createSeatGrid(200, 450, 4, 18, 28, 6, 8, "Back", zones[2].id, "I")
      );

      // AV Booth
      elements.push({
        id: uuidv4(),
        type: "shape",
        x: 420,
        y: 700,
        width: 160,
        height: 50,
        rotation: 0,
        zIndex: 5,
        locked: false,
        visible: true,
        properties: { kind: "shape", shapeType: "rectangle", fill: "#374151", stroke: "#6b7280", strokeWidth: 2, label: "AV Booth" },
      });
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 445,
        y: 710,
        width: 110,
        height: 25,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "AV Booth", fontSize: 12, fontWeight: "bold", color: "#fff", backgroundColor: "transparent" },
      });

      return { elements, priceZones: zones };
    },
  },
  {
    id: "stadium",
    name: "Stadium / Arena",
    category: "stadium",
    description: "Multi-level stadium with field-level and VIP boxes",
    icon: <Trophy className="w-8 h-8" />,
    capacity: 300,
    zones: 4,
    generator: () => {
      const zones = [
        { ...DEFAULT_PRICE_ZONES[0], zoneName: "Courtside" },
        { ...DEFAULT_PRICE_ZONES[1], zoneName: "Lower Bowl" },
        { ...DEFAULT_PRICE_ZONES[2], zoneName: "Upper Bowl" },
        { ...DEFAULT_PRICE_ZONES[3], zoneName: "Nosebleed" },
      ];
      const elements: LayoutElement[] = [];

      // Field/Court
      elements.push({
        id: uuidv4(),
        type: "shape",
        x: 350,
        y: 250,
        width: 300,
        height: 200,
        rotation: 0,
        zIndex: 2,
        locked: false,
        visible: true,
        properties: { kind: "shape", shapeType: "rectangle", fill: "#dcfce7", stroke: "#22c55e", strokeWidth: 2 },
      });
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 430,
        y: 330,
        width: 140,
        height: 30,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "FIELD / COURT", fontSize: 14, fontWeight: "bold", color: "#166534", backgroundColor: "transparent" },
      });

      // Courtside (North)
      elements.push(
        ...createSeatGrid(350, 170, 2, 20, 24, 4, 6, "North Courtside", zones[0].id)
      );

      // Courtside (South)
      elements.push(
        ...createSeatGrid(350, 470, 2, 20, 24, 4, 6, "South Courtside", zones[0].id, "C")
      );

      // Lower Bowl (West)
      elements.push(
        ...createSeatGrid(80, 200, 6, 8, 24, 4, 6, "West Lower", zones[1].id)
      );

      // Lower Bowl (East)
      elements.push(
        ...createSeatGrid(720, 200, 6, 8, 24, 4, 6, "East Lower", zones[1].id)
      );

      // Upper Bowl (North)
      elements.push(
        ...createSeatGrid(300, 40, 3, 24, 24, 4, 6, "North Upper", zones[2].id)
      );

      // Upper Bowl (South)
      elements.push(
        ...createSeatGrid(300, 570, 3, 24, 24, 4, 6, "South Upper", zones[2].id, "D")
      );

      // Nosebleed
      elements.push(
        ...createSeatGrid(300, 680, 2, 24, 24, 4, 6, "Nosebleed", zones[3].id)
      );

      return { elements, priceZones: zones };
    },
  },
  {
    id: "banquet",
    name: "Banquet / Gala",
    category: "banquet",
    description: "Round tables with seats, dance floor and stage",
    icon: <UtensilsCrossed className="w-8 h-8" />,
    capacity: 80,
    zones: 2,
    generator: () => {
      const zones = [
        { ...DEFAULT_PRICE_ZONES[0], zoneName: "VIP Table" },
        { ...DEFAULT_PRICE_ZONES[2], zoneName: "Standard Table" },
      ];
      const elements: LayoutElement[] = [];

      // Stage
      elements.push({
        id: uuidv4(),
        type: "stage",
        x: 350,
        y: 20,
        width: 300,
        height: 60,
        rotation: 0,
        zIndex: 5,
        locked: false,
        visible: true,
        properties: { kind: "stage", label: "STAGE", backgroundColor: "#1f2937", borderColor: "#D4AF37", shape: "rectangle" },
      });

      // Dance floor
      elements.push({
        id: uuidv4(),
        type: "shape",
        x: 400,
        y: 120,
        width: 200,
        height: 150,
        rotation: 0,
        zIndex: 2,
        locked: false,
        visible: true,
        properties: { kind: "shape", shapeType: "rectangle", fill: "#fef3c7", stroke: "#f59e0b", strokeWidth: 2 },
      });
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 430,
        y: 180,
        width: 140,
        height: 25,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "Dance Floor", fontSize: 13, fontWeight: "bold", color: "#92400e", backgroundColor: "transparent" },
      });

      // Create round table arrangements
      const tablePositions = [
        { x: 120, y: 130, zone: 0 },
        { x: 780, y: 130, zone: 0 },
        { x: 120, y: 320, zone: 1 },
        { x: 380, y: 350, zone: 1 },
        { x: 620, y: 350, zone: 1 },
        { x: 780, y: 320, zone: 1 },
        { x: 200, y: 530, zone: 1 },
        { x: 500, y: 530, zone: 1 },
        { x: 700, y: 530, zone: 1 },
        { x: 350, y: 680, zone: 1 },
      ];

      tablePositions.forEach((pos, tableIdx) => {
        // Table circle
        elements.push({
          id: uuidv4(),
          type: "shape",
          x: pos.x - 30,
          y: pos.y - 30,
          width: 60,
          height: 60,
          rotation: 0,
          zIndex: 3,
          locked: false,
          visible: true,
          properties: { kind: "shape", shapeType: "circle", fill: "#f9fafb", stroke: "#d1d5db", strokeWidth: 2 },
        });

        // 8 seats around table
        for (let s = 0; s < 8; s++) {
          const angle = (s / 8) * Math.PI * 2;
          const seatX = pos.x + Math.cos(angle) * 50 - 12;
          const seatY = pos.y + Math.sin(angle) * 50 - 12;
          elements.push({
            id: uuidv4(),
            type: "seat",
            x: seatX,
            y: seatY,
            width: 24,
            height: 24,
            rotation: 0,
            zIndex: 10,
            locked: false,
            visible: true,
            properties: {
              kind: "seat",
              section: `Table ${tableIdx + 1}`,
              row: "1",
              number: String(s + 1),
              priceZoneId: zones[pos.zone].id,
              status: "available",
              accessibility: false,
            },
          });
        }
      });

      return { elements, priceZones: zones };
    },
  },
  {
    id: "cinema",
    name: "Cinema",
    category: "cinema",
    description: "Tiered rows with center aisle and premium back rows",
    icon: <Film className="w-8 h-8" />,
    capacity: 150,
    zones: 3,
    generator: () => {
      const zones = [
        { ...DEFAULT_PRICE_ZONES[0], zoneName: "Premium (Back)" },
        { ...DEFAULT_PRICE_ZONES[2], zoneName: "Standard" },
        { ...DEFAULT_PRICE_ZONES[3], zoneName: "Front" },
      ];
      const elements: LayoutElement[] = [];

      // Screen
      elements.push({
        id: uuidv4(),
        type: "shape",
        x: 200,
        y: 25,
        width: 600,
        height: 30,
        rotation: 0,
        zIndex: 5,
        locked: false,
        visible: true,
        properties: { kind: "shape", shapeType: "rectangle", fill: "#e5e7eb", stroke: "#9ca3af", strokeWidth: 1 },
      });
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 430,
        y: 28,
        width: 140,
        height: 25,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "SCREEN", fontSize: 12, fontWeight: "bold", color: "#6b7280", backgroundColor: "transparent" },
      });

      // Front section (close to screen, cheap)
      elements.push(
        ...createSeatGrid(250, 90, 3, 18, 26, 5, 7, "Front", zones[2].id)
      );

      // Standard (middle, most rows)
      elements.push(
        ...createSeatGrid(220, 220, 6, 20, 26, 5, 7, "Standard", zones[1].id, "D")
      );

      // Premium (back, wider seats)
      elements.push(
        ...createSeatGrid(250, 460, 3, 16, 30, 7, 10, "Premium", zones[0].id, "J")
      );

      // Labels
      elements.push({
        id: uuidv4(),
        type: "label",
        x: 80,
        y: 120,
        width: 130,
        height: 20,
        rotation: 0,
        zIndex: 20,
        locked: false,
        visible: true,
        properties: { kind: "label", text: "Front Section", fontSize: 10, fontWeight: "normal", color: "#9ca3af", backgroundColor: "transparent" },
      });

      // Entrance
      elements.push({
        id: uuidv4(),
        type: "entrance",
        x: 20,
        y: 350,
        width: 35,
        height: 35,
        rotation: 0,
        zIndex: 15,
        locked: false,
        visible: true,
        properties: { kind: "entrance", label: "Entry", type: "entrance", color: "#22c55e" },
      });

      return { elements, priceZones: zones };
    },
  },
];

export function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered =
    filterCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === filterCategory);

  const handleUseTemplate = () => {
    const template = TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const { elements, priceZones } = template.generator();
    const totalSeated = elements.filter((e) => e.type === "seat").length;
    const totalStanding = elements
      .filter((e) => e.type === "standing-area")
      .reduce(
        (sum, e) =>
          sum +
          ((e.properties as unknown as { capacity?: number }).capacity || 0),
        0
      );

    const layout: VenueLayout = {
      id: `layout_${Date.now()}`,
      name: template.name,
      description: template.description,
      venueName: "",
      canvas: { ...DEFAULT_CANVAS },
      elements,
      priceZones,
      totalCapacity: totalSeated + totalStanding,
      totalSeated,
      totalStanding,
      accessibilityCount: 0,
      status: "draft",
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isTemplate: false,
      templateCategory: template.category,
    };

    onSelectTemplate(layout);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-[95vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Template Library
            </h2>
            <p className="text-sm text-gray-500">
              Choose a template to get started quickly
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          {[
            { id: "all", label: "All" },
            { id: "theater", label: "Theater" },
            { id: "concert", label: "Concert" },
            { id: "conference", label: "Conference" },
            { id: "stadium", label: "Stadium" },
            { id: "banquet", label: "Banquet" },
            { id: "cinema", label: "Cinema" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCategory === cat.id ? "bg-gold-500 text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`text-left border-2 rounded-xl p-4 transition-all ${selectedTemplate === template.id ? "border-gold-500 bg-gold-50/30 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedTemplate === template.id ? "bg-gold-500/20 text-gold-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    {template.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {template.category}
                    </p>
                  </div>
                  {selectedTemplate === template.id && (
                    <Check className="w-5 h-5 text-gold-600 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>~{template.capacity} seats</span>
                  <span>{template.zones} zones</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            {filtered.length} templates available
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUseTemplate}
              disabled={!selectedTemplate}
            >
              Use Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
