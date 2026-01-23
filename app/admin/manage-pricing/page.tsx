"use client";

import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { TierConfig, SeatTier, Event } from "@/types";
import { Check, RefreshCw } from "lucide-react";

export default function ManagePricingPage() {
    const { events, refreshData } = useStore();
    const [tierPricing, setTierPricing] = useState<TierConfig[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const selectedEvent = events.find(e => e.id === selectedEventId);

    // Load tier pricing from storage
    useEffect(() => {
        const loadPricing = async () => {
            const pricing = await storage.getTierPricing();
            setTierPricing(pricing);
        };
        loadPricing();
    }, []);

    // Update individual tier price
    const handlePriceChange = (tierId: SeatTier, value: string) => {
        const numValue = parseInt(value) || 0;
        setTierPricing(prev => prev.map(tier =>
            tier.id === tierId ? { ...tier, price: numValue } : tier
        ));
        setIsSaved(false);
    };

    // Increment/decrement price
    const adjustPrice = (tierId: SeatTier, delta: number) => {
        setTierPricing(prev => prev.map(tier =>
            tier.id === tierId ? { ...tier, price: Math.max(0, tier.price + delta) } : tier
        ));
        setIsSaved(false);
    };

    // Save all pricing changes
    const savePricing = async () => {
        await storage.saveTierPricing(tierPricing);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
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
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Pricing Management</h1>

                {/* Global Tier Pricing */}
                <Card className="bg-white border-gray-200 shadow-sm mb-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Seat Tier Pricing (Global)</CardTitle>
                        <Button onClick={savePricing} size="sm" disabled={isSaved}>
                            {isSaved ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" /> Saved
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-6">
                            These prices apply to all events. Changes will reflect in the seat selection map instantly.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tierPricing.map(tier => (
                                <div
                                    key={tier.id}
                                    className="p-4 rounded-lg border-2"
                                    style={{ borderColor: tier.color }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div
                                            className="w-4 h-4 rounded-sm"
                                            style={{ backgroundColor: tier.color }}
                                        />
                                        <span className="font-bold text-gray-900">{tier.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => adjustPrice(tier.id, -50)}
                                            className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                                        >
                                            -
                                        </button>
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => handlePriceChange(tier.id, e.target.value)}
                                                className="text-center font-bold pr-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                QAR
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => adjustPrice(tier.id, 50)}
                                            className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Event-Specific Discounts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Card className="bg-white border-gray-200 h-full shadow-sm">
                            <CardHeader>
                                <CardTitle>Event Discounts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {events.map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={() => setSelectedEventId(event.id)}
                                        className={`p-3 rounded cursor-pointer transition-colors ${selectedEventId === event.id
                                            ? 'bg-gold-500 text-black font-bold'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        {selectedEvent ? (
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle>
                                        Discounts for: <span className="text-gold-600">{selectedEvent.title}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Discount Strategy */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedEvent.isEarlyBird
                                                ? 'border-gold-500 bg-gold-500/10'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleEventUpdate({
                                                isEarlyBird: !selectedEvent.isEarlyBird,
                                                isLastMinute: false
                                            })}
                                        >
                                            <div className="font-bold text-gray-900">Early Bird</div>
                                            <p className="text-xs text-gray-500">Discount for early bookings</p>
                                        </div>
                                        <div
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedEvent.isLastMinute
                                                ? 'border-red-500 bg-red-500/10'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleEventUpdate({
                                                isLastMinute: !selectedEvent.isLastMinute,
                                                isEarlyBird: false
                                            })}
                                        >
                                            <div className="font-bold text-gray-900">Last Minute</div>
                                            <p className="text-xs text-gray-500">Urgent discount</p>
                                        </div>
                                    </div>

                                    {/* Discount Percentage */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Discount: {selectedEvent.discountPercentage}%
                                        </label>
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
                                                className="w-20 text-center"
                                            />
                                        </div>
                                    </div>

                                    {/* Preview Prices */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="font-bold text-gray-900 mb-3">Price Preview (with discount)</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {tierPricing.map(tier => (
                                                <div
                                                    key={tier.id}
                                                    className="text-center p-3 rounded-lg bg-gray-50"
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded-full mx-auto mb-1"
                                                        style={{ backgroundColor: tier.color }}
                                                    />
                                                    <div className="text-xs text-gray-500 uppercase">{tier.name}</div>
                                                    <div className="font-bold text-gray-900">
                                                        {getDiscountedPrice(tier.price)}
                                                    </div>
                                                    {(selectedEvent.isEarlyBird || selectedEvent.isLastMinute) && (
                                                        <div className="text-xs text-gray-400 line-through">
                                                            {tier.price}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
                                Select an event to manage discounts
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

