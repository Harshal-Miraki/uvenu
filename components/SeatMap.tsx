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

// Individual seat component
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

    // Calculate background color based on state
    const getBackgroundColor = () => {
        if (isSold) return '#9CA3AF'; // Gray for sold
        if (isSelected) return tier?.color || '#3B82F6'; // Full tier color when selected
        // Show lighter version of tier color for available seats
        return tier?.color ? `${tier.color}40` : '#E5E7EB'; // 40 = 25% opacity hex
    };

    // Border color for better visibility
    const getBorderColor = () => {
        if (isSold) return '#6B7280';
        return tier?.color || '#9CA3AF';
    };

    return (
        <button
            disabled={isSold}
            onClick={onClick}
            className={cn(
                "w-5 h-5 md:w-6 md:h-6 rounded-md transition-all duration-150 shrink-0 border-2",
                isSold && "cursor-not-allowed opacity-60",
                !isSold && !isSelected && "hover:scale-110 hover:shadow-md cursor-pointer",
                isSelected && "scale-110 shadow-lg ring-2 ring-white ring-offset-1"
            )}
            style={{
                backgroundColor: getBackgroundColor(),
                borderColor: getBorderColor(),
            }}
            title={isSold ? 'Sold' : `Row ${seat.row}, Seat ${seat.number} - ${tier?.name} - ${tier?.price} QAR`}
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

    // Section component with curved rows
    const SectionBlock = ({
        sectionId,
        sectionSeats
    }: {
        sectionId: 'left' | 'center' | 'right';
        sectionSeats: Record<string, Seat[]>;
    }) => {
        const sectionLabel = sectionId === 'left' ? 'Left' : sectionId === 'center' ? 'Center' : 'Right';

        return (
            <div className="flex flex-col gap-[2px]">
                {rows.map((row, rowIndex) => {
                    const rowSeats = sectionSeats[row] || [];
                    const tier = getTierForRow(rowIndex);
                    const isPremiumRow = rowIndex < 2; // First 2 rows are premium
                    const isLastPremiumRow = rowIndex === 1; // Row B is the last premium row

                    return (
                        <div key={`${sectionId}-${row}`}>
                            {/* Seat row */}
                            <div className="flex justify-center gap-[2px]">
                                {rowSeats.map(seat => (
                                    <SeatButton
                                        key={seat.id}
                                        seat={seat}
                                        tierConfig={tierConfig}
                                        isSelected={selectedSeats.some(s => s.id === seat.id)}
                                        onClick={() => onSeatSelect(seat)}
                                    />
                                ))}
                            </div>

                            {/* Gap and horizontal line after premium rows (after row B) */}
                            {isLastPremiumRow && (
                                <div className="mt-3 mb-2">
                                    <div className="h-[1px] bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-60" />
                                    <div className="text-center mt-1">
                                        <span className="text-[9px] uppercase tracking-widest text-red-400 font-semibold">
                                            Premium Section
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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
        <div className="w-full max-w-6xl mx-auto">
            {/* Stage indicator */}
            <div className="relative mb-6">
                <div className="w-1/2 mx-auto py-3 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 rounded-b-[80px] text-center shadow-lg">
                    <span className="text-xs font-bold text-black uppercase tracking-[0.3em]">Stage</span>
                </div>
                <div className="absolute inset-x-0 -bottom-3 h-6 bg-gradient-to-b from-gold-200/30 to-transparent rounded-full blur-md" />
            </div>

            {/* 3-Section Layout */}
            <div className="relative bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-lg overflow-x-auto">
                {/* Tier zone color backgrounds */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    {tierZones.map((zone, idx) => {
                        const startRow = rows.indexOf(zone.rows[0]);
                        const endRow = rows.indexOf(zone.rows[zone.rows.length - 1]);
                        const topPercent = (startRow / 16) * 100;
                        const heightPercent = ((endRow - startRow + 1) / 16) * 100;

                        return (
                            <div
                                key={zone.tier?.id || idx}
                                className="absolute left-0 right-0"
                                style={{
                                    backgroundColor: zone.tier?.color,
                                    opacity: 0.08,
                                    top: `${topPercent}%`,
                                    height: `${heightPercent}%`,
                                }}
                            />
                        );
                    })}
                </div>

                {/* 3 Sections side by side */}
                <div className="flex justify-center gap-6 relative z-10">
                    {/* Left Section */}
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Left</span>
                        <div className="relative p-2 rounded-xl" style={{
                            background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(59,130,246,0.05) 100%)',
                            border: '1px solid rgba(6,182,212,0.2)'
                        }}>
                            <SectionBlock sectionId="left" sectionSeats={seatsBySection.left} />
                        </div>
                    </div>

                    {/* Center Section */}
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Center</span>
                        <div className="relative p-2 rounded-xl" style={{
                            background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(239,68,68,0.05) 100%)',
                            border: '1px solid rgba(168,85,247,0.2)'
                        }}>
                            <SectionBlock sectionId="center" sectionSeats={seatsBySection.center} />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Right</span>
                        <div className="relative p-2 rounded-xl" style={{
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(6,182,212,0.05) 100%)',
                            border: '1px solid rgba(6,182,212,0.2)'
                        }}>
                            <SectionBlock sectionId="right" sectionSeats={seatsBySection.right} />
                        </div>
                    </div>
                </div>

                {/* Row labels on the right */}
                <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center py-12">
                    {rows.map((row, idx) => (
                        <div
                            key={row}
                            className="text-[10px] font-bold text-gray-400 h-[22px] flex items-center"
                        >
                            {row}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <SeatLegend tierConfig={tierConfig} discountPercentage={discountPercentage} />
        </div>
    );
}

