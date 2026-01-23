"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShoppingCart, User, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { role, isLoggedIn, logout, cart, currentUser } = useStore();

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
                                Events
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
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/create-event"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/create-event" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                Create Event
                            </Link>
                            <Link
                                href="/admin/manage-pricing"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/manage-pricing" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/admin/manage-layout"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/manage-layout" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                Layout
                            </Link>
                            <Link
                                href="/admin/bookings"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-gold-600",
                                    pathname === "/admin/bookings" ? "text-gold-600" : "text-gray-600"
                                )}
                            >
                                Bookings
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Auth State */}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-600">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {role === 'admin' ? 'Admin' : (currentUser?.name || 'Customer')}
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm">
                                <LogIn className="h-4 w-4 mr-2" />
                                Login
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

