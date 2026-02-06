Based on the analysis, here's a comprehensive Claude Code prompt for adding the dynamic seat layout builder to your UVENU application:

UVENU - Dynamic Seat Layout Builder Feature - Claude Code Prompt
Project Context
Existing Application: https://uvenu.vercel.app/ (UVENU - Premium Event Ticket Booking Platform)
Objective: Add a comprehensive drag-and-drop seat layout builder to the admin panel WITHOUT breaking any existing functionality. This feature will allow admins to create custom venue layouts with dynamic pricing zones.
Reference Platform: https://seatmap.pro/ (for UX/UI inspiration on seat mapping)
Critical Requirements
⚠️ MUST FOLLOW RULES

PRESERVE ALL EXISTING FUNCTIONALITY - Do not modify, break, or remove any current features
FOLLOW EXISTING THEME - Match current color scheme, typography, spacing, and design patterns
NON-DESTRUCTIVE ADDITIONS - Only add new routes, components, and database tables
BACKWARD COMPATIBILITY - Ensure existing bookings, events, and user data remain intact
RESPONSIVE DESIGN - Maintain mobile responsiveness throughout

Pre-Implementation Analysis Required
Step 1: Analyze Existing Codebase
Before making ANY changes, analyze:

Tech Stack Detection:

Framework (Next.js, React, etc.)
UI Library (Tailwind, Material-UI, shadcn/ui, etc.)
State Management (Redux, Context, Zustand, etc.)
Database (Prisma, MongoDB, Supabase, Firebase, etc.)
Authentication system
File structure and routing patterns


Existing Database Schema:

Events table structure
Venues table (if exists)
Bookings/tickets table
User roles and permissions
Current seat selection implementation


Existing Theme Variables:

Extract primary, secondary, accent colors
Font families and sizes
Border radius, shadows, spacing patterns
Button styles and variants
Card/container designs


Admin Panel Structure:

Current admin routes and navigation
Authentication guards
Existing admin features
Layout structure


User Flow:

How events are currently created
How seats are currently selected (if implemented)
Booking confirmation flow



Step 2: Document Findings
Create a summary document before proceeding with implementation.
Feature Specification
A. Admin Panel - Layout Builder Entry Point
New Admin Navigation Item
Add to existing admin sidebar/navigation:
📐 Venue Layouts
  ├─ All Layouts
  ├─ Create New Layout
  └─ Layout Library
Location: Should appear in logical position in admin menu (e.g., after Events management)
Layout Management Dashboard (/admin/layouts)
List View - Display all created layouts:

Grid/List toggle view
Each layout card shows:

Layout thumbnail/preview
Layout name
Venue name
Total capacity
Number of price zones
Created date
Status (Active/Draft)
Actions: Edit, Duplicate, Delete, Preview
Usage count (how many events use this layout)



Search & Filters:

Search by layout/venue name
Filter by venue type (theater, stadium, conference, custom)
Sort by: Date, Capacity, Usage

Quick Stats Cards:

Total Layouts Created
Total Seating Capacity Across All Layouts
Most Used Layout
Recent Activity

B. Layout Builder Interface (/admin/layouts/builder/[id])
This is the main drag-and-drop canvas - the core of the feature.
Canvas Area
Main Canvas (large central area):

Infinite canvas with pan and zoom capabilities
Grid overlay (toggleable) for alignment
Snap-to-grid option
Zoom controls: 25%, 50%, 75%, 100%, 150%, 200%
Pan with mouse drag (space + drag or middle mouse button)
Canvas dimensions configurable (default: 1200x800px)
Background: Light gray/white with subtle grid
Measurement rulers (optional, on edges)

Canvas Controls (floating toolbar):

Zoom in/out buttons
Fit to screen
Actual size (100%)
Undo/Redo (with keyboard shortcuts Ctrl+Z / Ctrl+Y)
Grid toggle
Snap to grid toggle
Clear all (with confirmation)

Left Sidebar - Element Library
Seating Elements (draggable):

Individual Seats:

Standard seat icon (theater-style)
Variants: Regular, Wheelchair accessible, Reserved, Broken/Unavailable
Seat appearance: Circle or rounded square
Display: Seat number on hover


Seat Rows:

Quick create: Straight row (5, 10, 20, 50 seats)
Curved row (arc shape with configurable radius)
Each seat in row is individually selectable later


