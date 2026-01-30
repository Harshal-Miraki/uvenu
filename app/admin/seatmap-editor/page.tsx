"use client";

import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import SVGTierEditor from "@/components/SVGTierEditor";

export default function SeatMapEditorPage() {
    const { events } = useStore();
    const router = useRouter();
    const [selectedEventId, setSelectedEventId] = useState<string>('');

    const selectedEvent = events.find(e => e.id === selectedEventId);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Admin
                    </Button>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Seat Map Editor</h1>
                <p className="text-gray-600 mb-8">
                    Customize tier boundaries for each event's seat map. Changes are saved per-event and don't affect other events.
                </p>

                {/* Event Selector */}
                <Card className="bg-white border-gray-200 shadow-sm mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">
                                Select Event:
                            </label>
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white text-gray-900"
                            >
                                <option value="">-- Choose an event --</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>
                                        {event.title} ({new Date(event.date).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Editor */}
                {selectedEventId && selectedEvent ? (
                    <Card className="bg-white border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Editing: {selectedEvent.title}</span>
                                <span className="text-sm font-normal text-gray-500">
                                    {selectedEvent.venue} • {new Date(selectedEvent.date).toLocaleDateString()}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <SVGTierEditor
                                eventId={selectedEventId}
                                onSave={() => {
                                    // Could show a toast here
                                    console.log('Boundaries saved for event:', selectedEventId);
                                }}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-12 text-center text-gray-500">
                            <div className="text-6xl mb-4">🎭</div>
                            <p>Select an event above to edit its seat map layout</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
