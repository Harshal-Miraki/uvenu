import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { VenueLayout } from "@/types/layout";

const LAYOUTS_COLLECTION = "venueLayouts";

export const layoutStorage = {
  getLayouts: async (): Promise<VenueLayout[]> => {
    try {
      const snapshot = await getDocs(collection(db, LAYOUTS_COLLECTION));
      const layouts: VenueLayout[] = [];
      snapshot.forEach((doc) => {
        layouts.push({ ...doc.data() as VenueLayout, id: doc.id });
      });
      return layouts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error("Error getting layouts:", error);
      return [];
    }
  },

  getLayout: async (id: string): Promise<VenueLayout | null> => {
    try {
      const docRef = doc(db, LAYOUTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data() as VenueLayout, id: docSnap.id };
      }
      return null;
    } catch (error) {
      console.error("Error getting layout:", error);
      return null;
    }
  },

  saveLayout: async (layout: VenueLayout): Promise<void> => {
    try {
      const layoutRef = doc(db, LAYOUTS_COLLECTION, layout.id);
      await setDoc(layoutRef, {
        ...layout,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving layout:", error);
      throw error;
    }
  },

  deleteLayout: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, LAYOUTS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting layout:", error);
      throw error;
    }
  },

  duplicateLayout: async (id: string): Promise<VenueLayout> => {
    const original = await layoutStorage.getLayout(id);
    if (!original) throw new Error("Layout not found");

    const duplicate: VenueLayout = {
      ...original,
      id: `layout_${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    await layoutStorage.saveLayout(duplicate);
    return duplicate;
  },

  publishLayout: async (id: string): Promise<void> => {
    const layout = await layoutStorage.getLayout(id);
    if (!layout) throw new Error("Layout not found");
    await layoutStorage.saveLayout({ ...layout, status: 'active' });
  },

  getTemplates: async (): Promise<VenueLayout[]> => {
    try {
      const snapshot = await getDocs(collection(db, LAYOUTS_COLLECTION));
      const templates: VenueLayout[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as VenueLayout;
        if (data.isTemplate) {
          templates.push({ ...data, id: doc.id });
        }
      });
      return templates;
    } catch (error) {
      console.error("Error getting templates:", error);
      return [];
    }
  },

  saveAsTemplate: async (id: string, category: string): Promise<void> => {
    const layout = await layoutStorage.getLayout(id);
    if (!layout) throw new Error("Layout not found");

    const template: VenueLayout = {
      ...layout,
      id: `template_${Date.now()}`,
      isTemplate: true,
      templateCategory: category as VenueLayout['templateCategory'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await layoutStorage.saveLayout(template);
  },

  onLayoutsChange: (callback: (layouts: VenueLayout[]) => void) => {
    return onSnapshot(
      collection(db, LAYOUTS_COLLECTION),
      (snapshot) => {
        const layouts: VenueLayout[] = [];
        snapshot.forEach((doc) => {
          layouts.push({ ...doc.data() as VenueLayout, id: doc.id });
        });
        callback(layouts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      },
      (error) => {
        console.error("Error listening to layouts:", error);
      }
    );
  },
};
