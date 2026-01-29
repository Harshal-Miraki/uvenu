"use client";

import React, { useState, useMemo } from 'react';
import { Seat, SeatTier, TierConfig } from '@/types';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';

// Default tier configuration (used as fallback)
export const DEFAULT_TIER_CONFIG: TierConfig[] = [
    { id: 'platinum', name: 'Platinum', price: 800, color: '#EF4444' },  // Red
    { id: 'gold', name: 'Gold', price: 750, color: '#A855F7' },         // Purple
    { id: 'silver', name: 'Silver', price: 615, color: '#3B82F6' },     // Blue
    { id: 'bronze', name: 'Bronze', price: 525, color: '#06B6D4' },     // Cyan
];

// Get current tier pricing from storage (synced globally)
export async function getTierPricing(): Promise<TierConfig[]> {
    if (typeof window === 'undefined') return DEFAULT_TIER_CONFIG;
    return await storage.getTierPricing();
}

interface SeatMapProps {
    seats: Seat[];
    tierConfig: TierConfig[];
    onSeatSelect: (seat: Seat) => void;
    selectedSeats: Seat[];
    discountPercentage?: number;
}

// Generate a 3-section theater layout (matching your image)
// Left: 16 rows × 10 seats, Center: 16 rows × 12 seats, Right: 16 rows × 10 seats
export function generateTheaterSeats(tierLayout: 'ascending' | 'descending' = 'ascending'): Seat[] {
    const seats: Seat[] = [];

    // 16 rows labeled A through P
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

    // Section configuration: [sectionId, seatCount]
    const sections: { id: 'left' | 'center' | 'right'; seats: number }[] = [
        { id: 'left', seats: 10 },
        { id: 'center', seats: 12 },
        { id: 'right', seats: 10 }
    ];

    // Define tier zones by row (rows 1-2 = Platinum, 3-5 = Gold, 6-10 = Silver, 11-16 = Bronze)
    const getTierByRowIndex = (rowIndex: number): SeatTier => {
        if (tierLayout === 'ascending') {
            // Premium at front
            if (rowIndex < 2) return 'platinum';      // A, B
            if (rowIndex < 5) return 'gold';          // C, D, E
            if (rowIndex < 10) return 'silver';       // F, G, H, I, J
            return 'bronze';                          // K, L, M, N, O, P
        } else {
            // Premium at back (descending)
            if (rowIndex >= 14) return 'platinum';    // O, P
            if (rowIndex >= 11) return 'gold';        // L, M, N
            if (rowIndex >= 6) return 'silver';       // G, H, I, J, K
            return 'bronze';                          // A, B, C, D, E, F
        }
    };

    // Generate seats for each section and row
    rows.forEach((row, rowIndex) => {
        const tier = getTierByRowIndex(rowIndex);

        sections.forEach(section => {
            for (let seatNum = 1; seatNum <= section.seats; seatNum++) {
                seats.push({
                    id: `${section.id}-${row}-${seatNum}`,
                    row,
                    number: seatNum,
                    section: section.id,
                    tier,
                    status: Math.random() > 0.85 ? 'sold' : 'available' // 15% sold
                });
            }
        });
    });

    return seats;
}

// Individual seat component - Exam Hall Paper Style
function SeatButton({
    seat,
    tierConfig,
    isSelected,
    onClick
}: {
    seat: Seat;
    tierConfig: TierConfig[];
    isSelected: boolean;
    onClick: () => void;
}) {
    const tier = tierConfig.find(t => t.id === seat.tier);
    const isSold = seat.status === 'sold';

    return (
        <button
            disabled={isSold}
            onClick={onClick}
            className={cn(
                "w-4 h-4 md:w-5 md:h-5 transition-all duration-100 shrink-0",
                // Exam hall paper style - simple squares
                isSold && "cursor-not-allowed",
                !isSold && !isSelected && "hover:bg-blue-100 cursor-pointer",
                isSelected && "ring-2 ring-blue-600 ring-offset-1"
            )}
            style={{
                backgroundColor: isSold ? '#D1D5DB' : isSelected ? '#93C5FD' : '#F3F4F6',
                border: `1px solid ${isSold ? '#9CA3AF' : isSelected ? '#2563EB' : '#374151'}`,
            }}
            title={isSold ? 'Occupied' : `Row ${seat.row}, Seat ${seat.number}`}
        />
    );
}

