"use client";

import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { storage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { Event } from "@/types";

export default function CreateEventPage() {
    const { refreshData, events } = useStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        venue: "",
        date: "",
        time: "",
        description: "",
        image: "",
        vipPrice: 0,
        premiumPrice: 0,
        standardPrice: 0,
        vipSeats: 0,
        premiumSeats: 0,
        standardSeats: 0,
        tierLayout: 'ascending' as 'ascending' | 'descending'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEvent: Event = {
            id: `evt_${Date.now()}`,
            title: formData.title,
            venue: formData.venue,
            date: new Date(formData.date).toISOString(), // Needs proper parsing if not just YYYY-MM-DD
            time: formData.time,
            description: formData.description,
            image: formData.image || "https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=1000",
            totalSeats: {
                VIP: Number(formData.vipSeats),
                Premium: Number(formData.premiumSeats),
                Standard: Number(formData.standardSeats)
            },
            availableSeats: {
                VIP: Number(formData.vipSeats),
                Premium: Number(formData.premiumSeats),
                Standard: Number(formData.standardSeats)
            },
            basePrice: {
                VIP: Number(formData.vipPrice),
                Premium: Number(formData.premiumPrice),
                Standard: Number(formData.standardPrice)
            },
            tierLayout: formData.tierLayout,
            isEarlyBird: false,
            isLastMinute: false,
            discountPercentage: 0
        };

        const currentEvents = storage.getEvents();
        storage.saveEvents([...currentEvents, newEvent]);
        refreshData();
        router.push('/admin');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Event</h1>

                <Card className="bg-white border-charcoal-500 shadow-sm">
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Event Title</label>
                                    <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Venue</label>
                                    <Input required value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Date</label>
                                    <Input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Time</label>
                                    <Input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <Input required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Image URL</label>
                                <Input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tier Layout</label>
                                <select
                                    value={formData.tierLayout}
                                    onChange={e => setFormData({ ...formData, tierLayout: e.target.value as 'ascending' | 'descending' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white text-gray-900"
                                >
                                    <option value="ascending">Premium at Front (Platinum: Rows A-B)</option>
                                    <option value="descending">Premium at Back (Platinum: Rows K-L)</option>
                                </select>
                                <p className="text-xs text-gray-500">Choose where premium seats (Platinum/Gold) are located</p>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Seating & Pricing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-gold-600 font-bold">VIP</h4>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Seats</label>
                                            <Input required type="number" value={formData.vipSeats} onChange={e => setFormData({ ...formData, vipSeats: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Price (QAR)</label>
                                            <Input required type="number" value={formData.vipPrice} onChange={e => setFormData({ ...formData, vipPrice: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-gray-700 font-bold">Premium</h4>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Seats</label>
                                            <Input required type="number" value={formData.premiumSeats} onChange={e => setFormData({ ...formData, premiumSeats: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Price (QAR)</label>
                                            <Input required type="number" value={formData.premiumPrice} onChange={e => setFormData({ ...formData, premiumPrice: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-gray-500 font-bold">Standard</h4>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Seats</label>
                                            <Input required type="number" value={formData.standardSeats} onChange={e => setFormData({ ...formData, standardSeats: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Price (QAR)</label>
                                            <Input required type="number" value={formData.standardPrice} onChange={e => setFormData({ ...formData, standardPrice: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" size="lg">Create Event</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
