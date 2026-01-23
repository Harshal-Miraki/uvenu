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

// Generate a curved theater layout
export function generateTheaterSeats(tierLayout: 'ascending' | 'descending' = 'ascending'): Seat[] {
    const seats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    // Define tier zones by row based on layout
    const tierByRow: Record<string, SeatTier> = tierLayout === 'ascending'
        ? {
            // Ascending: Premium at front
            'A': 'platinum', 'B': 'platinum',
            'C': 'gold', 'D': 'gold', 'E': 'gold',
            'F': 'silver', 'G': 'silver', 'H': 'silver',
            'I': 'bronze', 'J': 'bronze', 'K': 'bronze', 'L': 'bronze'
        }
        : {
            // Descending: Premium at back
            'A': 'bronze', 'B': 'bronze', 'C': 'bronze', 'D': 'bronze',
            'E': 'silver', 'F': 'silver', 'G': 'silver',
            'H': 'gold', 'I': 'gold', 'J': 'gold',
            'K': 'platinum', 'L': 'platinum'
        };

    // Seats per row - curved theater has more seats in back rows
    const seatsPerRow: Record<string, number> = {
        'A': 8, 'B': 10, 'C': 12, 'D': 12, 'E': 14, 'F': 14,
        'G': 16, 'H': 16, 'I': 18, 'J': 18, 'K': 20, 'L': 20
    };

    rows.forEach(row => {
        const seatCount = seatsPerRow[row];
        const tier = tierByRow[row];

        for (let i = 1; i <= seatCount; i++) {
            seats.push({
                id: `${row}-${i}`,
                row,
                number: i,
                section: 'center',
                tier,
                status: Math.random() > 0.88 ? 'sold' : 'available' // 12% sold
            });
        }
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

    return (
        <button
            disabled={isSold}
            onClick={onClick}
            className={cn(
                "w-5 h-5 md:w-6 md:h-6 rounded-md transition-all duration-150 shrink-0",
                isSold && "bg-gray-300 cursor-not-allowed",
                !isSold && !isSelected && "bg-gray-200 hover:bg-gray-300 hover:scale-110 cursor-pointer",
                isSelected && "scale-110 shadow-lg ring-2 ring-white"
            )}
            style={{
                backgroundColor: isSelected ? tier?.color : isSold ? undefined : '#E5E7EB',
            }}
            title={isSold ? 'Sold' : `Row ${seat.row}, Seat ${seat.number} - ${tier?.price} QAR`}
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

// Main SeatMap component
export default function SeatMap({
    seats,
    tierConfig,
    onSeatSelect,
    selectedSeats,
    discountPercentage = 0
}: SeatMapProps) {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    // Group seats by row
    const seatsByRow = useMemo(() => {
        return rows.map(row => seats.filter(s => s.row === row));
    }, [seats]);

    // Get tier boundaries for visual indicator
    const tierBoundaries = [
        { rows: ['A', 'B'], tier: tierConfig.find(t => t.id === 'platinum') },
        { rows: ['C', 'D', 'E'], tier: tierConfig.find(t => t.id === 'gold') },
        { rows: ['F', 'G', 'H'], tier: tierConfig.find(t => t.id === 'silver') },
        { rows: ['I', 'J', 'K', 'L'], tier: tierConfig.find(t => t.id === 'bronze') }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Stage indicator */}
            <div className="relative mb-8">
                <div className="w-2/3 mx-auto py-4 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 rounded-b-[100px] text-center shadow-lg">
                    <span className="text-sm font-bold text-black uppercase tracking-[0.3em]">Stage</span>
                </div>
                {/* Stage glow effect */}
                <div className="absolute inset-x-0 -bottom-4 h-8 bg-gradient-to-b from-gold-200/30 to-transparent rounded-full blur-md" />
            </div>

            {/* Curved seat layout */}
            <div className="relative px-8">
                {/* Tier section backgrounds */}
                {tierBoundaries.map((boundary, idx) => {
                    const startRow = rows.indexOf(boundary.rows[0]);
                    const endRow = rows.indexOf(boundary.rows[boundary.rows.length - 1]);
                    const topOffset = (startRow / rows.length) * 100;
                    const height = ((endRow - startRow + 1) / rows.length) * 100;

                    return (
                        <div
                            key={boundary.tier?.id}
                            className="absolute left-4 right-4 rounded-lg opacity-10 pointer-events-none -z-10"
                            style={{
                                backgroundColor: boundary.tier?.color,
                                top: `${topOffset}%`,
                                height: `${height}%`,
                            }}
                        />
                    );
                })}

                {/* Seat rows */}
                <div className="flex flex-col gap-2">
                    {seatsByRow.map((rowSeats, idx) => {
                        const tier = tierConfig.find(t => t.id === rowSeats[0]?.tier);
                        // Check if this is the first row of a tier zone
                        const isFirstOfTier = idx === 0 ||
                            seatsByRow[idx - 1]?.[0]?.tier !== rowSeats[0]?.tier;

                        return (
                            <div key={rows[idx]}>
                                {/* Tier label */}
                                {isFirstOfTier && tier && (
                                    <div
                                        className="text-center mb-1"
                                        style={{ color: tier.color }}
                                    >
                                        <span className="text-xs font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full"
                                            style={{ backgroundColor: `${tier.color}20` }}
                                        >
                                            {tier.name}
                                        </span>
                                    </div>
                                )}
                                <CurvedRow
                                    rowSeats={rowSeats}
                                    rowIndex={idx}
                                    totalRows={rows.length}
                                    tierConfig={tierConfig}
                                    selectedSeats={selectedSeats}
                                    onSeatSelect={onSeatSelect}
                                    tier={tier}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <SeatLegend tierConfig={tierConfig} discountPercentage={discountPercentage} />
        </div>
    );
}