Seat Sections:

Rectangular section (auto-fill with rows and seats)
Configure: Rows, Seats per row, Aisle spacing
Options: Numbered (1,2,3...), Lettered (A,B,C...)



Stage & Special Areas:

Stage (configurable size rectangle)
Performance area (circle/polygon)
Dance floor
Standing room area (with capacity number)
Bar area
Entrance/Exit markers

Structural Elements:

Walls (straight lines)
Curved walls/barriers
Aisles (paths between sections)
Stairs
Ramps
Emergency exits

Labels & Text:

Section labels (A, B, VIP, etc.)
Custom text boxes
Directional arrows
Icons (restroom, coat check, etc.)

Shapes (for decoration/structure):

Rectangle
Circle
Polygon
Line
Curved line

Right Sidebar - Properties Panel
When Nothing Selected:

Canvas properties:

Canvas name
Venue association
Dimensions (width x height)
Background color
Grid size


Layout metadata:

Total seats count (auto-calculated)
Total capacity (including standing)
Number of sections/zones
Accessibility features count



When Element Selected:
For Individual Seat:

Seat ID/Number (editable)
Row (editable)
Section (dropdown)
Price Zone (dropdown - dynamic list)
Status: Available, Reserved (admin only), Broken, Wheelchair
Rotation angle
Position (X, Y coordinates)
Custom notes

For Row/Section:

Section name
Price zone assignment
Row numbering:

Start number/letter
Direction: Left-to-right, Right-to-left
Skip numbers (for aisles)


Seat numbering:

Start number
Increment


Spacing:

Between seats (horizontal)
Between rows (vertical)


Curvature (for curved rows)
Alignment options

For Stage/Areas:

Element type
Dimensions (width, height)
Background color
Border style
Label/name
Capacity (for standing areas)

For Text/Labels:

Text content
Font size
Font weight
Color
Background
Rotation

Multi-select Mode:

When multiple elements selected:

Bulk assign to price zone
Bulk assign to section
Align: Left, Center, Right, Top, Middle, Bottom
Distribute: Horizontally, Vertically
Spacing: Make equal
Group/Ungroup



Top Toolbar
Left Section:

Save button (save as draft)
Publish button (make active for use)
Layout name (editable inline)
Auto-save indicator

Center Section:

Selection tool (pointer) - default
Pan tool (hand)
Draw mode toggle (for custom shapes)
Multi-select mode

Right Section:

Price Zone Manager (button - opens modal)
Preview Mode (opens preview in new tab)
Export (SVG/PNG download)
Import (SVG upload - if applicable)
Settings (gear icon)

C. Price Zone Management
Price Zone Manager Modal
Accessible from top toolbar button.
Zone List (left panel of modal):

List all created zones with:

Color indicator (for visual mapping)
Zone name
Price
Number of seats assigned
Edit/Delete buttons
Drag handle (to reorder)



Default Zones (pre-populated):

VIP - Gold color - €100
Premium - Purple - €75
Standard - Blue - €50
Economy - Green - €30
Balcony - Gray - €25

Add New Zone:

Zone name input
Base price input
Color picker (for visualization)
Description (optional)
Add button

Zone Editor (right panel when zone selected):

Zone name
Base price
Color selection (with preset swatches)
Advanced options:

Dynamic pricing toggle

Peak pricing multiplier
Off-peak discount
Demand-based pricing rules


Bundle offers
Group discount rules


Seat count in this zone (read-only)
Visual preview (seats with this zone highlighted)

Bulk Operations:

Apply zone to multiple sections at once
Copy pricing from another layout
Import zone configuration (JSON)
Export zone configuration

Visual Zone Overlay on Canvas

Toggle "Show Zones" button
When active: Overlay color-coded zones on canvas
Each zone's color appears semi-transparent over assigned seats
Legend shows zone colors and names

D. Layout Templates
Template Library
Provide pre-built templates for common venue types:

Theater Style:

Orchestra section
Mezzanine
Balcony
Box seats


Stadium/Arena:

360-degree seating
Multiple levels
VIP boxes
Field/court level


Conference Hall:

Rows of chairs
Stage at front
AV booth at back


Concert Hall:

Standing area (pit)
Seated sections
VIP balcony


Banquet/Gala:

