import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  addDoc, 
  updateDoc, 
  query,
  onSnapshot,
  writeBatch,
  where
} from "firebase/firestore";
import { db } from "./firebase";
import { Event, Booking, TierConfig, SeatTier, UserRole, User } from "@/types";

// Collection names
const EVENTS_COLLECTION = "events";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";
const CONFIG_COLLECTION = "config";
const TIER_PRICING_DOC = "tierPricing";
const AUTH_KEY = "uvenu_auth"; // Keep auth in localStorage for simplicity
const CURRENT_USER_KEY = "uvenu_current_user"; // Store current user data

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

// Initialize Firestore with default data
export const initializeFirestore = async () => {
  try {
    // Check if events exist
    const eventsSnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    if (eventsSnapshot.empty) {
      // Add initial events
      const batch = writeBatch(db);
      INITIAL_EVENTS.forEach(event => {
        const eventRef = doc(db, EVENTS_COLLECTION, event.id);
        batch.set(eventRef, event);
      });
      await batch.commit();
      console.log("Initialized events in Firestore");
    }

    // Check if tier pricing exists
    const tierPricingRef = doc(db, CONFIG_COLLECTION, TIER_PRICING_DOC);
    const tierPricingSnap = await getDoc(tierPricingRef);
    if (!tierPricingSnap.exists()) {
      await setDoc(tierPricingRef, { tiers: DEFAULT_TIER_PRICING });
      console.log("Initialized tier pricing in Firestore");
    }
  } catch (error) {
    console.error("Error initializing Firestore:", error);
  }
};

export const storage = {
  // Events
  getEvents: async (): Promise<Event[]> => {
    try {
      const eventsSnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
      const events: Event[] = [];
      eventsSnapshot.forEach(doc => {
        events.push({ ...doc.data() as Event, id: doc.id });
      });
      return events;
    } catch (error) {
      console.error("Error getting events:", error);
      return [];
    }
  },

  saveEvents: async (events: Event[]) => {
    try {
      const batch = writeBatch(db);
      events.forEach(event => {
        const eventRef = doc(db, EVENTS_COLLECTION, event.id);
        batch.set(eventRef, event);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error saving events:", error);
    }
  },

  saveEvent: async (event: Event) => {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, event.id);
      await setDoc(eventRef, event);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  },

  // Bookings
  getBookings: async (): Promise<Booking[]> => {
    try {
      const bookingsSnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
      const bookings: Booking[] = [];
      bookingsSnapshot.forEach(doc => {
        bookings.push({ ...doc.data() as Booking, id: doc.id });
      });
      return bookings;
    } catch (error) {
      console.error("Error getting bookings:", error);
      return [];
    }
  },

  saveBooking: async (booking: Booking) => {
    try {
      // Add booking to Firestore
      await addDoc(collection(db, BOOKINGS_COLLECTION), booking);

      // Update available seats for the event
      const eventId = booking.items[0]?.eventId;
      if (eventId) {
        const eventRef = doc(db, EVENTS_COLLECTION, eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists()) {
          const event = eventSnap.data() as Event;
          
          // Update available seats based on booking
          booking.items.forEach(item => {
            if (item.category && item.quantity) {
              event.availableSeats[item.category] -= item.quantity;
            }
          });

          await updateDoc(eventRef, { availableSeats: event.availableSeats });
        }
      }
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  },

  // Tier pricing
  getTierPricing: async (): Promise<TierConfig[]> => {
    try {
      const tierPricingRef = doc(db, CONFIG_COLLECTION, TIER_PRICING_DOC);
      const tierPricingSnap = await getDoc(tierPricingRef);
      
      if (tierPricingSnap.exists()) {
        return tierPricingSnap.data().tiers as TierConfig[];
      }
      
      // Initialize if doesn't exist
      await setDoc(tierPricingRef, { tiers: DEFAULT_TIER_PRICING });
      return DEFAULT_TIER_PRICING;
    } catch (error) {
      console.error("Error getting tier pricing:", error);
      return DEFAULT_TIER_PRICING;
    }
  },

  saveTierPricing: async (pricing: TierConfig[]) => {
    try {
      const tierPricingRef = doc(db, CONFIG_COLLECTION, TIER_PRICING_DOC);
      await setDoc(tierPricingRef, { tiers: pricing });
      
      // Dispatch custom event for same-page components to listen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tierPricingChanged', { detail: pricing }));
      }
    } catch (error) {
      console.error("Error saving tier pricing:", error);
    }
  },

  updateTierPrice: async (tierId: SeatTier, newPrice: number): Promise<TierConfig[]> => {
    try {
      const pricing = await storage.getTierPricing();
      const tierIndex = pricing.findIndex(t => t.id === tierId);
      
      if (tierIndex !== -1) {
        pricing[tierIndex].price = newPrice;
        await storage.saveTierPricing(pricing);
      }
      
      return pricing;
    } catch (error) {
      console.error("Error updating tier price:", error);
      return [];
    }
  },

  // Real-time listeners
  onEventsChange: (callback: (events: Event[]) => void) => {
    const unsubscribe = onSnapshot(
      collection(db, EVENTS_COLLECTION),
      (snapshot) => {
        const events: Event[] = [];
        snapshot.forEach(doc => {
          events.push({ ...doc.data() as Event, id: doc.id });
        });
        callback(events);
      },
      (error) => {
        console.error("Error listening to events:", error);
      }
    );
    return unsubscribe;
  },

  onTierPricingChange: (callback: (pricing: TierConfig[]) => void) => {
    const tierPricingRef = doc(db, CONFIG_COLLECTION, TIER_PRICING_DOC);
    const unsubscribe = onSnapshot(
      tierPricingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data().tiers as TierConfig[]);
        }
      },
      (error) => {
        console.error("Error listening to tier pricing:", error);
      }
    );
    return unsubscribe;
  },

  // Auth storage (keep in localStorage for simplicity)
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
    window.dispatchEvent(new CustomEvent('authChanged', { detail: auth }));
  },

  // User management
  registerUser: async (user: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      // Check if email already exists
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { success: false, error: "Email already registered" };
      }

      // Create new user
      const newUser: User = {
        ...user,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, USERS_COLLECTION, newUser.id), newUser);
      return { success: true, user: newUser };
    } catch (error) {
      console.error("Error registering user:", error);
      return { success: false, error: "Registration failed" };
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const userDoc = querySnapshot.docs[0];
      return { ...userDoc.data() as User, id: userDoc.id };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  validateUser: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      if (user.password !== password) {
        return { success: false, error: "Invalid email or password" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("Error validating user:", error);
      return { success: false, error: "Login failed" };
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  },

  setCurrentUser: (user: User) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('userChanged', { detail: user }));
  },

  clearCurrentUser: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent('userChanged', { detail: null }));
  },

  logout: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_KEY);
    storage.clearCurrentUser();
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { role: 'customer', isLoggedIn: false } }));
  },

  resetData: async () => {
    try {
      // Delete all events
      const eventsSnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
      const batch = writeBatch(db);
      eventsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete all bookings
      const bookingsSnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
      bookingsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Clear auth
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_KEY);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error resetting data:", error);
    }
  }
};
