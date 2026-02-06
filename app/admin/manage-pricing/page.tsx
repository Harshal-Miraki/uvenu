"use client";

import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { layoutStorage } from "@/lib/layoutStorage";
import { Event } from "@/types";
import { VenueLayout } from "@/types/layout";
import { Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ManagePricingPage() {
    const { events, refreshData } = useStore();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [currentLayout, setCurrentLayout] = useState<VenueLayout | null>(null);
    const [loadingLayout, setLoadingLayout] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const selectedEvent = events.find(e => e.id === selectedEventId);

    // Fetch layout when event is selected
    useEffect(() => {
        const fetchLayout = async () => {
            if (!selectedEvent || !selectedEvent.layoutId) {
                setCurrentLayout(null);
                return;
            }

            setLoadingLayout(true);
            try {
                const layout = await layoutStorage.getLayout(selectedEvent.layoutId);
                setCurrentLayout(layout);
            } catch (error) {
                console.error("Failed to load layout:", error);
            }
            setLoadingLayout(false);
        };

        fetchLayout();
    }, [selectedEvent?.layoutId]);

    // Update price zone locally
    const handlePriceChange = (zoneId: string, price: number) => {
        if (!currentLayout) return;
        
        setCurrentLayout(prev => {
            if (!prev) return null;
            return {
                ...prev,
                priceZones: prev.priceZones.map(z => 
                    z.id === zoneId ? { ...z, price } : z
                )
            };
        });
        setIsSaved(false);
    };

    // Save changes to layout
    const handleSavePricing = async () => {
        if (!currentLayout) return;
        setSaving(true);
        try {
            await layoutStorage.saveLayout(currentLayout);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Error saving pricing:", error);
        }
        setSaving(false);
    };

    // Event discount update
    const handleEventUpdate = async (updates: Partial<Event>) => {
        if (!selectedEvent) return;
        const updatedEvents = events.map(e =>
            e.id === selectedEvent.id ? { ...e, ...updates } : e
        );
        await storage.saveEvents(updatedEvents);
        await refreshData();
    };

    // Calculate discounted price
    const getDiscountedPrice = (basePrice: number) => {
        if (!selectedEvent) return basePrice;
        const hasDiscount = selectedEvent.isEarlyBird || selectedEvent.isLastMinute;
        return hasDiscount
            ? Math.round(basePrice * (1 - selectedEvent.discountPercentage / 100))
            : basePrice;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Pricing Management</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Event Selection Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white border-gray-200 shadow-sm sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-lg">Select Event</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 p-4 pt-0">
                                {events.map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={() => setSelectedEventId(event.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                            selectedEventId === event.id
                                                ? 'bg-gold-50 border-gold-500 shadow-sm'
                                                : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className={`font-medium ${selectedEventId === event.id ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {event.title}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                        {!event.layoutId && (
                                            <div className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> No Layout
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <div className="text-sm text-gray-500 text-center py-4">
                                        No active events
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {!selectedEvent ? (
                            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
                                <div className="text-6xl mb-4">💰</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Event</h3>
                                <p>Choose an event from the list to manage its pricing zones and discounts.</p>
                            </div>
                        ) : !selectedEvent.layoutId ? (
                            <div className="bg-white border border-red-200 rounded-xl p-12 text-center shadow-sm">
                                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Layout Assigned</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    This event doesn't have a venue layout assigned yet. You need to assign or create a layout to configure pricing zones.
                                </p>
                                <Link href="/admin/layouts">
                                    <Button>Go to Layouts</Button>
                                </Link>
                            </div>
                        ) : loadingLayout ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                            </div>
                        ) : currentLayout ? (
                            <>
                                {/* Zone Pricing Card */}
                                <Card className="bg-white border-gray-200 shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                                        <div>
                                            <CardTitle>Seat Zone Pricing</CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Set base prices for each zone defined in the layout "{currentLayout.name}"
                                            </p>
                                        </div>
                                        <Button 
                                            onClick={handleSavePricing} 
                                            disabled={saving || !currentLayout}
                                            className="min-w-[140px]"
                                        >
                                            {saving ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                            ) : isSaved ? (
                                                <><Check className="w-4 h-4 mr-2" /> Saved</>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentLayout.priceZones.map((zone) => (
                                                <div 
                                                    key={zone.id} 
                                                    className="border rounded-lg p-4 bg-white hover:border-gray-300 transition-colors"
                                                    style={{ borderLeftWidth: '4px', borderLeftColor: zone.colorHex }}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="font-bold text-gray-900">{zone.zoneName}</span>
                                                        <span 
                                                            className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600"
                                                            style={{ backgroundColor: `${zone.colorHex}20`, color: zone.colorHex }}
                                                        >
                                                            {zone.category}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">QAR</span>
                                                            <Input 
                                                                type="number"
                                                                min="0"
                                                                value={zone.price}
                                                                onChange={(e) => handlePriceChange(zone.id, Number(e.target.value))}
                                                                className="pl-12 font-bold text-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {currentLayout.priceZones.length === 0 && (
                                                <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                    No price zones defined in this layout. 
                                                    <Link href={`/admin/layouts/builder/${currentLayout.id}`} className="text-gold-600 hover:underline ml-1">
                                                        Edit Layout
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Event Discounts Card */}
                                <Card className="bg-white border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Discounts & Promotions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Strategy Selection */}
                                            <div className="space-y-4">
                                                <label className="text-sm font-medium text-gray-700">Discount Type</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                            selectedEvent.isEarlyBird
                                                                ? 'border-gold-500 bg-gold-500/10'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                        onClick={() => handleEventUpdate({
                                                            isEarlyBird: !selectedEvent.isEarlyBird,
                                                            isLastMinute: false
                                                        })}
                                                    >
                                                        <div className="font-bold text-gray-900">Early Bird</div>
                                                        <p className="text-xs text-gray-500 mt-1"> incentivize early bookings</p>
                                                    </div>
                                                    <div
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                            selectedEvent.isLastMinute
                                                                ? 'border-red-500 bg-red-500/10'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                        onClick={() => handleEventUpdate({
                                                            isLastMinute: !selectedEvent.isLastMinute,
                                                            isEarlyBird: false
                                                        })}
                                                    >
                                                        <div className="font-bold text-gray-900">Last Minute</div>
                                                        <p className="text-xs text-gray-500 mt-1">Clear remaining seats</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Percentage Slider */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-medium text-gray-700">Discount Percentage</label>
                                                    <span className="font-bold text-gold-600">{selectedEvent.discountPercentage}% OFF</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="50"
                                                        value={selectedEvent.discountPercentage}
                                                        onChange={(e) => handleEventUpdate({
                                                            discountPercentage: Number(e.target.value)
                                                        })}
                                                        className="flex-1 h-2 bg-gray-200 rounded-lg cursor-pointer accent-gold-500"
                                                    />
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={selectedEvent.discountPercentage}
                                                        onChange={(e) => handleEventUpdate({
                                                            discountPercentage: Math.min(100, Number(e.target.value))
                                                        })}
                                                        className="w-20 text-center font-bold"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Applies to all ticket sales for this event immediately.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price Preview */}
                                        {(selectedEvent.isEarlyBird || selectedEvent.isLastMinute) && (
                                            <div className="mt-8 pt-6 border-t border-gray-100">
                                                <h4 className="text-sm font-bold text-gray-900 mb-4">Customer Pricing Preview</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {currentLayout.priceZones.map(zone => (
                                                        <div key={zone.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.colorHex }} />
                                                            <span className="text-xs text-gray-600 font-medium">{zone.zoneName}</span>
                                                            <div className="flex items-baseline gap-1.5 ml-2">
                                                                <span className="font-bold text-gray-900">{getDiscountedPrice(zone.price)}</span>
                                                                <span className="text-[10px] text-gray-400 line-through">{zone.price}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
