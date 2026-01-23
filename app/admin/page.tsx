"use client";

import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { Booking } from "@/types";
import { DollarSign, Ticket, Calendar, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const { events } = useStore();
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const loadBookings = async () => {
            const fetchedBookings = await storage.getBookings();
            setBookings(fetchedBookings);
        };
        loadBookings();
    }, []);

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const totalTicketsSold = bookings.reduce((sum, booking) =>
        sum + booking.items.reduce((s, i) => {
            // Handle seat-based items
            if (i.seats && i.seats.length > 0) {
                return s + i.seats.length;
            }
            // Handle legacy quantity-based items
            return s + (i.quantity || 0);
        }, 0),
        0);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white border-charcoal-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                            {/* <DollarSign className="h-4 w-4 text-gold-600" /> */}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} QAR</div>
                            <p className="text-xs text-gray-500">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-charcoal-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Tickets Sold</CardTitle>
                            <Ticket className="h-4 w-4 text-gold-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalTicketsSold}</div>
                            <p className="text-xs text-gray-500">+150 since yesterday</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-charcoal-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Active Events</CardTitle>
                            <Calendar className="h-4 w-4 text-gold-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                            <p className="text-xs text-gray-500">Currently showing</p>
                        </CardContent>
                    </Card>
                    {/* <Card className="bg-white border-charcoal-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-gold-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">4.5%</div>
                            <p className="text-xs text-gray-500">+1.2% this week</p>
                        </CardContent>
                    </Card> */}
                </div>

                <Card className="bg-white border-charcoal-500 shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Booking ID</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Event</th>
                                        <th className="px-6 py-3">Seat Type</th>
                                        <th className="px-6 py-3">Seats Booked</th>
                                        <th className="px-6 py-3">Price/Seat</th>
                                        <th className="px-6 py-3">Total Amount</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings
                                        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
                                        .slice(0, 10)
                                        .map((booking) => {
                                            // Calculate total seats for this booking
                                            const totalSeats = booking.items.reduce((sum, item) => {
                                                if (item.seats && item.seats.length > 0) {
                                                    return sum + item.seats.length;
                                                }
                                                return sum + (item.quantity || 0);
                                            }, 0);

                                            return (
                                                <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono text-xs">{booking.id.slice(0, 8)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {booking.userName || booking.customerName}
                                                        </div>
                                                        {booking.userEmail && (
                                                            <div className="text-xs text-gray-500">{booking.userEmail}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{booking.items[0]?.eventTitle}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {booking.items.map((item, idx) => {
                                                                // Get seat tier/category
                                                                const seatType = item.seats && item.seats.length > 0
                                                                    ? item.seats[0]?.tier || item.category || 'N/A'
                                                                    : item.category || 'N/A';

                                                                return (
                                                                    <div key={idx} className="text-xs">
                                                                        <span className="inline-block px-2 py-0.5 bg-gold-100 text-gold-700 rounded font-medium">
                                                                            {seatType}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {booking.items.map((item, idx) => {
                                                                const seatCount = item.seats && item.seats.length > 0
                                                                    ? item.seats.length
                                                                    : item.quantity || 0;

                                                                return (
                                                                    <div key={idx} className="text-xs font-medium text-gray-900">
                                                                        {seatCount} {seatCount === 1 ? 'seat' : 'seats'}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {booking.items.map((item, idx) => {
                                                                const pricePerSeat = item.seats && item.seats.length > 0 && item.totalPrice
                                                                    ? (item.totalPrice / item.seats.length)
                                                                    : item.pricePerSeat || 0;

                                                                return (
                                                                    <div key={idx} className="text-xs text-gray-600">
                                                                        {pricePerSeat.toFixed(2)} QAR
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gold-600">
                                                        {booking.totalAmount.toFixed(2)} QAR
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        {new Date(booking.bookingDate).toLocaleDateString()}
                                                        <div className="text-gray-400">
                                                            {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                            {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="text-center py-8 text-gray-400">No bookings found yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
