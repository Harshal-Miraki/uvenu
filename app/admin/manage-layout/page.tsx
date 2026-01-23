"use client";

import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { storage } from "@/lib/storage";
import { useState } from "react";
import { Event, TierLayout } from "@/types";

export default function ManageLayoutPage() {
    const { events, refreshData } = useStore();
    const [selectedLayouts, setSelectedLayouts] = useState<Record<string, TierLayout>>({});

    const handleLayoutChange = (eventId: string, layout: TierLayout) => {
        setSelectedLayouts(prev => ({ ...prev, [eventId]: layout }));
    };

    const handleSave = async (eventId: string) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const newLayout = selectedLayouts[eventId] || event.tierLayout || 'ascending';

        // Update event with new layout
        const updatedEvent: Event = {
            ...event,
            tierLayout: newLayout,
            seatMap: undefined // Clear seat map to regenerate with new layout
        };

        await storage.saveEvent(updatedEvent);
        await refreshData();

        // Clear selection after save
        setSelectedLayouts(prev => {
            const newState = { ...prev };
            delete newState[eventId];
            return newState;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Tier Layouts</h1>
                <p className="text-gray-600 mb-8">Configure where premium tiers are located for each event</p>

                <div className="grid gap-4">
                    {events.map(event => {
                        const currentLayout = selectedLayouts[event.id] || event.tierLayout || 'ascending';
                        const hasChanges = selectedLayouts[event.id] && selectedLayouts[event.id] !== event.tierLayout;

                        return (
                            <Card key={event.id} className="bg-white border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                                            <p className="text-sm text-gray-500">{event.venue} • {new Date(event.date).toLocaleDateString()}</p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-gray-700">Tier Layout</label>
                                                <select
                                                    value={currentLayout}
                                                    onChange={e => handleLayoutChange(event.id, e.target.value as TierLayout)}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white text-gray-900 min-w-[280px]"
                                                >
                                                    <option value="ascending">Premium at Front (Platinum: Rows A-B)</option>
                                                    <option value="descending">Premium at Back (Platinum: Rows K-L)</option>
                                                </select>
                                            </div>

                                            {hasChanges && (
                                                <Button
                                                    onClick={() => handleSave(event.id)}
                                                    size="sm"
                                                    className="mt-6"
                                                >
                                                    Save
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Visual indicator */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className={`w-3 h-3 rounded-full ${currentLayout === 'ascending' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                            <span>
                                                {currentLayout === 'ascending'
                                                    ? 'Front rows (A-B) are Platinum, back rows (I-L) are Bronze'
                                                    : 'Front rows (A-D) are Bronze, back rows (K-L) are Platinum'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
