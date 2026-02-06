"use client";

import { useState } from "react";
import { PriceZone, LayoutElement } from "@/types/layout";
import { Button } from "@/components/ui/Button";
import { X, Plus, GripVertical, Trash2, Edit3 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface PriceZoneManagerProps {
  zones: PriceZone[];
  elements: LayoutElement[];
  onUpdateZones: (zones: PriceZone[]) => void;
  onClose: () => void;
}

export function PriceZoneManager({
  zones,
  elements,
  onUpdateZones,
  onClose,
}: PriceZoneManagerProps) {
  const [localZones, setLocalZones] = useState<PriceZone[]>([...zones]);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({
    zoneName: "",
    basePrice: 0,
    colorHex: "#3B82F6",
    description: "",
  });

  const getSeatCountForZone = (zoneId: string) => {
    return elements.filter(
      (el) =>
        el.properties.kind === "seat" &&
        (el.properties as unknown as { priceZoneId?: string }).priceZoneId === zoneId
    ).length;
  };

  const handleAddZone = () => {
    if (!newZone.zoneName.trim()) return;

    const zone: PriceZone = {
      id: `zone-${uuidv4().slice(0, 8)}`,
      zoneName: newZone.zoneName,
      basePrice: newZone.basePrice,
      colorHex: newZone.colorHex,
      description: newZone.description,
      displayOrder: localZones.length,
      dynamicPricingEnabled: false,
      seatCount: 0,
    };

    setLocalZones([...localZones, zone]);
    setNewZone({ zoneName: "", basePrice: 0, colorHex: "#3B82F6", description: "" });
  };

  const handleDeleteZone = (id: string) => {
    setLocalZones(localZones.filter((z) => z.id !== id));
  };

  const handleUpdateZone = (id: string, updates: Partial<PriceZone>) => {
    setLocalZones(
      localZones.map((z) => (z.id === id ? { ...z, ...updates } : z))
    );
  };

  const handleSave = () => {
    // Update seat counts
    const updatedZones = localZones.map((z) => ({
      ...z,
      seatCount: getSeatCountForZone(z.id),
    }));
    onUpdateZones(updatedZones);
    onClose();
  };

  const moveZone = (index: number, direction: "up" | "down") => {
    const newZones = [...localZones];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newZones.length) return;
    [newZones[index], newZones[swapIdx]] = [newZones[swapIdx], newZones[index]];
    newZones.forEach((z, i) => (z.displayOrder = i));
    setLocalZones(newZones);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-w-[95vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Price Zone Manager
            </h2>
            <p className="text-sm text-gray-500">
              Configure pricing zones for your layout
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Zone List */}
          <div className="space-y-2 mb-6">
            {localZones.map((zone, index) => (
              <div
                key={zone.id}
                className={`border rounded-lg p-3 transition-colors ${editingZone === zone.id ? "border-gold-500 bg-gold-50/30" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-center gap-3">
                  {/* Drag handle / reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveZone(index, "up")}
                      disabled={index === 0}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                    >
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M6 0L12 8H0L6 0Z" /></svg>
                    </button>
                    <button
                      onClick={() => moveZone(index, "down")}
                      disabled={index === localZones.length - 1}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                    >
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor"><path d="M6 8L0 0H12L6 8Z" /></svg>
                    </button>
                  </div>

                  {/* Color indicator */}
                  <div
                    className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-sm"
                    style={{ backgroundColor: zone.colorHex }}
                  />

                  {/* Zone info */}
                  {editingZone === zone.id ? (
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={zone.zoneName}
                        onChange={(e) =>
                          handleUpdateZone(zone.id, {
                            zoneName: e.target.value,
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="Zone name"
                      />
                      <input
                        type="number"
                        value={zone.basePrice}
                        onChange={(e) =>
                          handleUpdateZone(zone.id, {
                            basePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="Price"
                      />
                      <input
                        type="color"
                        value={zone.colorHex}
                        onChange={(e) =>
                          handleUpdateZone(zone.id, {
                            colorHex: e.target.value,
                          })
                        }
                        className="w-full h-8 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={zone.description}
                        onChange={(e) =>
                          handleUpdateZone(zone.id, {
                            description: e.target.value,
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-4">
                      <span className="font-medium text-sm text-gray-900 min-w-[80px]">
                        {zone.zoneName}
                      </span>
                      <span className="text-sm text-gold-600 font-semibold">
                        {zone.basePrice} QAR
                      </span>
                      <span className="text-xs text-gray-400">
                        {getSeatCountForZone(zone.id)} seats
                      </span>
                      {zone.description && (
                        <span className="text-xs text-gray-400 truncate max-w-[150px]">
                          {zone.description}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setEditingZone(
                          editingZone === zone.id ? null : zone.id
                        )
                      }
                      className="p-1.5 text-gray-400 hover:text-gold-600 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Pricing toggle (in edit mode) */}
                {editingZone === zone.id && (
                  <div className="mt-3 pl-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`dynamic-${zone.id}`}
                        checked={zone.dynamicPricingEnabled}
                        onChange={(e) =>
                          handleUpdateZone(zone.id, {
                            dynamicPricingEnabled: e.target.checked,
                          })
                        }
                        className="rounded accent-gold-500"
                      />
                      <label
                        htmlFor={`dynamic-${zone.id}`}
                        className="text-xs text-gray-600"
                      >
                        Enable Dynamic Pricing
                      </label>
                    </div>
                    {zone.dynamicPricingEnabled && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400">
                            Peak Multiplier
                          </label>
                          <input
                            type="number"
                            step={0.1}
                            min={1}
                            max={5}
                            value={zone.pricingRules?.peakMultiplier || 1.5}
                            onChange={(e) =>
                              handleUpdateZone(zone.id, {
                                pricingRules: {
                                  ...zone.pricingRules,
                                  peakMultiplier:
                                    parseFloat(e.target.value) || 1.5,
                                },
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400">
                            Off-Peak Discount %
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={zone.pricingRules?.offPeakDiscount || 10}
                            onChange={(e) =>
                              handleUpdateZone(zone.id, {
                                pricingRules: {
                                  ...zone.pricingRules,
                                  offPeakDiscount:
                                    parseInt(e.target.value) || 10,
                                },
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Zone */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Add New Zone
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={newZone.zoneName}
                onChange={(e) =>
                  setNewZone((p) => ({ ...p, zoneName: e.target.value }))
                }
                placeholder="Zone name"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <input
                type="number"
                value={newZone.basePrice || ""}
                onChange={(e) =>
                  setNewZone((p) => ({
                    ...p,
                    basePrice: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Price (QAR)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <input
                type="color"
                value={newZone.colorHex}
                onChange={(e) =>
                  setNewZone((p) => ({ ...p, colorHex: e.target.value }))
                }
                className="w-full h-[38px] rounded-lg border cursor-pointer"
              />
              <Button onClick={handleAddZone} disabled={!newZone.zoneName.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            {localZones.length} zones configured
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
