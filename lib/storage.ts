import { Event, Booking, PricingRule, SeatCategory, TierConfig, SeatTier, UserRole } from "@/types";

const EVENTS_KEY = "uvenu_events";
const BOOKINGS_KEY = "uvenu_bookings";
const PRICING_KEY = "uvenu_pricing";
const TIER_PRICING_KEY = "uvenu_tier_pricing";
const AUTH_KEY = "uvenu_auth";

// Default tier pricing configuration
const DEFAULT_TIER_PRICING: TierConfig[] = [
    { id: 'platinum', name: 'Platinum', price: 800, color: '#EF4444' },  // Red
    { id: 'gold', name: 'Gold', price: 750, color: '#A855F7' },         // Purple
    { id: 'silver', name: 'Silver', price: 615, color: '#3B82F6' },     // Blue
    { id: 'bronze', name: 'Bronze', price: 525, color: '#06B6D4' },     // Cyan
];

const INITIAL_EVENTS: Event[] = [
  {
    id: "evt_1",
    title: "The Phantom of the Opera",
    date: "2026-03-15T19:00:00Z",
    time: "19:00",
    venue: "Opera House, Doha",
    description: "Experience the classic musical in a breathtaking performance.",
    image: "https://images.unsplash.com/photo-1429514513361-8fa32282fd5f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    totalSeats: { VIP: 20, Premium: 50, Standard: 100 },
    availableSeats: { VIP: 18, Premium: 45, Standard: 90 },
    basePrice: { VIP: 500, Premium: 300, Standard: 150 },
    tierLayout: 'ascending',
    isEarlyBird: true,
    isLastMinute: false,
    discountPercentage: 10,
  },
  {
    id: "evt_2",
    title: "Swan Lake Ballet",
    date: "2026-04-10T20:00:00Z",
    time: "20:00",
    venue: "Katara Amphitheatre",
    description: "A mesmerizing ballet performance by the Royal Ballet.",
    image: "https://images.unsplash.com/photo-1518890569493-668df9a00266?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    totalSeats: { VIP: 30, Premium: 60, Standard: 150 },
    availableSeats: { VIP: 5, Premium: 20, Standard: 100 },
    basePrice: { VIP: 600, Premium: 400, Standard: 200 },
    tierLayout: 'descending',
    isEarlyBird: false,
    isLastMinute: true,
    discountPercentage: 15,
  },
  {
    id: "evt_3",
    title: "Jazz Night Live",
    date: "2026-05-20T21:00:00Z",
    time: "21:00",
    venue: "Qatar National Convention Centre",
    description: "An unforgettable evening of smooth jazz with world-class musicians.",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1170&auto=format&fit=crop",
    totalSeats: { VIP: 25, Premium: 75, Standard: 200 },
    availableSeats: { VIP: 20, Premium: 60, Standard: 180 },
    basePrice: { VIP: 450, Premium: 280, Standard: 120 },
    tierLayout: 'ascending',
    isEarlyBird: true,
    isLastMinute: false,
    discountPercentage: 12,
  },
  {
    id: "evt_4",
    title: "Electronic Music Festival",
    date: "2026-06-05T22:00:00Z",
    time: "22:00",
    venue: "Lusail Stadium",
    description: "The biggest electronic music festival featuring top international DJs.",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1170&auto=format&fit=crop",
    totalSeats: { VIP: 100, Premium: 500, Standard: 2000 },
    availableSeats: { VIP: 80, Premium: 400, Standard: 1800 },
    basePrice: { VIP: 800, Premium: 500, Standard: 250 },
    tierLayout: 'ascending',
    isEarlyBird: false,
    isLastMinute: false,
    discountPercentage: 0,
  }
];

export const storage = {
  getEvents: (): Event[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(EVENTS_KEY);
    if (!saved) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
    }
    return JSON.parse(saved);
  },
  
  saveEvents: (events: Event[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  getBookings: (): Booking[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(BOOKINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  saveBooking: (booking: Booking) => {
    if (typeof window === "undefined") return;
    const bookings = storage.getBookings();
    bookings.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    // Update seats for legacy bookings
    const events = storage.getEvents();
    const eventIndex = events.findIndex(e => e.id === booking.items[0]?.eventId);
    if (eventIndex !== -1 && booking.items[0]?.category) {
        const event = events[eventIndex];
        booking.items.forEach(item => {
            if (item.category && item.quantity) {
                event.availableSeats[item.category] -= item.quantity;
            }
        });
        events[eventIndex] = event;
        storage.saveEvents(events);
    }
  },

  // Tier pricing storage
  getTierPricing: (): TierConfig[] => {
    if (typeof window === "undefined") return DEFAULT_TIER_PRICING;
    const saved = localStorage.getItem(TIER_PRICING_KEY);
    if (!saved) {
      localStorage.setItem(TIER_PRICING_KEY, JSON.stringify(DEFAULT_TIER_PRICING));
      return DEFAULT_TIER_PRICING;
    }
    return JSON.parse(saved);
  },

  saveTierPricing: (pricing: TierConfig[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TIER_PRICING_KEY, JSON.stringify(pricing));
    // Dispatch custom event for same-page components to listen
    window.dispatchEvent(new CustomEvent('tierPricingChanged', { detail: pricing }));
  },

  updateTierPrice: (tierId: SeatTier, newPrice: number) => {
    const pricing = storage.getTierPricing();
    const tierIndex = pricing.findIndex(t => t.id === tierId);
    if (tierIndex !== -1) {
      pricing[tierIndex].price = newPrice;
      storage.saveTierPricing(pricing);
    }
    return pricing;
  },

  // Auth storage
  getAuth: (): { role: UserRole; isLoggedIn: boolean } => {
    if (typeof window === "undefined") return { role: 'customer', isLoggedIn: false };
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) return { role: 'customer', isLoggedIn: false };
    return JSON.parse(saved);
  },

  setAuth: (role: UserRole) => {
    if (typeof window === "undefined") return;
    const auth = { role, isLoggedIn: true };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    // Dispatch event for cross-component sync
    window.dispatchEvent(new CustomEvent('authChanged', { detail: auth }));
  },

  logout: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { role: 'customer', isLoggedIn: false } }));
  },
  
  resetData: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(BOOKINGS_KEY);
    localStorage.removeItem(PRICING_KEY);
    localStorage.removeItem(TIER_PRICING_KEY);
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  }
};

