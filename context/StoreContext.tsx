"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Event as EventType, UserRole, CartItem, Booking, SeatCategory, User } from '@/types';
import { storage } from '@/lib/storage';

interface StoreType {
    events: EventType[];
    role: UserRole;
    isLoggedIn: boolean;
    currentUser: User | null;
    cart: CartItem[];
    setRole: (role: UserRole) => void;
    login: (role: UserRole) => void;
    logout: () => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (eventId: string, category?: SeatCategory) => void;
    clearCart: () => void;
    refreshData: () => void;
    checkout: () => void;
}

const StoreContext = createContext<StoreType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<EventType[]>([]);
    const [role, setRoleState] = useState<UserRole>('customer');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUserState] = useState<User | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Initialize Firestore data
        const initData = async () => {
            const { initializeFirestore } = await import('@/lib/storage');
            await initializeFirestore();

            // Load initial events
            const initialEvents = await storage.getEvents();
            setEvents(initialEvents);
        };

        initData();

        // Load auth state (from localStorage)
        const auth = storage.getAuth();
        setRoleState(auth.role);
        setIsLoggedIn(auth.isLoggedIn);

        // Load current user
        const user = storage.getCurrentUser();
        setCurrentUserState(user);

        // Load persisted cart if any
        const savedCart = localStorage.getItem('uvenu_cart');
        if (savedCart) setCart(JSON.parse(savedCart));

        // Listen for auth changes
        const handleAuthChange = (evt: globalThis.Event) => {
            const customEvent = evt as CustomEvent<{ role: UserRole; isLoggedIn: boolean }>;
            setRoleState(customEvent.detail.role);
            setIsLoggedIn(customEvent.detail.isLoggedIn);
        };

        // Listen for user changes
        const handleUserChange = (evt: globalThis.Event) => {
            const customEvent = evt as CustomEvent<User | null>;
            setCurrentUserState(customEvent.detail);
        };

        window.addEventListener('authChanged', handleAuthChange);
        window.addEventListener('userChanged', handleUserChange);

        // Subscribe to real-time events updates
        const unsubscribeEvents = storage.onEventsChange((updatedEvents) => {
            setEvents(updatedEvents);
        });

        return () => {
            window.removeEventListener('authChanged', handleAuthChange);
            window.removeEventListener('userChanged', handleUserChange);
            unsubscribeEvents();
        };
    }, []);

    const refreshData = async () => {
        const updatedEvents = await storage.getEvents();
        setEvents(updatedEvents);
    };

    const updateCart = (newCart: CartItem[]) => {
        setCart(newCart);
        localStorage.setItem('uvenu_cart', JSON.stringify(newCart));
    };

    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        if (isLoggedIn) {
            storage.setAuth(newRole);
        }
    };

    const login = (loginRole: UserRole) => {
        storage.setAuth(loginRole);
        setRoleState(loginRole);
        setIsLoggedIn(true);
    };

    const logout = () => {
        storage.logout();
        setRoleState('customer');
        setIsLoggedIn(false);
    };

    const addToCart = (item: CartItem) => {
        // Check if event exists
        const event = events.find(e => e.id === item.eventId);
        if (!event) return;

        // For seat-based items, just add to cart (seats are unique)
        if (item.seats && item.seats.length > 0) {
            // Filter out any existing seat-based item for same event to replace
            const newCart = cart.filter(c => !(c.eventId === item.eventId && c.seats));
            newCart.push(item);
            updateCart(newCart);
            return;
        }

        // Legacy: Check if already in cart (category-based)
        const existingIndex = cart.findIndex(c => c.eventId === item.eventId && c.category === item.category);
        let newCart = [...cart];

        if (existingIndex > -1 && item.quantity) {
            newCart[existingIndex].quantity = (newCart[existingIndex].quantity || 0) + item.quantity;
        } else {
            newCart.push(item);
        }

        updateCart(newCart);
    };

    const removeFromCart = (eventId: string, category?: SeatCategory) => {
        let newCart: CartItem[];

        if (category) {
            // Legacy: remove by eventId + category
            newCart = cart.filter(item => !(item.eventId === eventId && item.category === category));
        } else {
            // New: remove all items for this event (seat-based)
            newCart = cart.filter(item => item.eventId !== eventId);
        }

        updateCart(newCart);
    };

    const clearCart = () => {
        updateCart([]);
    };

    const checkout = async () => {
        // Calculate total supporting both formats
        const totalAmount = cart.reduce((sum, item) => {
            if (item.seats && item.totalPrice !== undefined) {
                return sum + item.totalPrice;
            } else if (item.pricePerSeat && item.quantity) {
                return sum + (item.pricePerSeat * item.quantity);
            }
            return sum;
        }, 0);

        // Create bookings from cart with user information
        const booking: Booking = {
            id: crypto.randomUUID(),
            customerName: currentUser?.name || "Guest User",
            userId: currentUser?.id,
            userName: currentUser?.name,
            userEmail: currentUser?.email,
            items: cart,
            totalAmount,
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        };

        await storage.saveBooking(booking);
        clearCart();
        await refreshData();
    };

    if (!isClient) return null; // Avoid hydration mismatch

    return (
        <StoreContext.Provider value={{
            events,
            role,
            isLoggedIn,
            currentUser,
            setRole,
            login,
            logout,
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            refreshData,
            checkout
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}


