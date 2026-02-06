"use client";

import { LayoutElement, PriceZone, VenueLayout } from "@/types/layout";
import { Button } from "@/components/ui/Button";
import { Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PropertiesPanelProps {
  selectedElements: LayoutElement[];
  layout: VenueLayout;
  onUpdateElement: (id: string, updates: Partial<LayoutElement>) => void;
  onUpdateCanvas: (updates: Partial<VenueLayout["canvas"]>) => void;
  onDeleteElements: (ids: string[]) => void;
  priceZones: PriceZone[];
}

export function PropertiesPanel({
  selectedElements,
  layout,
  onUpdateElement,
  onUpdateCanvas,
  onDeleteElements,
  priceZones,
}: PropertiesPanelProps) {
  const single = selectedElements.length === 1 ? selectedElements[0] : null;
  const multi = selectedElements.length > 1;

  const updateProps = (id: string, propUpdates: Record<string, unknown>) => {
    const el = layout.elements.find((e) => e.id === id);
    if (!el) return;
    onUpdateElement(id, {
      properties: { ...el.properties, ...propUpdates } as LayoutElement["properties"],
    });
  };

  // Canvas properties when nothing selected
  if (selectedElements.length === 0) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Canvas Properties
          </h3>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Layout Name
            </label>
            <input
              type="text"
              value={layout.name}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Venue Name
            </label>
            <input
              type="text"
              value={layout.venueName}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Width
              </label>
              <input
                type="number"
                value={layout.canvas.width}
                onChange={(e) =>
                  onUpdateCanvas({ width: parseInt(e.target.value) || 1200 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Height
              </label>
              <input
                type="number"
                value={layout.canvas.height}
                onChange={(e) =>
                  onUpdateCanvas({ height: parseInt(e.target.value) || 800 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Grid Size
            </label>
            <input
              type="number"
              min={5}
              max={100}
              value={layout.canvas.gridSize}
              onChange={(e) =>
                onUpdateCanvas({ gridSize: parseInt(e.target.value) || 20 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={layout.canvas.backgroundColor}
                onChange={(e) =>
                  onUpdateCanvas({ backgroundColor: e.target.value })
                }
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={layout.canvas.backgroundColor}
                onChange={(e) =>
                  onUpdateCanvas({ backgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="snapToGrid"
              checked={layout.canvas.snapToGrid}
              onChange={(e) =>
                onUpdateCanvas({ snapToGrid: e.target.checked })
              }
              className="rounded accent-gold-500"
            />
            <label
              htmlFor="snapToGrid"
              className="text-xs font-medium text-gray-600"
            >
              Snap to Grid
            </label>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">
              Layout Stats
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Total Seats</span>
                <p className="font-bold text-gray-900">{layout.totalSeated}</p>
              </div>
              <div>
                <span className="text-gray-400">Standing</span>
                <p className="font-bold text-gray-900">
                  {layout.totalStanding}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Capacity</span>
                <p className="font-bold text-gray-900">
                  {layout.totalCapacity}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Accessible</span>
                <p className="font-bold text-gray-900">
                  {layout.accessibilityCount}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Elements</span>
                <p className="font-bold text-gray-900">
                  {layout.elements.length}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Zones</span>
                <p className="font-bold text-gray-900">
                  {layout.priceZones.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-select properties
  if (multi) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {selectedElements.length} Elements Selected
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Bulk zone assignment */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Assign Price Zone (All)
            </label>
            <select
              onChange={(e) => {
                selectedElements.forEach((el) => {
                  if (el.properties.kind === "seat") {
                    updateProps(el.id, { priceZoneId: e.target.value });
                  }
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              defaultValue=""
            >
              <option value="" disabled>
                Select zone...
              </option>
              {priceZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zoneName} - {zone.basePrice} QAR
                </option>
              ))}
            </select>
          </div>

          {/* Bulk section assignment */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Assign Section (All)
            </label>
            <input
              type="text"
              placeholder="e.g., A, B, VIP"
              onChange={(e) => {
                selectedElements.forEach((el) => {
                  if (el.properties.kind === "seat") {
                    updateProps(el.id, { section: e.target.value });
                  }
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() =>
              onDeleteElements(selectedElements.map((el) => el.id))
            }
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete All Selected
          </Button>
        </div>
      </div>
    );
  }

  // Single element properties
  if (!single) return null;

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {single.type.charAt(0).toUpperCase() + single.type.slice(1)}{" "}
          Properties
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              onUpdateElement(single.id, { locked: !single.locked })
            }
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title={single.locked ? "Unlock" : "Lock"}
          >
            {single.locked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() =>
              onUpdateElement(single.id, { visible: !single.visible })
            }
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            {single.visible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Position */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Position</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">X</label>
              <input
                type="number"
                value={Math.round(single.x)}
                onChange={(e) =>
                  onUpdateElement(single.id, {
                    x: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Y</label>
              <input
                type="number"
                value={Math.round(single.y)}
                onChange={(e) =>
                  onUpdateElement(single.id, {
                    y: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Width</label>
              <input
                type="number"
                value={single.width}
                onChange={(e) =>
                  onUpdateElement(single.id, {
                    width: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Height</label>
              <input
                type="number"
                value={single.height}
                onChange={(e) =>
                  onUpdateElement(single.id, {
                    height: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="text-[10px] text-gray-400">Rotation</label>
            <input
              type="number"
              min={0}
              max={360}
              value={single.rotation}
              onChange={(e) =>
                onUpdateElement(single.id, {
                  rotation: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        {/* Type-specific properties */}
        {single.properties.kind === "seat" && (
          <SeatProperties
            element={single}
            priceZones={priceZones}
            onUpdate={(updates) => updateProps(single.id, updates)}
          />
        )}

        {single.properties.kind === "stage" && (
          <StageProperties
            element={single}
            onUpdate={(updates) => updateProps(single.id, updates)}
          />
        )}

        {single.properties.kind === "standing-area" && (
          <StandingAreaProperties
            element={single}
            onUpdate={(updates) => updateProps(single.id, updates)}
          />
        )}

        {single.properties.kind === "shape" && (
          <ShapePropertiesPanel
            element={single}
            onUpdate={(updates) => updateProps(single.id, updates)}
          />
        )}

        {single.properties.kind === "label" && (
          <LabelProperties
            element={single}
            onUpdate={(updates) => updateProps(single.id, updates)}
          />
        )}

        {single.properties.kind === "entrance" && (
          <EntranceProperties
            element={single}
            onUpdate={(updates) => updateProps(single.id, updates)}
          />
        )}
      </div>

      {/* Delete button */}
      <div className="p-4 border-t border-gray-100">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDeleteElements([single.id])}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Delete Element
        </Button>
      </div>
    </div>
  );
}

function SeatProperties({
  element,
  priceZones,
  onUpdate,
}: {
  element: LayoutElement;
  priceZones: PriceZone[];
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const props = element.properties as unknown as Record<string, unknown>;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400">Seat Details</h4>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-gray-400">Section</label>
          <input
            type="text"
            value={props.section as string}
            onChange={(e) => onUpdate({ section: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400">Row</label>
          <input
            type="text"
            value={props.row as string}
            onChange={(e) => onUpdate({ row: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400">Number</label>
          <input
            type="text"
            value={props.number as string}
            onChange={(e) => onUpdate({ number: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-gray-400">Price Zone</label>
        <select
          value={props.priceZoneId as string}
          onChange={(e) => onUpdate({ priceZoneId: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          {priceZones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.zoneName} - {zone.basePrice} QAR
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-gray-400">Status</label>
        <select
          value={props.status as string}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="available">Available</option>
          <option value="reserved_admin">Reserved (Admin)</option>
          <option value="broken">Broken / Unavailable</option>
          <option value="wheelchair">Wheelchair Accessible</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="accessibility"
          checked={props.accessibility as boolean}
          onChange={(e) => onUpdate({ accessibility: e.target.checked })}
          className="rounded accent-gold-500"
        />
        <label
          htmlFor="accessibility"
          className="text-xs font-medium text-gray-600"
        >
          Wheelchair Accessible
        </label>
      </div>
    </div>
  );
}

function StageProperties({
  element,
  onUpdate,
}: {
  element: LayoutElement;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const props = element.properties as unknown as Record<string, unknown>;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400">Stage Details</h4>
      <div>
        <label className="text-[10px] text-gray-400">Label</label>
        <input
          type="text"
          value={props.label as string}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Background</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.backgroundColor as string}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={props.backgroundColor as string}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Border Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.borderColor as string}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={props.borderColor as string}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>
    </div>
  );
}

function StandingAreaProperties({
  element,
  onUpdate,
}: {
  element: LayoutElement;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const props = element.properties as unknown as Record<string, unknown>;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400">
        Standing Area Details
      </h4>
      <div>
        <label className="text-[10px] text-gray-400">Label</label>
        <input
          type="text"
          value={props.label as string}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Capacity</label>
        <input
          type="number"
          min={1}
          value={props.capacity as number}
          onChange={(e) =>
            onUpdate({ capacity: parseInt(e.target.value) || 1 })
          }
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Background</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.backgroundColor as string}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={props.backgroundColor as string}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>
    </div>
  );
}

function ShapePropertiesPanel({
  element,
  onUpdate,
}: {
  element: LayoutElement;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const props = element.properties as unknown as Record<string, unknown>;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400">Shape Details</h4>
      <div>
        <label className="text-[10px] text-gray-400">Shape Type</label>
        <select
          value={props.shapeType as string}
          onChange={(e) => onUpdate({ shapeType: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Fill Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.fill as string}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={props.fill as string}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Stroke Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.stroke as string}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={props.stroke as string}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Stroke Width</label>
        <input
          type="number"
          min={0}
          max={10}
          value={props.strokeWidth as number}
          onChange={(e) =>
            onUpdate({ strokeWidth: parseInt(e.target.value) || 1 })
          }
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>
    </div>
  );
}

function LabelProperties({
  element,
  onUpdate,
}: {
  element: LayoutElement;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const props = element.properties as unknown as Record<string, unknown>;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400">Label Details</h4>
      <div>
        <label className="text-[10px] text-gray-400">Text</label>
        <input
          type="text"
          value={props.text as string}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400">Font Size</label>
          <input
            type="number"
            min={8}
            max={72}
            value={props.fontSize as number}
            onChange={(e) =>
              onUpdate({ fontSize: parseInt(e.target.value) || 14 })
            }
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400">Font Weight</label>
          <select
            value={props.fontWeight as string}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.color as string}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={props.color as string}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>
    </div>
  );
}

function EntranceProperties({
  element,
  onUpdate,
}: {
  element: LayoutElement;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const props = element.properties as unknown as Record<string, unknown>;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400">
        Entrance/Exit Details
      </h4>
      <div>
        <label className="text-[10px] text-gray-400">Label</label>
        <input
          type="text"
          value={props.label as string}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Type</label>
        <select
          value={props.type as string}
          onChange={(e) => onUpdate({ type: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="entrance">Entrance</option>
          <option value="exit">Exit</option>
          <option value="emergency">Emergency Exit</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-gray-400">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.color as string}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-6 h-6 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={props.color as string}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>
    </div>
  );
}