// Curved row component
function CurvedRow({
    rowSeats,
    rowIndex,
    totalRows,
    tierConfig,
    selectedSeats,
    onSeatSelect,
    tier
}: {
    rowSeats: Seat[];
    rowIndex: number;
    totalRows: number;
    tierConfig: TierConfig[];
    selectedSeats: Seat[];
    onSeatSelect: (seat: Seat) => void;
    tier: TierConfig | undefined;
}) {
    // Calculate curve amount based on row position (front rows curve more)
    const curveAmount = (totalRows - rowIndex) * 3;

    return (
        <div
            className="flex justify-center gap-1 relative"
            style={{
                // Create arc effect with padding
                paddingLeft: `${curveAmount}px`,
                paddingRight: `${curveAmount}px`,
            }}
        >
            {/* Row label */}
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 w-6">
                {rowSeats[0]?.row}
            </span>

            {rowSeats.map(seat => (
                <SeatButton
                    key={seat.id}
                    seat={seat}
                    tierConfig={tierConfig}
                    isSelected={selectedSeats.some(s => s.id === seat.id)}
                    onClick={() => onSeatSelect(seat)}
                />
            ))}

            {/* Row label right */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 w-6 text-right">
                {rowSeats[0]?.row}
            </span>
        </div>
    );
}

// Legend component
function SeatLegend({ tierConfig, discountPercentage = 0 }: { tierConfig: TierConfig[]; discountPercentage?: number }) {
    return (
        <div className="flex flex-wrap justify-center gap-6 mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            {tierConfig.map(tier => {
                const discountedPrice = discountPercentage > 0
                    ? Math.round(tier.price * (1 - discountPercentage / 100))
                    : tier.price;

                return (
                    <div key={tier.id} className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded-md shadow-sm"
                            style={{ backgroundColor: tier.color }}
                        />
                        <div className="text-sm">
                            <span className="font-bold text-gray-800">{tier.name}</span>
                            <span className="text-gray-500 ml-1">({discountedPrice} QAR)</span>
                        </div>
                    </div>
                );
            })}
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-300" />
                <span className="text-sm text-gray-500">Sold</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-200 border border-gray-300" />
                <span className="text-sm text-gray-500">Available</span>
            </div>
        </div>
    );
}

