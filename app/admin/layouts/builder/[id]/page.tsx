"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { layoutStorage } from "@/lib/layoutStorage";
import {
  VenueLayout,
  LayoutElement,
  PriceZone,
  createNewLayout,
  DEFAULT_PRICE_ZONES,
} from "@/types/layout";
import { LayoutCanvas } from "@/components/admin/layouts/LayoutBuilder/Canvas";
import { ElementLibrary } from "@/components/admin/layouts/LayoutBuilder/ElementLibrary";
import { PropertiesPanel } from "@/components/admin/layouts/LayoutBuilder/PropertiesPanel";
import { TopToolbar } from "@/components/admin/layouts/LayoutBuilder/TopToolbar";
import { PriceZoneManager } from "@/components/admin/layouts/PriceZones/ZoneManager";
import { ValidationPanel } from "@/components/admin/layouts/Validation/ValidationPanel";
import { TemplateLibrary } from "@/components/admin/layouts/Templates/TemplateLibrary";
import { v4 as uuidv4 } from "uuid";

export default function LayoutBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const layoutId = params.id as string;
  const isNew = layoutId === "new";

  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool, setTool] = useState<"select" | "pan" | "draw">("select");
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showZones, setShowZones] = useState(false);
  const [showZoneManager, setShowZoneManager] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Undo/Redo
  const [undoStack, setUndoStack] = useState<VenueLayout[]>([]);
  const [redoStack, setRedoStack] = useState<VenueLayout[]>([]);

  useEffect(() => {
    const loadLayout = async () => {
      if (isNew) {
        const newLayout = createNewLayout();
        setLayout(newLayout);
        setShowTemplates(true);
        setLoading(false);
      } else {
        const fetched = await layoutStorage.getLayout(layoutId);
        if (fetched) {
          setLayout(fetched);
        } else {
          router.push("/admin/layouts");
          return;
        }
        setLoading(false);
      }
    };
    loadLayout();
  }, [layoutId, isNew, router]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!layout || !isDirty) return;
    const timer = setInterval(async () => {
      await handleSave();
    }, 30000);
    return () => clearInterval(timer);
  }, [layout, isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!layout) return;

      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if (e.ctrlKey && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+S - Save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Delete - Delete selected
      if (e.key === "Delete" && selectedIds.length > 0) {
        e.preventDefault();
        handleDeleteElements(selectedIds);
      }
      // Escape - Deselect
      if (e.key === "Escape") {
        setSelectedIds([]);
      }
      // Ctrl+D - Duplicate
      if (e.ctrlKey && e.key === "d" && selectedIds.length > 0) {
        e.preventDefault();
        handleDuplicateElements(selectedIds);
      }
      // Ctrl+A - Select all
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        setSelectedIds(layout.elements.map((el) => el.id));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [layout, selectedIds, undoStack]);

  const pushUndo = useCallback(() => {
    if (!layout) return;
    setUndoStack((prev) => [...prev.slice(-49), { ...layout, elements: [...layout.elements] }]);
    setRedoStack([]);
  }, [layout]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !layout) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, layout]);
    setUndoStack((u) => u.slice(0, -1));
    setLayout(prev);
    setIsDirty(true);
  }, [undoStack, layout]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !layout) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, layout]);
    setRedoStack((r) => r.slice(0, -1));
    setLayout(next);
    setIsDirty(true);
  }, [redoStack, layout]);

  const recalculateCapacity = (elements: LayoutElement[]): Partial<VenueLayout> => {
    let totalSeated = 0;
    let totalStanding = 0;
    let accessibilityCount = 0;

    elements.forEach((el) => {
      if (el.type === "seat") {
        totalSeated++;
        if (el.properties.kind === "seat" && el.properties.accessibility) {
          accessibilityCount++;
        }
      } else if (el.type === "standing-area" && el.properties.kind === "standing-area") {
        totalStanding += el.properties.capacity;
      }
    });

    return {
      totalSeated,
      totalStanding,
      totalCapacity: totalSeated + totalStanding,
      accessibilityCount,
    };
  };

  const updateLayout = useCallback(
    (updater: (prev: VenueLayout) => VenueLayout) => {
      if (!layout) return;
      pushUndo();
      setLayout((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        const caps = recalculateCapacity(updated.elements);
        return { ...updated, ...caps, updatedAt: new Date().toISOString() };
      });
      setIsDirty(true);
    },
    [layout, pushUndo]
  );

  const handleAddElement = useCallback(
    (element: LayoutElement) => {
      updateLayout((prev) => ({
        ...prev,
        elements: [...prev.elements, element],
      }));
      setSelectedIds([element.id]);
    },
    [updateLayout]
  );

  const handleUpdateElement = useCallback(
    (id: string, updates: Partial<LayoutElement>) => {
      updateLayout((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      }));
    },
    [updateLayout]
  );

  const handleDeleteElements = useCallback(
    (ids: string[]) => {
      updateLayout((prev) => ({
        ...prev,
        elements: prev.elements.filter((el) => !ids.includes(el.id)),
      }));
      setSelectedIds([]);
    },
    [updateLayout]
  );

  const handleDuplicateElements = useCallback(
    (ids: string[]) => {
      if (!layout) return;
      const toDuplicate = layout.elements.filter((el) => ids.includes(el.id));
      const newElements = toDuplicate.map((el) => ({
        ...el,
        id: uuidv4(),
        x: el.x + 30,
        y: el.y + 30,
      }));
      updateLayout((prev) => ({
        ...prev,
        elements: [...prev.elements, ...newElements],
      }));
      setSelectedIds(newElements.map((el) => el.id));
    },
    [layout, updateLayout]
  );

  const handleMoveElement = useCallback(
    (id: string, x: number, y: number) => {
      setLayout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          elements: prev.elements.map((el) =>
            el.id === id ? { ...el, x, y } : el
          ),
        };
      });
      setIsDirty(true);
    },
    []
  );

  const handleSave = async () => {
    if (!layout) return;
    setSaving(true);
    try {
      await layoutStorage.saveLayout(layout);
      setIsDirty(false);
      setLastSaved(new Date().toISOString());

      // If was new, redirect to the real ID
      if (isNew) {
        router.replace(`/admin/layouts/builder/${layout.id}`);
      }
    } catch (error) {
      console.error("Error saving layout:", error);
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!layout) return;
    updateLayout((prev) => ({ ...prev, status: "active" }));
    await handleSave();
  };

  const handleUpdatePriceZones = useCallback(
    (zones: PriceZone[]) => {
      updateLayout((prev) => ({ ...prev, priceZones: zones }));
    },
    [updateLayout]
  );

  const handleUpdateCanvas = useCallback(
    (updates: Partial<VenueLayout["canvas"]>) => {
      updateLayout((prev) => ({
        ...prev,
        canvas: { ...prev.canvas, ...updates },
      }));
    },
    [updateLayout]
  );

  const handleAddSeatsFromSection = useCallback(
    (
      sectionName: string,
      rows: number,
      seatsPerRow: number,
      startX: number,
      startY: number,
      priceZoneId: string,
      rowSpacing: number,
      seatSpacing: number
    ) => {
      const newElements: LayoutElement[] = [];
      const seatSize = 28;

      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let s = 0; s < seatsPerRow; s++) {
          newElements.push({
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

      updateLayout((prev) => ({
        ...prev,
        elements: [...prev.elements, ...newElements],
      }));
    },
    [updateLayout]
  );

  if (loading || !layout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading layout builder...</p>
        </div>
      </div>
    );
  }

  const selectedElements = layout.elements.filter((el) =>
    selectedIds.includes(el.id)
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar
        layout={layout}
        tool={tool}
        setTool={setTool}
        zoom={zoom}
        setZoom={setZoom}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showZones={showZones}
        setShowZones={setShowZones}
        isDirty={isDirty}
        saving={saving}
        lastSaved={lastSaved}
        onSave={handleSave}
        onPublish={handlePublish}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onOpenZoneManager={() => setShowZoneManager(true)}
        onOpenValidation={() => setShowValidation(true)}
        onLayoutNameChange={(name) =>
          updateLayout((prev) => ({ ...prev, name }))
        }
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Element Library */}
        <ElementLibrary
          onAddElement={handleAddElement}
          onAddSection={handleAddSeatsFromSection}
          priceZones={layout.priceZones}
          canvasWidth={layout.canvas.width}
          canvasHeight={layout.canvas.height}
        />

        {/* Canvas */}
        <LayoutCanvas
          layout={layout}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          tool={tool}
          zoom={zoom}
          setZoom={setZoom}
          showGrid={showGrid}
          showZones={showZones}
          onMoveElement={handleMoveElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElements={handleDeleteElements}
          onAddElement={handleAddElement}
        />

        {/* Right Sidebar - Properties Panel */}
        <PropertiesPanel
          selectedElements={selectedElements}
          layout={layout}
          onUpdateElement={handleUpdateElement}
          onUpdateCanvas={handleUpdateCanvas}
          onDeleteElements={handleDeleteElements}
          priceZones={layout.priceZones}
        />
      </div>

      {/* Price Zone Manager Modal */}
      {showZoneManager && (
        <PriceZoneManager
          zones={layout.priceZones}
          elements={layout.elements}
          onUpdateZones={handleUpdatePriceZones}
          onClose={() => setShowZoneManager(false)}
        />
      )}

      {/* Validation Panel */}
      {showValidation && (
        <ValidationPanel
          layout={layout}
          onClose={() => setShowValidation(false)}
        />
      )}

      {/* Template Library (shown for new layouts) */}
      {showTemplates && (
        <TemplateLibrary
          onSelectTemplate={(templateLayout) => {
            setLayout(templateLayout);
            setShowTemplates(false);
            setIsDirty(true);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
