"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShoppingCart, User, LogOut, LogIn, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { role, isLoggedIn, logout, cart, currentUser } = useStore();
    const { language, setLanguage, t } = useLanguage();

    // Calculate cart items - handle both formats
    const totalItems = cart.reduce((acc, item) => {
        if (item.seats && item.seats.length > 0) {
            return acc + item.seats.length;
        }
        return acc + (item.quantity || 0);
    }, 0);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center">
                        <img src="/logo.svg" alt="UVENU" className="h-8 w-auto" />
                    </Link>

                    {/* Customer Navigation */}
                    {(!isLoggedIn || role === 'customer') && (
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/events"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/events" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                {t('nav.events')}
                            </Link>
                        </div>
                    )}

                    {/* Admin Navigation */}
                    {isLoggedIn && role === 'admin' && (
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/admin"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                {t('nav.dashboard')}
                            </Link>
                            <Link
                                href="/admin/create-event"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/create-event" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                {t('nav.createEvent')}
                            </Link>
                            <Link
                                href="/admin/manage-pricing"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/manage-pricing" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                {t('nav.pricing')}
                            </Link>
                            <Link
                                href="/admin/manage-layout"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/manage-layout" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                {t('nav.layout')}
                            </Link>
                            <Link
                                href="/admin/bookings"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/bookings" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                {t('nav.bookings')}
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Toggle */}
                    <div className="relative group">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                        >
                            <Globe className="h-4 w-4" />
                            <span className="text-xs font-medium">{language.toUpperCase()}</span>
                        </Button>
                        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <button
                                onClick={() => setLanguage('en')}
                                className={cn(
                                    "block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 whitespace-nowrap",
                                    language === 'en' ? "bg-gold-50 text-gold-600 font-medium" : "text-gray-700"
                                )}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLanguage('ar')}
                                className={cn(
                                    "block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 whitespace-nowrap",
                                    language === 'ar' ? "bg-gold-50 text-gold-600 font-medium" : "text-gray-700"
                                )}
                            >
                                العربية
                            </button>
                        </div>
                    </div>

                    {/* Auth State */}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-600">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {role === 'admin' ? t('nav.admin') : (currentUser?.name || t('nav.customer'))}
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                {t('nav.logout')}
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm">
                                <LogIn className="h-4 w-4 mr-2" />
                                {t('nav.login')}
                            </Button>
                        </Link>
                    )}

                    {/* Cart - Only for customers */}
                    {(!isLoggedIn || role === 'customer') && (
                        <Link href="/checkout">
                            <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5 text-gray-700" />
                                {totalItems > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                                        {totalItems}
                                    </Badge>
                                )}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

