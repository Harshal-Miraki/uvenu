"use client";

import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { Booking, Event } from "@/types";
import { Users, Ticket, Calendar, Mail, User } from "lucide-react";

export default function EventBookingsPage() {
    const { events } = useStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        const loadBookings = async () => {
            const fetchedBookings = await storage.getBookings();
            setBookings(fetchedBookings);
        };
        loadBookings();
    }, []);

    // Group bookings by event
    const bookingsByEvent = bookings.reduce((acc, booking) => {
        booking.items.forEach(item => {
            if (!acc[item.eventId]) {
                acc[item.eventId] = [];
            }
            acc[item.eventId].push(booking);
        });
        return acc;
    }, {} as Record<string, Booking[]>);

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const selectedBookings = selectedEventId ? bookingsByEvent[selectedEventId] || [] : [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Bookings</h1>
                <p className="text-gray-600 mb-8">View all bookings for each event</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Events List */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Events</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {events.map(event => {
                                        const eventBookings = bookingsByEvent[event.id] || [];
                                        const totalBookings = eventBookings.length;
                                        const totalTickets = eventBookings.reduce((sum, booking) => {
                                            const eventItems = booking.items.filter(item => item.eventId === event.id);
                                            return sum + eventItems.reduce((s, item) => {
                                                if (item.seats && item.seats.length > 0) {
                                                    return s + item.seats.length;
                                                }
                                                return s + (item.quantity || 0);
                                            }, 0);
                                        }, 0);

                                        return (
                                            <button
                                                key={event.id}
                                                onClick={() => setSelectedEventId(event.id)}
                                                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedEventId === event.id ? 'bg-gold-50 border-l-4 border-gold-500' : ''
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </p>
                                                        <div className="flex flex-col gap-1.5 text-xs">
                                                            <span className="flex items-center gap-1 text-gray-600">
                                                                <Users className="w-3 h-3" />
                                                                <span className="font-medium">{totalBookings}</span> {totalBookings === 1 ? 'booking' : 'bookings'}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-gold-600">
                                                                <Ticket className="w-3 h-3" />
                                                                <span className="font-medium">{totalTickets}</span> {totalTickets === 1 ? 'seat sold' : 'seats sold'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Details */}
                    <div className="lg:col-span-2">
                        {selectedEvent ? (
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">{selectedEvent.title} - Bookings</CardTitle>
                                    <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4" />
                                            <span className="font-medium">{selectedBookings.length}</span> {selectedBookings.length === 1 ? 'booking' : 'bookings'}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-gold-600">
                                            <Ticket className="w-4 h-4" />
                                            <span className="font-medium">
                                                {selectedBookings.reduce((sum, booking) => {
                                                    const eventItems = booking.items.filter(item => item.eventId === selectedEventId);
                                                    return sum + eventItems.reduce((s, item) => {
                                                        if (item.seats && item.seats.length > 0) {
                                                            return s + item.seats.length;
                                                        }
                                                        return s + (item.quantity || 0);
                                                    }, 0);
                                                }, 0)}
                                            </span> seats sold
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {selectedBookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedBookings.map((booking, index) => {
                                                const eventItems = booking.items.filter(item => item.eventId === selectedEventId);
                                                const ticketCount = eventItems.reduce((sum, item) => {
                                                    if (item.seats && item.seats.length > 0) {
                                                        return sum + item.seats.length;
                                                    }
                                                    return sum + (item.quantity || 0);
                                                }, 0);

                                                return (
                                                    <Card key={booking.id} className="border border-gray-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <User className="w-4 h-4 text-gold-600" />
                                                                        <span className="font-semibold text-gray-900">
                                                                            {booking.userName || booking.customerName}
                                                                        </span>
                                                                    </div>
                                                                    {booking.userEmail && (
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                            <Mail className="w-3 h-3" />
                                                                            {booking.userEmail}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {ticketCount} {ticketCount === 1 ? 'Ticket' : 'Tickets'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {booking.totalAmount.toFixed(2)} QAR
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="border-t border-gray-100 pt-3 mt-3">
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Booked on {new Date(booking.bookingDate).toLocaleString()}
                                                                </div>

                                                                {/* Seat Details */}
                                                                {eventItems.map((item, idx) => (
                                                                    <div key={idx} className="mt-2">
                                                                        {item.seats && item.seats.length > 0 ? (
                                                                            <div className="text-xs text-gray-600">
                                                                                <span className="font-medium">Seats: </span>
                                                                                {item.seats.map(seat => seat.id).join(', ')}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-xs text-gray-600">
                                                                                <span className="font-medium">{item.category}: </span>
                                                                                {item.quantity} {item.quantity === 1 ? 'ticket' : 'tickets'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No bookings for this event yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardContent className="p-12 text-center text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Select an event to view bookings</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
