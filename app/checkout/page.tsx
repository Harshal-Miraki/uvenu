"use client";

import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Trash2, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getTierPricing, DEFAULT_TIER_CONFIG } from "@/components/SeatMap";
import { TierConfig } from "@/types";

export default function CheckoutPage() {
    const { cart, removeFromCart, checkout } = useStore();
    const { t } = useLanguage();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [tierConfig, setTierConfig] = useState<TierConfig[]>(DEFAULT_TIER_CONFIG);

    // Load tier pricing from storage on mount
    useEffect(() => {
        const loadPricing = async () => {
            const pricing = await getTierPricing();
            setTierConfig(pricing);
        };
        loadPricing();
    }, []);

    // Calculate subtotal - handle both legacy and new format
    const subtotal = cart.reduce((sum, item) => {
        if (item.seats && item.totalPrice !== undefined) {
            // New seat-based format
            return sum + item.totalPrice;
        } else if (item.pricePerSeat && item.quantity) {
            // Legacy format
            return sum + (item.pricePerSeat * item.quantity);
        }
        return sum;
    }, 0);

    const serviceFee = subtotal * 0.05; // 5% mock fee
    const total = subtotal;

    const handleCheckout = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        checkout();
        setIsProcessing(false);
        router.push('/success');
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Card className="max-w-md w-full text-center bg-white border-charcoal-500 p-8 shadow-sm">
                    <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout.emptyCart')}</h2>
                    <p className="text-gray-500 mb-6">{t('checkout.emptyCartDesc')}</p>
                    <Link href="/events">
                        <Button>{t('home.browseEvents')}</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.title')}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="bg-white border-charcoal-500 shadow-sm">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.orderSummary')}</h2>
                                <div className="space-y-4">
                                    {cart.map((item, idx) => {
                                        // Handle seat-based items
                                        if (item.seats && item.seats.length > 0) {
                                            return (
                                                <div key={`${item.eventId}-seats-${idx}`} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{item.eventTitle}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(item.eventDate).toLocaleDateString()} • {item.seats.length} {t('checkout.seats')}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className="font-bold text-gray-900">{item.totalPrice} {t('common.qar')}</span>
                                                            <button
                                                                onClick={() => removeFromCart(item.eventId)}
                                                                className="text-xs text-red-500 hover:text-red-700 flex items-center"
                                                            >
                                                                <Trash2 className="w-3 h-3 mr-1" /> {t('checkout.removeAll')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* Show individual seats */}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {item.seats.map(seat => {
                                                            const tier = tierConfig.find(t => t.id === seat.tier);
                                                            return (
                                                                <span
                                                                    key={seat.id}
                                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full"
                                                                >
                                                                    <span
                                                                        className="w-2 h-2 rounded-full"
                                                                        style={{ backgroundColor: tier?.color }}
                                                                    />
                                                                    Row {seat.row}, Seat {seat.number}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Legacy format
                                        return (
                                            <div key={`${item.eventId}-${item.category}`} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{item.eventTitle}</h3>
                                                    <p className="text-sm text-gray-500">{new Date(item.eventDate).toLocaleDateString()} • {item.category}</p>
                                                    <div className="text-sm text-gold-600 mt-1">{item.quantity} x {item.pricePerSeat} {t('common.qar')}</div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="font-bold text-gray-900">{(item.quantity || 0) * (item.pricePerSeat || 0)} {t('common.qar')}</span>
                                                    <button
                                                        onClick={() => removeFromCart(item.eventId, item.category)}
                                                        className="text-xs text-red-500 hover:text-red-700 flex items-center"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" /> {t('checkout.remove')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-charcoal-500 shadow-sm">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.paymentMethod')}</h2>
                                <div className="p-4 rounded border border-gold-500/30 bg-gold-500/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-6 h-6 text-gold-600" />
                                        <div>
                                            <div className="text-gray-900 font-medium">{t('checkout.mockPayment')}</div>
                                            <div className="text-xs text-gray-500">{t('checkout.mockPaymentDesc')}</div>
                                        </div>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border-2 border-gold-500 bg-gold-500"></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-1">
                        <Card className="bg-white border-charcoal-500 sticky top-24 shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-500">
                                        <span>{t('checkout.subtotal')}</span>
                                        <span>{subtotal.toFixed(2)} {t('common.qar')}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
                                        <span className="text-gray-900 font-bold">{t('checkout.total')}</span>
                                        <span className="text-2xl font-bold text-gold-600">{total.toFixed(2)} <span className="text-sm font-normal text-gray-500">{t('common.qar')}</span></span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-lg font-bold"
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? t('checkout.processing') : t('checkout.completePayment')}
                                </Button>

                                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {t('checkout.secureTransaction')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

