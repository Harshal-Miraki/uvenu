"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/context/StoreContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Ticket, Calendar, Clock } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { events } = useStore();
  const featuredEvents = events.slice(0, 3); // Top 3 events

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1262&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
        />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
            Experience the <span className="text-gold-500">Extraordinary</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
            Qatar's Premier Destination for World-Class Theatre, Music, and Performance Arts.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-charcoal-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Performances</h2>
              <div className="h-1 w-20 bg-gold-500 rounded"></div>
            </div>
            <Link href="/events">
              <Button variant="ghost" className="text-gold-500 hover:text-gold-600">View All Events &rarr;</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden group border-charcoal-500 bg-white shadow-md hover:border-gold-500/50 transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image || '/placeholder-event.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    {event.isEarlyBird && (
                      <span className="bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Early Bird</span>
                    )}
                    {event.isLastMinute && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Selling Fast</span>
                    )}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gold-500" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gold-500" />
                      {event.time}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">From </span>
                      <span className="text-gold-600 font-bold text-lg">{event.basePrice.Standard} QAR</span>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button size="sm" variant="outline">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Highlight */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">World-Class Venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group overflow-hidden rounded-xl aspect-video">
              <img src="https://images.unsplash.com/photo-1518890569493-668df9a00266?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-white">Opera House</h3>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl aspect-video">
              <img src="https://images.unsplash.com/photo-1429514513361-8fa32282fd5f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-white">Katara Amphitheatre</h3>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl aspect-video">
              <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-white">Convention Center</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