Round tables (8-10 seats each)
Rectangular tables
Dance floor
Stage


Cinema:

Tiered rows
Center aisle
Premium seats (back rows)



Template Selection:

When creating new layout
"Start from Template" option
Preview thumbnail
Instant load and customize

E. Layout Validation & Smart Features
Auto-validation
Before saving/publishing, check:

✓ All seats have row/section assigned
✓ All seats have price zone
✓ No overlapping seats (warning, not error)
✓ At least one seat exists
✓ Entrance/exit marked (warning)
✓ Accessibility features present (warning)
✓ Seat numbering is sequential (warning if not)

Validation Messages Panel:

Errors (must fix before publishing)
Warnings (can ignore)
Suggestions (best practices)

Smart Numbering

Auto-number seats in logical order
Detect rows and number left-to-right
Skip numbering for aisles/gaps
Re-number button (if layout changed)

Accessibility Checker

Count wheelchair-accessible seats
Verify accessible paths
Check proximity to exits
Compliance percentage indicator

F. Frontend - Customer Seat Selection Experience
This is how customers will interact with your custom layouts.
Event Page Integration
When user clicks "Book Tickets" for an event:

Layout Loader:

Fetch the associated layout JSON
Render the canvas in view-only mode
Display legend (price zones with colors and prices)


Interactive Selection:

Seats rendered as SVG elements
Color-coded by price zone
Seat states:

Available: Full color, clickable
Selected: Highlighted with checkmark/border
Booked: Grayed out, not clickable
Reserved (temporary hold): Dimmed, show timer


Hover effects: Seat number/row tooltip
Click to select/deselect


Selection Panel (sidebar or bottom):

Selected seats list:

Seat: Row A, Seat 5 - VIP - €100
Remove button (X)


Total seats selected
Subtotal calculation
Fees breakdown (if applicable)
Total price (large, bold)
Continue to Checkout button


Zoom & Navigation:

Zoom in/out buttons
Pan with drag (or two-finger touch)
Fit to screen option
Mini-map (small overview in corner showing full layout and current viewport)


Legend Panel:

Show all price zones
Available count per zone
Click zone to filter/highlight


Best Seats Recommendation:

"Find Best Seats" button
Algorithm suggests seats based on:

Proximity to stage/center
Price preference
Group size (seats together)
User preference (aisle, center, back)


Highlight recommended seats



Mobile Optimization

Touch-friendly seat selection
Pinch to zoom
Double-tap to focus on section
Simplified legend (collapsible)
Bottom sheet for seat details

G. Backend Implementation
Database Schema Extensions
New Tables:

LayoutTemplates (or VenueLayouts):