// Main SeatMap component - 3 Section Layout
export default function SeatMap({
    seats,
    tierConfig,
    onSeatSelect,
    selectedSeats,
    discountPercentage = 0
}: SeatMapProps) {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    const sections: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];

    // Group seats by section and row
    const seatsBySection = useMemo(() => {
        const result: Record<string, Record<string, Seat[]>> = {
            left: {},
            center: {},
            right: {}
        };

        rows.forEach(row => {
            result.left[row] = seats.filter(s => s.section === 'left' && s.row === row);
            result.center[row] = seats.filter(s => s.section === 'center' && s.row === row);
            result.right[row] = seats.filter(s => s.section === 'right' && s.row === row);
        });

        return result;
    }, [seats]);

    // Get tier for a row
    const getTierForRow = (rowIndex: number) => {
        if (rowIndex < 2) return tierConfig.find(t => t.id === 'platinum');
        if (rowIndex < 5) return tierConfig.find(t => t.id === 'gold');
        if (rowIndex < 10) return tierConfig.find(t => t.id === 'silver');
        return tierConfig.find(t => t.id === 'bronze');
    };

    // Section component - Exam Hall Paper Style
    const SectionBlock = ({
        sectionId,
        sectionSeats
    }: {
        sectionId: 'left' | 'center' | 'right';
        sectionSeats: Record<string, Seat[]>;
    }) => {
        const premiumRows = ['A', 'B'];
        const regularRows = rows.filter(r => !premiumRows.includes(r));

        // Get seat count for width calculation
        const seatCount = sectionId === 'center' ? 12 : 10;
        const seatSize = 20; // w-5 = 20px
        const seatGap = 2;
        const rowWidth = seatCount * seatSize + (seatCount - 1) * seatGap;

        return (
            <div className="flex flex-col">
                {/* ARC ROWS (First 2 rows) - Hand-drawn arc style */}
                <div
                    className="relative mb-2 pb-2"
                    style={{
                        height: '58px'
                    }}
                >
                    {premiumRows.map((row, rowIndex) => {
                        const rowSeats = sectionSeats[row] || [];
                        const arcRadius = 200;
                        const arcSpan = 40; // Wider arc for more visible curve

                        return (
                            <div
                                key={`${sectionId}-arc-${row}`}
                                className="absolute left-1/2 -translate-x-1/2"
                                style={{
                                    width: `${rowWidth}px`,
                                    top: `${rowIndex * 26}px`
                                }}
                            >
                                <div className="relative h-5 flex justify-center">
                                    {rowSeats.map((seat, seatIndex) => {
                                        const totalSeats = rowSeats.length;
                                        const arcSpan = 45; // Wider arc for more visible curve
                                        const arcRadius = 180;

                                        // Calculate position ratio (0 to 1)
                                        const posRatio = seatIndex / (totalSeats - 1);

                                        // Different arc direction based on section
                                        let yOffset = 0;
                                        if (sectionId === 'left') {
                                            // Left section: curve up on the left (seats go UP as you move left)
                                            yOffset = -((1 - posRatio) * (1 - posRatio) * 12);
                                        } else if (sectionId === 'right') {
                                            // Right section: curve up on the right (seats go UP as you move right)
                                            yOffset = -(posRatio * posRatio * 12);
                                        } else {
                                            // Center section: symmetric arc (edges go UP, center stays lower)
                                            const startAngle = -arcSpan / 2;
                                            const angleStep = arcSpan / (totalSeats - 1);
                                            const angle = startAngle + (seatIndex * angleStep);
                                            const angleRad = angle * (Math.PI / 180);
                                            yOffset = -((1 - Math.cos(angleRad)) * (arcRadius * 0.1));
                                        }

                                        const xPos = (seatIndex / (totalSeats - 1)) * (rowWidth - seatSize);

                                        return (
                                            <div
                                                key={seat.id}
                                                className="absolute"
                                                style={{
                                                    left: `${xPos}px`,
                                                    top: `${yOffset}px`,
                                                }}
                                            >
                                                <SeatButton
                                                    seat={seat}
                                                    tierConfig={tierConfig}
                                                    isSelected={selectedSeats.some(s => s.id === seat.id)}
                                                    onClick={() => onSeatSelect(seat)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Row number annotation */}
                                {sectionId === 'center' && (
                                    <span className="absolute -right-6 top-0 text-[9px] text-gray-500 font-mono">
                                        {row}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* GOLDEN SECTION - Dotted line differentiation like arc rows */}
                <div className="relative mb-2 pb-2">
                    <div className="flex flex-col gap-[3px]">
                        {(() => {
                            // Golden section rows differ by block
                            // Block A (left): 1 row - Row C
                            // Block B (center): 3 rows - Rows C, D, E
                            // Block C (right): 1 row - Row C
                            const goldenRows = sectionId === 'center'
                                ? ['C', 'D', 'E']
                                : ['C'];

                            return goldenRows.map((row, rowIdx) => {
                                const rowSeats = sectionSeats[row] || [];
                                return (
                                    <div
                                        key={`${sectionId}-gold-${row}`}
                                        className="flex justify-center gap-1 relative"
                                    >
                                        {rowSeats.map(seat => (
                                            <SeatButton
                                                key={seat.id}
                                                seat={seat}
                                                tierConfig={tierConfig}
                                                isSelected={selectedSeats.some(s => s.id === seat.id)}
                                                onClick={() => onSeatSelect(seat)}
                                            />
                                        ))}
                                        {sectionId === 'center' && (
                                            <span className="absolute -right-6 top-0 text-[9px] text-amber-600 font-mono">
                                                {row}
                                            </span>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* REMAINING ROWS - Standard grid */}
                <div className="flex flex-col gap-[3px]">
                    {(() => {
                        // Remaining rows after golden section
                        // Block A (left): D onwards (skipped C)
                        // Block B (center): F onwards (skipped C,D,E)
                        // Block C (right): D onwards (skipped C)
                        const remainingRows = sectionId === 'center'
                            ? regularRows.filter(r => !['C', 'D', 'E'].includes(r))
                            : regularRows.filter(r => r !== 'C');

                        return remainingRows.map((row, rowIdx) => {
                            const rowSeats = sectionSeats[row] || [];

                            // Add divider after every 4 rows
                            const showDivider = (rowIdx + 1) % 4 === 0 && rowIdx < remainingRows.length - 1;

                            return (
                                <div key={`${sectionId}-${row}-wrapper`}>
                                    <div
                                        className="flex justify-center gap-1 relative"
                                    >
                                        {rowSeats.map(seat => (
                                            <SeatButton
                                                key={seat.id}
                                                seat={seat}
                                                tierConfig={tierConfig}
                                                isSelected={selectedSeats.some(s => s.id === seat.id)}
                                                onClick={() => onSeatSelect(seat)}
                                            />
                                        ))}
                                        {sectionId === 'center' && (rowIdx === 3 || rowIdx === 7) && (
                                            <span className="absolute -right-6 top-0 text-[9px] text-gray-500 font-mono">
                                                {row}
                                            </span>
                                        )}
                                    </div>
                                    {showDivider && (
                                        <div className="my-2 h-px bg-gray-400" style={{ opacity: 0.4 }} />
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        );
    };

    // Tier zone backgrounds per section
    const tierZones = [
        { rows: rows.slice(0, 2), tier: tierConfig.find(t => t.id === 'platinum') },
        { rows: rows.slice(2, 5), tier: tierConfig.find(t => t.id === 'gold') },
        { rows: rows.slice(5, 10), tier: tierConfig.find(t => t.id === 'silver') },
        { rows: rows.slice(10, 16), tier: tierConfig.find(t => t.id === 'bronze') }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Paper-style container */}
            <div
                className="relative p-6 border-2 border-gray-800"
                style={{
                    backgroundColor: '#FAFAFA',
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.03)',
                    fontFamily: '"Courier New", monospace'
                }}
            >
                {/* Title/Header - Hand-drawn style */}
                <div className="text-center mb-4 pb-3" style={{ borderBottom: '2px solid #1F2937' }}>
                    <h2 className="text-lg font-bold text-gray-800 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                        SEATING ARRANGEMENT
                    </h2>
                    <p className="text-[10px] text-gray-500 mt-1 tracking-wider">VENUE FLOOR PLAN</p>
                </div>

                {/* Stage indicator - Simple pen style */}
                <div className="relative mb-6">
                    <div
                        className="w-2/3 mx-auto py-2 text-center border-2 border-gray-800"
                        style={{
                            borderRadius: '0 0 60px 60px',
                            backgroundColor: '#E5E7EB'
                        }}
                    >
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-[0.2em]">STAGE</span>
                    </div>
                </div>

                {/* Main seating area with aisles */}
                <div className="flex justify-center gap-4 relative">
                    {/* Left margin annotation */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 -rotate-90 whitespace-nowrap">
                        ← EXIT
                    </div>

                    {/* HORIZONTAL CONNECTING LINES - Span across all sections */}
                    {/* Line after Arc Rows (A, B) */}
                    <div
                        className="absolute left-0 right-0 h-px"
                        style={{
                            top: '85px',
                            borderTop: '1px dashed #374151'
                        }}
                    />
                    {/* Line after Golden Section */}
                    <div
                        className="absolute left-0 right-0 h-px"
                        style={{
                            top: '160px',
                            borderTop: '1px dashed #D4AF37'
                        }}
                    />

                    {/* Left Section */}
                    <div className="flex flex-col items-center border border-gray-300 p-2 bg-white">
                        <span className="text-[10px] font-mono text-gray-500 mb-1">BLOCK A</span>
                        <SectionBlock sectionId="left" sectionSeats={seatsBySection.left} />
                    </div>

                    {/* Vertical Aisle */}
                    <div className="w-4 flex items-center justify-center">
                        <div className="h-full w-px bg-gray-400" style={{ minHeight: '300px' }}></div>
                    </div>

                    {/* Center Section */}
                    <div className="flex flex-col items-center border border-gray-300 p-2 bg-white">
                        <span className="text-[10px] font-mono text-gray-500 mb-1">BLOCK B</span>
                        <SectionBlock sectionId="center" sectionSeats={seatsBySection.center} />
                    </div>

                    {/* Vertical Aisle */}
                    <div className="w-4 flex items-center justify-center">
                        <div className="h-full w-px bg-gray-400" style={{ minHeight: '300px' }}></div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-center border border-gray-300 p-2 bg-white">
                        <span className="text-[10px] font-mono text-gray-500 mb-1">BLOCK C</span>
                        <SectionBlock sectionId="right" sectionSeats={seatsBySection.right} />
                    </div>

                    {/* Right margin annotation */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 rotate-90 whitespace-nowrap">
                        EXIT →
                    </div>
                </div>

                {/* Bottom annotations */}
                <div className="mt-6 pt-3 flex justify-between items-center text-[9px] text-gray-500" style={{ borderTop: '1px dashed #9CA3AF' }}>
                    <span>Total Capacity: {seats.length}</span>
                    <span className="text-[8px]">□ Available  ▣ Selected  ■ Occupied</span>
                    <span>Arc Rows: A, B</span>
                </div>

                {/* Corner decorations - hand-drawn style */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-400"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-400"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gray-400"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gray-400"></div>
            </div>
        </div>
    );
}

