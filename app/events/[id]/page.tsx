"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin, ChevronLeft, ShoppingCart, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Seat, TierConfig } from "@/types";
import { cn } from "@/lib/utils";
import SeatMap, { generateTheaterSeats, getTierPricing, DEFAULT_TIER_CONFIG } from "@/components/SeatMap";

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { events, addToCart } = useStore();
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [tierConfig, setTierConfig] = useState<TierConfig[]>(DEFAULT_TIER_CONFIG);

    const event = events.find(e => e.id === id);

    // Load tier pricing from storage and listen for changes
    useEffect(() => {
        // Initial load
        setTierConfig(getTierPricing());

        // Listen for localStorage changes from other tabs/pages
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'uvenu_tier_pricing') {
                setTierConfig(getTierPricing());
            }
        };

        // Listen for custom event from same-page updates (admin panel)
        const handlePricingChanged = (e: Event) => {
            const customEvent = e as CustomEvent<TierConfig[]>;
            setTierConfig(customEvent.detail);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('tierPricingChanged', handlePricingChanged);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tierPricingChanged', handlePricingChanged);
        };
    }, []);

    // Generate or use existing seat map
    const seats = useMemo(() => {
        if (event?.seatMap) return event.seatMap;
        return generateTheaterSeats(event?.tierLayout || 'ascending');
    }, [event]);

    const discountPercentage = (event?.isEarlyBird || event?.isLastMinute) ? event.discountPercentage : 0;

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
                    <Button onClick={() => router.push('/events')}>Back to Events</Button>
                </div>
            </div>
        );
    }

    // Calculate price for a seat with discount
    const getSeatPrice = (seat: Seat): number => {
        const tier = tierConfig.find(t => t.id === seat.tier);
        if (!tier) return 0;
        const price = discountPercentage > 0
            ? Math.round(tier.price * (1 - discountPercentage / 100))
            : tier.price;
        return price;
    };

    // Handle seat selection toggle
    const handleSeatSelect = (seat: Seat) => {
        if (seat.status === 'sold') return;

        setSelectedSeats(prev => {
            const isAlreadySelected = prev.some(s => s.id === seat.id);
            if (isAlreadySelected) {
                return prev.filter(s => s.id !== seat.id);
            } else {
                return [...prev, seat];
            }
        });
    };

    // Remove a specific seat from selection
    const removeSeat = (seatId: string) => {
        setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    };

    // Calculate total
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

    const handleAddToCart = () => {
        if (selectedSeats.length === 0) return;

        // Mark selected seats with their prices
        const seatsWithPrices = selectedSeats.map(seat => ({
            ...seat,
            status: 'selected' as const
        }));

        addToCart({
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            seats: seatsWithPrices,
            totalPrice: totalPrice
        });

        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Banner */}
            <div className="relative h-[300px]">
                <div className="absolute inset-0">
                    <img src={event.image || '/placeholder-event.jpg'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                </div>
                <div className="absolute top-6 left-4 container mx-auto px-4 z-10">
                    <Button variant="ghost" className="text-white hover:text-gold-500 pl-0" onClick={() => router.back()}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Events
                    </Button>
                </div>
                <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 pb-8 z-10">
                    <div className="flex gap-2 mb-3">
                        {event.isEarlyBird && <Badge className="bg-gold-500 text-black">EARLY BIRD - {event.discountPercentage}% OFF</Badge>}
                        {event.isLastMinute && <Badge className="bg-red-500 text-white">LAST MINUTE - {event.discountPercentage}% OFF</Badge>}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{event.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gold-500" />
                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold-500" />
                            {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gold-500" />
                            {event.venue}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Seat Map - Takes more space */}
                    <div className="xl:col-span-3">
                        <Card className="bg-white border-gray-200 shadow-sm">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Select Your Seats</h2>
                                <SeatMap
                                    seats={seats}
                                    tierConfig={tierConfig}
                                    onSeatSelect={handleSeatSelect}
                                    selectedSeats={selectedSeats}
                                    discountPercentage={discountPercentage}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selection Summary - Sidebar */}
                    <div className="xl:col-span-1">
                        <Card className="bg-white border-gray-200 sticky top-24 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Selection</h3>

                                {selectedSeats.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">Click on seats to select them</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Selected seats list */}
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {selectedSeats.map(seat => {
                                                const tier = tierConfig.find(t => t.id === seat.tier);
                                                const price = getSeatPrice(seat);

                                                return (
                                                    <div
                                                        key={seat.id}
                                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-sm"
                                                                style={{ backgroundColor: tier?.color }}
                                                            />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                Row {seat.row}, Seat {seat.number}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gold-600">{price} QAR</span>
                                                            <button
                                                                onClick={() => removeSeat(seat.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Summary */}
                                        <div className="border-t border-gray-200 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Seats Selected</span>
                                                <span className="font-medium">{selectedSeats.length}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-gray-600">Total</span>
                                                <span className="text-2xl font-bold text-gold-600">
                                                    {totalPrice} <span className="text-sm text-gray-500 font-normal">QAR</span>
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full h-12 text-lg font-bold"
                                            onClick={handleAddToCart}
                                        >
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Event Description */}
                        <Card className="bg-white border-gray-200 shadow-sm mt-4">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

