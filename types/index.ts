export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export type SeatCategory = 'VIP' | 'Premium' | 'Standard';

// New: 4-tier pricing system for seat map
export type SeatTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'premium' | 'normal';

// Tier layout configuration
export type TierLayout = 'ascending' | 'descending';

// Tier configuration with price and color
export interface TierConfig {
    id: SeatTier;
    name: string;
    price: number;
    color: string;  // Tailwind color class or hex
}

// Individual seat representation
export interface Seat {
    id: string;           // e.g., "A-1", "B-15"
    row: string;          // e.g., "A", "B", "C"
    number: number;       // Seat number in row
    section: 'left' | 'center' | 'right';
    tier: SeatTier;       // Price tier
    status: 'available' | 'selected' | 'sold';
}

export interface PricingRule {
    categoryId: SeatCategory;
    price: number;
}

export interface Event {
    id: string;
    title: string;
    date: string; // ISO string
    time: string;
    venue: string;
    description?: string;
    image?: string; // URL or placeholder path

    // Legacy seat configuration (kept for backwards compatibility)
    totalSeats: Record<SeatCategory, number>;
    availableSeats: Record<SeatCategory, number>;

    // Legacy pricing
    basePrice: Record<SeatCategory, number>;

    // New: Seat map data
    seatMap?: Seat[];           // Detailed seat data
    tierPricing?: TierConfig[]; // Tier configuration
    tierLayout?: TierLayout;    // 'ascending' = premium front, 'descending' = premium back

    // Dynamic Pricing Factors (simplified)
    isEarlyBird: boolean;
    isLastMinute: boolean;
    discountPercentage: number;
}

// Updated CartItem to support individual seats
export interface CartItem {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    // Legacy fields (for backwards compatibility)
    category?: SeatCategory;
    quantity?: number;
    pricePerSeat?: number;
    // New: Individual seat selection
    seats?: Seat[];
    totalPrice?: number;
}

export interface Booking {
    id: string;
    customerName: string; // For MVP, just a mock
    userId?: string; // User ID who made the booking
    userName?: string; // User name for display
    userEmail?: string; // User email
    items: CartItem[];
    totalAmount: number;
    bookingDate: string;
    status: 'confirmed' | 'cancelled';
}

