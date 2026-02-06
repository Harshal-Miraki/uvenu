"use client";

import { Button } from "@/components/ui/Button";
import { VenueLayout } from "@/types/layout";
import {
  Save,
  Upload,
  Undo2,
  Redo2,
  MousePointer2,
  Hand,
  Pencil,
  Grid3X3,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TopToolbarProps {
  layout: VenueLayout;
  tool: "select" | "pan" | "draw";
  setTool: (tool: "select" | "pan" | "draw") => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showZones: boolean;
  setShowZones: (show: boolean) => void;
  isDirty: boolean;
  saving: boolean;
  lastSaved: string | null;
  onSave: () => void;
  onPublish: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenZoneManager: () => void;
  onOpenValidation: () => void;
  onLayoutNameChange: (name: string) => void;
}

export function TopToolbar({
  layout,
  tool,
  setTool,
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
  showZones,
  setShowZones,
  isDirty,
  saving,
  lastSaved,
  onSave,
  onPublish,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenZoneManager,
  onOpenValidation,
  onLayoutNameChange,
}: TopToolbarProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(layout.name);

  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2];

  const handleNameSubmit = () => {
    onLayoutNameChange(tempName);
    setEditingName(false);
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Link href="/admin/layouts">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>

        <div className="h-6 w-px bg-gray-200" />

        {/* Layout Name */}
        {editingName ? (
          <input
            autoFocus
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            className="text-sm font-semibold text-gray-900 border border-gold-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        ) : (
          <button
            onClick={() => {
              setTempName(layout.name);
              setEditingName(true);
            }}
            className="text-sm font-semibold text-gray-900 hover:text-gold-600 transition-colors"
          >
            {layout.name}
          </button>
        )}

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          {saving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isDirty ? (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Unsaved changes</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Saved</span>
            </>
          ) : null}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Save & Publish */}
        <Button size="sm" variant="outline" onClick={onSave} disabled={saving}>
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save
        </Button>
        <Button size="sm" onClick={onPublish} disabled={saving}>
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Publish
        </Button>
      </div>

      {/* Center Section - Tools */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTool("select")}
          className={`p-1.5 rounded-md transition-colors ${tool === "select" ? "bg-white shadow-sm text-gold-600" : "text-gray-500 hover:text-gray-700"}`}
          title="Select (V)"
        >
          <MousePointer2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool("pan")}
          className={`p-1.5 rounded-md transition-colors ${tool === "pan" ? "bg-white shadow-sm text-gold-600" : "text-gray-500 hover:text-gray-700"}`}
          title="Pan (Space + Drag)"
        >
          <Hand className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool("draw")}
          className={`p-1.5 rounded-md transition-colors ${tool === "draw" ? "bg-white shadow-sm text-gold-600" : "text-gray-500 hover:text-gray-700"}`}
          title="Draw"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-md transition-colors ${canUndo ? "text-gray-500 hover:text-gray-700" : "text-gray-300"}`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-md transition-colors ${canRedo ? "text-gray-500 hover:text-gray-700" : "text-gray-300"}`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Grid toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded-md transition-colors ${showGrid ? "text-gold-600 bg-gold-500/10" : "text-gray-400 hover:text-gray-600"}`}
          title="Toggle Grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>

        {/* Zone overlay toggle */}
        <button
          onClick={() => setShowZones(!showZones)}
          className={`p-1.5 rounded-md transition-colors ${showZones ? "text-gold-600 bg-gold-500/10" : "text-gray-400 hover:text-gray-600"}`}
          title="Show Price Zones"
        >
          <Palette className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-200" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="text-xs bg-transparent border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none"
          >
            {zoomLevels.map((z) => (
              <option key={z} value={z}>
                {Math.round(z * 100)}%
              </option>
            ))}
          </select>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"
            title="Reset zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Price Zones */}
        <Button size="sm" variant="outline" onClick={onOpenZoneManager}>
          <Palette className="w-3.5 h-3.5 mr-1.5" />
          Price Zones
        </Button>

        {/* Validation */}
        <Button size="sm" variant="ghost" onClick={onOpenValidation}>
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          Validate
        </Button>
      </div>
    </div>
  );
}
