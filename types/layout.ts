// Layout Builder Types for UVENU Dynamic Seat Layout System

export interface LayoutCanvas {
  width: number;
  height: number;
  backgroundColor: string;
  gridSize: number;
  gridVisible: boolean;
  snapToGrid: boolean;
}

export type LayoutElementType = 'seat' | 'row' | 'section' | 'stage' | 'standing-area' | 'shape' | 'label' | 'wall' | 'aisle' | 'entrance';

export type SeatStatus = 'available' | 'reserved_admin' | 'broken' | 'wheelchair';

export type ShapeType = 'rectangle' | 'circle' | 'polygon' | 'line';

export interface LayoutElement {
  id: string;
  type: LayoutElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  parentId?: string;
  properties: ElementProperties;
}

export interface SeatProperties {
  section: string;
  row: string;
  number: string;
  priceZoneId: string;
  status: SeatStatus;
  accessibility: boolean;
  notes?: string;
}

export interface RowProperties {
  sectionName: string;
  priceZoneId: string;
  seatCount: number;
  startNumber: number;
  rowLabel: string;
  spacing: number;
  curved: boolean;
  curveRadius?: number;
}

export interface SectionProperties {
  name: string;
  priceZoneId: string;
  rows: number;
  seatsPerRow: number;
  rowSpacing: number;
  seatSpacing: number;
  startRow: string;
  startSeat: number;
  rowDirection: 'ltr' | 'rtl';
}

export interface StageProperties {
  label: string;
  backgroundColor: string;
  borderColor: string;
  shape: 'rectangle' | 'semicircle' | 'custom';
}

export interface StandingAreaProperties {
  label: string;
  capacity: number;
  backgroundColor: string;
  borderColor: string;
}

export interface ShapeProperties {
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  label?: string;
}

export interface LabelProperties {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor: string;
}

export interface WallProperties {
  thickness: number;
  color: string;
}

export interface EntranceProperties {
  label: string;
  type: 'entrance' | 'exit' | 'emergency';
  color: string;
}

export type ElementProperties =
  | { kind: 'seat' } & SeatProperties
  | { kind: 'row' } & RowProperties
  | { kind: 'section' } & SectionProperties
  | { kind: 'stage' } & StageProperties
  | { kind: 'standing-area' } & StandingAreaProperties
  | { kind: 'shape' } & ShapeProperties
  | { kind: 'label' } & LabelProperties
  | { kind: 'wall' } & WallProperties
  | { kind: 'entrance' } & EntranceProperties;

export interface PriceZone {
  id: string;
  zoneName: string;
  basePrice: number;
  colorHex: string;
  description: string;
  displayOrder: number;
  dynamicPricingEnabled: boolean;
  pricingRules?: {
    peakMultiplier?: number;
    offPeakDiscount?: number;
  };
  seatCount: number;
}

export type LayoutStatus = 'draft' | 'active' | 'archived';

export type TemplateCategory = 'theater' | 'stadium' | 'conference' | 'concert' | 'banquet' | 'cinema' | 'custom';

export interface VenueLayout {
  id: string;
  name: string;
  description: string;
  venueName: string;
  canvas: LayoutCanvas;
  elements: LayoutElement[];
  priceZones: PriceZone[];
  totalCapacity: number;
  totalSeated: number;
  totalStanding: number;
  accessibilityCount: number;
  status: LayoutStatus;
  thumbnailUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isTemplate: boolean;
  templateCategory?: TemplateCategory;
}

export interface LayoutBuilderState {
  layout: VenueLayout;
  selectedElementIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  tool: 'select' | 'pan' | 'draw';
  showGrid: boolean;
  showZones: boolean;
  undoStack: VenueLayout[];
  redoStack: VenueLayout[];
  isDirty: boolean;
  lastSaved?: string;
}

// For the customer-facing seat selection
export interface SeatAvailability {
  seatId: string;
  elementId: string;
  section: string;
  row: string;
  number: string;
  priceZoneId: string;
  zoneName: string;
  price: number;
  zoneColor: string;
  status: 'available' | 'selected' | 'booked' | 'reserved';
  x: number;
  y: number;
}

// Default price zones
export const DEFAULT_PRICE_ZONES: PriceZone[] = [
  { id: 'zone-vip', zoneName: 'VIP', basePrice: 100, colorHex: '#FFD700', description: 'Best seats in the house', displayOrder: 0, dynamicPricingEnabled: false, seatCount: 0 },
  { id: 'zone-premium', zoneName: 'Premium', basePrice: 75, colorHex: '#A855F7', description: 'Premium seating', displayOrder: 1, dynamicPricingEnabled: false, seatCount: 0 },
  { id: 'zone-standard', zoneName: 'Standard', basePrice: 50, colorHex: '#3B82F6', description: 'Standard seating', displayOrder: 2, dynamicPricingEnabled: false, seatCount: 0 },
  { id: 'zone-economy', zoneName: 'Economy', basePrice: 30, colorHex: '#22C55E', description: 'Economy seating', displayOrder: 3, dynamicPricingEnabled: false, seatCount: 0 },
  { id: 'zone-balcony', zoneName: 'Balcony', basePrice: 25, colorHex: '#6B7280', description: 'Balcony seating', displayOrder: 4, dynamicPricingEnabled: false, seatCount: 0 },
];

export const DEFAULT_CANVAS: LayoutCanvas = {
  width: 1200,
  height: 800,
  backgroundColor: '#f8f9fa',
  gridSize: 20,
  gridVisible: true,
  snapToGrid: true,
};

export function createNewLayout(name: string = 'Untitled Layout'): VenueLayout {
  return {
    id: `layout_${Date.now()}`,
    name,
    description: '',
    venueName: '',
    canvas: { ...DEFAULT_CANVAS },
    elements: [],
    priceZones: DEFAULT_PRICE_ZONES.map(z => ({ ...z })),
    totalCapacity: 0,
    totalSeated: 0,
    totalStanding: 0,
    accessibilityCount: 0,
    status: 'draft',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
    isTemplate: false,
  };
}
