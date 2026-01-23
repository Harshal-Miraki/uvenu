"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function EventsPage() {
    const { events } = useStore();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('events.upcomingEvents')}</h1>
                        <p className="text-gray-500">{t('events.subtitle')}</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder={t('events.searchPlaceholder')}
                            className="pl-10 bg-white border-charcoal-500 text-gray-900 focus:ring-gold-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">{t('events.noEventsFound')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                            <Card key={event.id} className="overflow-hidden group border-charcoal-500 bg-white hover:border-gold-500/50 transition-all duration-300 flex flex-col h-full shadow-sm">
                                <div className="relative h-64 overflow-hidden shrink-0">
                                    <img
                                        src={event.image || '/placeholder-event.jpg'}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                        {event.isEarlyBird && (
                                            <Badge className="bg-gold-500 text-black font-bold">{t('events.earlyBird')}</Badge>
                                        )}
                                        {event.isLastMinute && (
                                            <Badge className="bg-red-500 text-white font-bold">{t('events.lastMinute')}</Badge>
                                        )}
                                    </div>
                                </div>
                                <CardContent className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-gold-500" />
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gold-500" />
                                            {event.time}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">{event.title}</h3>

                                    <div className="flex items-center gap-2 text-gray-600 mb-4 text-sm">
                                        <MapPin className="w-4 h-4 text-gold-500" />
                                        {event.venue}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-grow">{event.description}</p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-charcoal-500">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">{t('events.startingFrom')}</span>
                                            <span className="text-gold-600 font-bold text-xl">{Math.min(...Object.values(event.basePrice))} {t('common.qar')}</span>
                                        </div>
                                        <Link href={`/events/${event.id}`}>
                                            <Button className="w-full md:w-auto">
                                                {t('events.bookTickets')}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