sql{
  id: UUID
  name: String
  description: Text
  venue_id: FK (if venues table exists, nullable)
  venue_name: String
  canvas_width: Integer (default 1200)
  canvas_height: Integer (default 800)
  layout_data: JSON (full layout structure)
  total_capacity: Integer (calculated)
  total_seated: Integer
  total_standing: Integer
  accessibility_count: Integer
  price_zones: JSON (array of zones)
  status: Enum ['draft', 'active', 'archived']
  thumbnail_url: String (auto-generated preview image)
  created_by: FK (admin user)
  created_at: Timestamp
  updated_at: Timestamp
  usage_count: Integer (how many events use it)
  is_template: Boolean (if it's a reusable template)
  template_category: String (theater, stadium, etc.)
}

LayoutElements (normalized approach - optional):

sql{
  id: UUID
  layout_id: FK
  element_type: Enum ['seat', 'row', 'section', 'stage', 'area', 'shape', 'label']
  element_data: JSON (properties specific to type)
  position_x: Float
  position_y: Float
  width: Float (for shapes)
  height: Float
  rotation: Float (degrees)
  price_zone_id: FK (nullable)
  section_name: String
  row_identifier: String
  seat_number: String
  status: Enum ['available', 'reserved_admin', 'broken']
  parent_element_id: FK (for grouped elements, nullable)
  z_index: Integer (stacking order)
  created_at: Timestamp
}

PriceZones:

sql{
  id: UUID
  layout_id: FK
  zone_name: String
  base_price: Decimal
  color_hex: String
  description: Text
  display_order: Integer
  dynamic_pricing_enabled: Boolean
  pricing_rules: JSON (multipliers, conditions)
  seat_count: Integer (calculated)
  created_at: Timestamp
}
Modified Tables:

Events (add column):

sql{
  // existing columns...
  layout_template_id: FK (VenueLayouts) nullable
  // if null, use old seat selection method
}

Bookings/Tickets (add columns):

sql{
  // existing columns...
  seat_element_id: FK (LayoutElements) nullable
  seat_section: String
  seat_row: String
  seat_number: String
  price_zone_name: String
  // Keep existing ticket fields for backward compatibility
}
API Endpoints
Create new API routes (RESTful):
Layout Management:

GET /api/admin/layouts - List all layouts
GET /api/admin/layouts/:id - Get layout details
POST /api/admin/layouts - Create new layout
PUT /api/admin/layouts/:id - Update layout
DELETE /api/admin/layouts/:id - Delete layout (check no events using it)
POST /api/admin/layouts/:id/duplicate - Duplicate layout
GET /api/admin/layouts/:id/preview - Generate preview image
POST /api/admin/layouts/:id/publish - Change status to active

Price Zones:

GET /api/admin/layouts/:id/zones - Get all zones for layout
POST /api/admin/layouts/:id/zones - Create zone
PUT /api/admin/layouts/:id/zones/:zoneId - Update zone
DELETE /api/admin/layouts/:id/zones/:zoneId - Delete zone
POST /api/admin/layouts/:id/zones/bulk-assign - Assign zone to multiple seats

Templates:

GET /api/admin/templates - Get template library
GET /api/admin/templates/:category - Get templates by category
POST /api/admin/layouts/:id/save-as-template - Save custom layout as template

Public/Frontend:

GET /api/events/:eventId/layout - Get layout for event
GET /api/events/:eventId/seat-availability - Real-time availability
POST /api/bookings/reserve-seats - Reserve selected seats (temporary lock)
POST /api/bookings/release-seats - Release reserved seats
POST /api/bookings/confirm - Confirm booking (finalize purchase)

Real-time Seat Availability
Implement WebSocket or polling for live updates:

When user opens seat selection, establish connection
When seats are selected by others, update UI immediately
5-minute temporary reservation on selected seats
Timer countdown shown to user
Auto-release if not confirmed in time

Layout Data Structure (JSON)
Example layout_data field structure:
json{
  "version": "1.0",
  "canvas": {
    "width": 1200,
    "height": 800,
    "backgroundColor": "#f5f5f5",
    "gridSize": 20,
    "gridVisible": false
  },
  "elements": [
    {
      "id": "elem-uuid-1",
      "type": "seat",
      "x": 100,
      "y": 200,
      "rotation": 0,
      "properties": {
        "section": "A",
        "row": "1",
        "number": "5",
        "priceZoneId": "zone-uuid-1",
        "status": "available",
        "accessibility": false
      }
    },
    {
      "id": "elem-uuid-2",
      "type": "section",
      "x": 100,
      "y": 150,
      "width": 400,
      "height": 300,
      "properties": {
        "name": "Section A",
        "rows": 10,
        "seatsPerRow": 15,
        "priceZoneId": "zone-uuid-2",
        "rowSpacing": 30,
        "seatSpacing": 25,
        "startRow": "A",
        "startSeat": 1
      },
      "children": ["elem-uuid-3", "elem-uuid-4", "..."]
    },
    {
      "id": "stage-1",
      "type": "stage",
      "x": 500,
      "y": 50,
      "width": 200,
      "height": 80,
      "properties": {
        "label": "Main Stage",
        "backgroundColor": "#333333",
        "borderColor": "#gold"
      }
    }
  ],
  "priceZones": [
    {
      "id": "zone-uuid-1",
      "name": "VIP",
      "basePrice": 100,
      "color": "#FFD700",
      "description": "Best seats in the house"
    }
  ],
  "metadata": {
    "totalSeats": 450,
    "totalCapacity": 500,
    "accessibleSeats": 12
  }
}
```

### H. Technical Implementation Guide

#### Frontend Components Structure
```
/components/admin/layouts/
├── LayoutBuilder/
│   ├── Canvas.tsx (main drag-drop canvas)
│   ├── ElementLibrary.tsx (left sidebar)
│   ├── PropertiesPanel.tsx (right sidebar)
│   ├── TopToolbar.tsx
│   ├── CanvasControls.tsx (zoom, pan)
│   ├── GridOverlay.tsx
│   └── MiniMap.tsx
├── Elements/
│   ├── Seat.tsx
│   ├── SeatRow.tsx
│   ├── SeatSection.tsx
│   ├── Stage.tsx
│   ├── StandingArea.tsx
│   ├── Label.tsx
│   └── Shape.tsx
├── PriceZones/
│   ├── ZoneManager.tsx (modal)
│   ├── ZoneList.tsx
│   ├── ZoneEditor.tsx
│   └── ZoneOverlay.tsx (canvas overlay)
├── Templates/
│   ├── TemplateLibrary.tsx
│   └── TemplateCard.tsx
├── Validation/
│   ├── ValidationPanel.tsx
│   └── ValidationMessage.tsx
└── LayoutList.tsx (management dashboard)

/components/customer/
├── SeatSelection/
│   ├── SeatMapViewer.tsx (public-facing viewer)
│   ├── InteractiveSeat.tsx
│   ├── SelectionPanel.tsx
│   ├── ZoneLegend.tsx
│   ├── SeatTooltip.tsx
│   └── BestSeatsRecommendation.tsx
Libraries to Use
Drag & Drop:

@dnd-kit/core + @dnd-kit/sortable (modern, performant)
OR react-beautiful-dnd (if already in project)
OR react-dnd (flexible but complex)

Canvas Rendering:

react-konva (Konva.js wrapper - RECOMMENDED for complex shapes)
OR react-canvas for direct canvas manipulation
OR SVG with d3.js for data-driven rendering

Zoom/Pan:

react-zoom-pan-pinch for canvas interaction
OR pinch-zoom-pan for touch support

Color Picker:

react-colorful (lightweight)
OR existing color picker in project

Form Handling:

Use existing form library (React Hook Form, Formik, etc.)

State Management:

Context API for builder state (elements, selected, zoom level)
OR existing state management (Redux, Zustand)

Performance Considerations

Virtualization: Only render visible seats on large layouts (1000+ seats)

Use react-window or react-virtualized


Canvas Optimization:

Use layering (background layer, seat layer, overlay layer)
Implement dirty region redrawing
Debounce drag/resize events


Data Caching:

Cache layout JSON in localStorage during editing
Implement auto-save every 30 seconds


Image Generation:

Generate thumbnail asynchronously
Use canvas.toDataURL() or server-side rendering (Puppeteer)


Real-time Updates:

Debounce availability checks (every 5 seconds)
Use optimistic UI updates for seat selection



I. User Experience Enhancements
Keyboard Shortcuts (Builder)

Ctrl+S - Save
Ctrl+Z - Undo
Ctrl+Y - Redo
Ctrl+D - Duplicate selected
Delete - Delete selected
Ctrl+A - Select all
Escape - Deselect all
Arrow keys - Move selected element (1px)
Shift+Arrow - Move element (10px)
Ctrl+G - Group selected elements
Ctrl+Shift+G - Ungroup
Space+Drag - Pan canvas
+/- - Zoom in/out
0 - Reset zoom to 100%

Context Menu (Right-click)
On empty canvas:

Paste
Add seat here
Add label here

On element:

Copy
Duplicate
Delete
Bring to front
Send to back
Group with selected
Lock position
Properties

Tutorial/Onboarding
First time admin opens layout builder:

Interactive walkthrough (use react-joyride or similar)
Steps:

Welcome to layout builder
Drag elements from library
Configure properties
Create price zones
Save your layout



Help System

"?" button in top toolbar
Contextual help tooltips
Video tutorials (embedded YouTube)
Documentation link

J. Testing & Quality Assurance
Test Cases to Verify
Admin Builder:

 Can create new layout
 Can drag and drop seats
 Can create rows/sections
 Can configure price zones
 Can save and load layout
 Can duplicate layout
 Can delete layout (with confirmation)
 Validation works correctly
 Auto-numbering works
 Undo/redo works
 Export/import works
 Templates load correctly
 Responsive on tablet/desktop

Customer Experience:

 Layout renders correctly
 Seats are clickable
 Selection/deselection works
 Real-time availability updates
 Seat reservation timer works
 Price calculation correct
 Mobile touch works
 Zoom/pan works
 Legend displays correctly
 Checkout integration works

Integration:

 Existing events still work (without layout)
 New events can use layout
 Booking confirmation includes seat details
 Tickets show seat information
 Email confirmations display seat info
 Admin can view bookings with seat details

Performance:

 Large layouts (500+ seats) perform well
 Builder doesn't lag with complex layouts
 Customer view loads quickly
 Real-time updates don't slow down UI

K. Migration Strategy
Since this is adding a new feature to existing application:

Phase 1 - Additive Only:

Add new tables/columns
Create new admin routes
Build layout builder
DO NOT modify existing event creation


Phase 2 - Optional Integration:

Add "Use Custom Layout" checkbox to event creation
If checked, show layout selector
If unchecked, use old method
Both methods coexist


Phase 3 - Data Migration (optional, future):

Tool to convert old seat data to new format
Bulk import for existing venues



L. Documentation Required
Create documentation files:

Admin Guide (/docs/admin-layout-builder.md):

How to create a layout
Best practices
Keyboard shortcuts
Troubleshooting


Technical Documentation (/docs/technical-layout-system.md):

Data structure
API endpoints
Component architecture
Integration guide


Customer FAQ (/docs/customer-seat-selection.md):

How to select seats
What do colors mean
Seat reservation policy



Implementation Checklist
Step-by-Step Execution

 Step 1: Analyze existing UVENU codebase (tech stack, theme, structure)
 Step 2: Create database migrations (new tables)
 Step 3: Create API endpoints (backend)
 Step 4: Build layout list/management page
 Step 5: Build canvas component (drag-drop foundation)
 Step 6: Implement element library (draggable items)
 Step 7: Implement properties panel
 Step 8: Add top toolbar and controls
 Step 9: Implement price zone manager
 Step 10: Add validation system
 Step 11: Create template library
 Step 12: Build customer seat selection viewer
 Step 13: Implement real-time availability
 Step 14: Integrate with event creation
 Step 15: Test all functionality
 Step 16: Optimize performance
 Step 17: Create documentation
 Step 18: Final QA and deployment

Visual Design Requirements
Match Existing UVENU Theme
Examine and replicate:

Color Scheme: Extract primary, secondary, accent colors from existing pages
Typography: Use same font families, sizes, weights
Spacing: Match padding, margins, gap values
Borders: Same border radius, border widths
Shadows: Replicate box-shadow styles
Buttons: Same button styles (primary, secondary, outlined, etc.)
Cards: Match card designs
Inputs: Same input field styling
Modals: Consistent modal designs
Navigation: Match admin sidebar/header style

Builder-Specific Styling
Canvas:

Background: Light neutral (e.g., #f8f9fa or theme's light background)
Grid: Subtle gray lines (1px, #e0e0e0)
Selected element: Blue outline (2px, theme primary color)
Multi-selected: Different color outline (e.g., purple)
Hover: Subtle highlight/shadow

Seats:

Size: 30px x 30px (default, configurable)
Shape: Circle or rounded square
Colors: Follow price zone colors
States:

Available: Solid color with border
Selected: Solid color + checkmark icon
Booked: Gray (#9e9e9e) + strikethrough
Reserved: Dimmed color + timer icon
Wheelchair: Wheelchair icon overlay


Hover: Scale 1.1, shadow

Sections/Zones:

Semi-transparent colored overlay (opacity 0.2)
Dashed border (2px)
Label in center (bold, larger text)

Stage/Special Areas:

Distinct color (dark gray for stage)
Label centered
Icon if applicable

Final Deliverables
Upon completion, the feature should include:

✅ Fully functional drag-and-drop layout builder in admin panel
✅ Price zone management system
✅ Template library with 5+ templates
✅ Customer-facing interactive seat selection
✅ Real-time seat availability system
✅ Database schema implemented
✅ API endpoints created and tested
✅ All existing functionality intact
✅ Responsive design (desktop, tablet, mobile)
✅ Documentation (admin guide, technical docs)
✅ No breaking changes to existing code


Additional Context
Key Philosophy: This feature should feel like a natural, seamless extension of UVENU. A user who's familiar with the existing admin panel should immediately understand how to navigate to and use the layout builder. The design should be so cohesive that it looks like it was always part of the platform.
Success Metric: An admin should be able to create a complete, production-ready layout with 200+ seats, multiple price zones, and a stage in under 15 minutes.