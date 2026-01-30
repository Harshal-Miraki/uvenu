"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Seat, SeatTier, TierConfig, TierBoundaries } from '@/types';
import { storage } from '@/lib/storage';

// SVG-based Tier Configuration matching line colors in Uvenue_Seatmap.svg
// Red line: Premium, Purple line: Golden, Blue line: Silver, Teal: Bronze, Black: Normal
export const SVG_TIER_CONFIG: TierConfig[] = [
    { id: 'premium', name: 'Premium', price: 1000, color: '#FF0000' },   // Red
    { id: 'gold', name: 'Golden', price: 800, color: '#800080' },        // Purple
    { id: 'silver', name: 'Silver', price: 600, color: '#0000FF' },      // Blue
    { id: 'bronze', name: 'Bronze', price: 450, color: '#008080' },      // Teal
    { id: 'normal', name: 'Normal', price: 300, color: '#000000' },      // Black
];

// Section boundaries in X coordinates
const LEFT_EDGE = 105;
const LEFT_SECTION_END = 548;
const RIGHT_SECTION_START = 1119;
const RIGHT_EDGE = 1564;

// Tier boundary line definitions from the actual SVG
// Each tier boundary is defined by its Y position at different X positions
// Format: { leftEdge, leftSection, center, rightSection, rightEdge }

// Premium/Gold boundary (Red curved path - approximated as linear for sections)
// path at center Y≈233, at left edge Y≈113, at right edge Y≈106
const PREMIUM_BOUNDARY = {
    leftEdge: 113,      // Y at X=105
    leftSectionEnd: 260, // Y at X=548 (approximated from path curve)
    centerStart: 260,   // Y at X=548
    centerEnd: 260,     // Y at X=1119
    rightSectionStart: 260,
    rightEdge: 106      // Y at X=1564
};

// Gold/Silver boundary (Purple path + horizontal line at Y≈369 center, side lines slope down)
const GOLD_BOUNDARY = {
    leftEdge: 248,      // Y at X=105 (from purple path)
    leftSectionEnd: 390, // Y at X=548
    centerStart: 390,   // Y at X=548
    centerEnd: 390,     // Y at X=1119
    rightSectionStart: 390,
    rightEdge: 242      // Y at X=1564
};

// Silver/Bronze boundary (Blue lines)
// Left: (105,348)→(548,431), Right: (1564,355)→(1119,430), Center vertical ~430-685
const SILVER_BOUNDARY = {
    leftEdge: 348,      // Y at X=105
    leftSectionEnd: 431, // Y at X=548
    centerStart: 540,   // Y at X=548 (center horizontal from purple line at 522 + offset)
    centerEnd: 540,     // Y at X=1119
    rightSectionStart: 430,
    rightEdge: 355      // Y at X=1564
};

// Bronze/Normal boundary (Teal lines)
// Left: (104,609)→(547,692), Right: (1564,610)→(1119,685), Center: Y≈838
const BRONZE_BOUNDARY = {
    leftEdge: 609,      // Y at X=105
    leftSectionEnd: 692, // Y at X=548
    centerStart: 838,   // Y at X=548
    centerEnd: 838,     // Y at X=1119
    rightSectionStart: 685,
    rightEdge: 610      // Y at X=1564
};

// Normal/Bottom boundary (Black lines)
// Center: Y≈1107
const NORMAL_BOUNDARY = {
    leftEdge: 858,
    leftSectionEnd: 942,
    centerStart: 1107,
    centerEnd: 1107,
    rightSectionStart: 937,
    rightEdge: 860
};

// Linear interpolation helper
const lerp = (x: number, x1: number, y1: number, x2: number, y2: number): number => {
    return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
};

// Get the boundary Y value at a specific X position
const getBoundaryAtX = (x: number, boundary: typeof PREMIUM_BOUNDARY): number => {
    if (x <= LEFT_EDGE) {
        return boundary.leftEdge;
    } else if (x < LEFT_SECTION_END) {
        // Left section: interpolate between leftEdge and leftSectionEnd
        return lerp(x, LEFT_EDGE, boundary.leftEdge, LEFT_SECTION_END, boundary.leftSectionEnd);
    } else if (x <= RIGHT_SECTION_START) {
        // Center section: interpolate between centerStart and centerEnd
        return lerp(x, LEFT_SECTION_END, boundary.centerStart, RIGHT_SECTION_START, boundary.centerEnd);
    } else if (x < RIGHT_EDGE) {
        // Right section: interpolate between rightSectionStart and rightEdge
        return lerp(x, RIGHT_SECTION_START, boundary.rightSectionStart, RIGHT_EDGE, boundary.rightEdge);
    } else {
        return boundary.rightEdge;
    }
};

interface SVGSeatMapProps {
    eventId?: string;  // Optional: if provided, loads event-specific boundaries
    tierConfig?: TierConfig[];
    onSeatSelect: (seatId: string, tier: SeatTier) => void;
    selectedSeats: string[];
    soldSeats?: string[];
    discountPercentage?: number;
}

// Get tier color
const getTierColor = (tier: SeatTier, tierConfig: TierConfig[]): string => {
    const config = tierConfig.find(t => t.id === tier);
    return config?.color || '#D9D9D9';
};

export default function SVGSeatMap({
    eventId,
    tierConfig = SVG_TIER_CONFIG,
    onSeatSelect,
    selectedSeats,
    soldSeats = [],
    discountPercentage = 0
}: SVGSeatMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

    // Define seat tier based on actual SVG boundary lines
    // This calculates the boundary Y position at the seat's X position
    const getSeatTier = (rectElement: SVGRectElement): SeatTier => {
        const x = parseFloat(rectElement.getAttribute('x') || '0');
        const y = parseFloat(rectElement.getAttribute('y') || '0');

        // Get the boundary Y values at this X position
        const premiumBoundary = getBoundaryAtX(x, PREMIUM_BOUNDARY);
        const goldBoundary = getBoundaryAtX(x, GOLD_BOUNDARY);
        const silverBoundary = getBoundaryAtX(x, SILVER_BOUNDARY);
        const bronzeBoundary = getBoundaryAtX(x, BRONZE_BOUNDARY);

        // Determine tier based on Y position relative to boundaries
        if (y < premiumBoundary) return 'premium';
        if (y < goldBoundary) return 'gold';
        if (y < silverBoundary) return 'silver';
        if (y < bronzeBoundary) return 'bronze';
        return 'normal';
    };

    // Load the SVG file
    useEffect(() => {
        fetch('/Uvenue_Seatmap.svg')
            .then(response => response.text())
            .then(text => {
                setSvgContent(text);
            })
            .catch(err => console.error('Failed to load SVG:', err));
    }, []);

    // Process the SVG after loading
    useEffect(() => {
        if (!svgContent || !containerRef.current) return;

        const container = containerRef.current;
        container.innerHTML = svgContent;

        const svg = container.querySelector('svg');
        if (!svg) return;

        // Make SVG responsive
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', 'auto');
        svg.style.maxWidth = '100%';

        // Find all rect elements (seats)
        const rects = svg.querySelectorAll('rect[rx="4"]');

        rects.forEach((rect, index) => {
            const rectEl = rect as SVGRectElement;
            const seatId = rectEl.getAttribute('id') || `seat-${index}`;
            const tier = getSeatTier(rectEl);
            const isSold = soldSeats.includes(seatId);
            const isSelected = selectedSeats.includes(seatId);

            // Store original fill for reset
            const originalFill = rectEl.getAttribute('fill') || '#D9D9D9';

            // Get the tier color for this seat
            const tierColor = getTierColor(tier, tierConfig);

            // Apply tier-based styling
            // Seats are colored by their tier by default
            // Selected seats turn gray to indicate reservation
            // Sold seats are also gray but with reduced opacity
            if (isSold) {
                rectEl.setAttribute('fill', '#9CA3AF');
                rectEl.style.cursor = 'not-allowed';
                rectEl.style.opacity = '0.5';
            } else if (isSelected) {
                // Selected/reserved seats turn gray
                rectEl.setAttribute('fill', '#9CA3AF');
                rectEl.style.cursor = 'pointer';
                rectEl.setAttribute('stroke', '#6B7280');
                rectEl.setAttribute('stroke-width', '2');
                rectEl.style.opacity = '0.8';
            } else {
                // Show tier color by default
                rectEl.setAttribute('fill', tierColor);
                rectEl.style.cursor = 'pointer';
                rectEl.style.opacity = '1';
            }

            // Add interactivity
            rectEl.style.transition = 'all 0.15s ease';

            // Mouse events
            rectEl.onmouseenter = () => {
                if (!isSold && !isSelected) {
                    // On hover, make the seat brighter/highlighted
                    rectEl.setAttribute('fill', tierColor);
                    rectEl.setAttribute('stroke', '#FFFFFF');
                    rectEl.setAttribute('stroke-width', '2');
                    rectEl.style.filter = 'brightness(1.2)';
                }
                setHoveredSeat(seatId);
            };

            rectEl.onmouseleave = () => {
                if (!isSold && !isSelected) {
                    // Return to tier color
                    rectEl.setAttribute('fill', tierColor);
                    rectEl.removeAttribute('stroke');
                    rectEl.removeAttribute('stroke-width');
                    rectEl.style.filter = 'none';
                }
                setHoveredSeat(null);
            };

            rectEl.onclick = () => {
                if (!isSold) {
                    onSeatSelect(seatId, tier);
                }
            };
        });

        // Add legend below the SVG
        const legendContainer = document.createElement('div');
        legendContainer.className = 'svg-seatmap-legend';
        legendContainer.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; margin-top: 24px; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${tierConfig.map(tier => {
            const discountedPrice = discountPercentage > 0
                ? Math.round(tier.price * (1 - discountPercentage / 100))
                : tier.price;
            return `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 20px; height: 20px; background: ${tier.color}; border-radius: 4px;"></div>
                            <span style="font-size: 14px; font-weight: 600; color: #1F2937;">${tier.name}</span>
                            <span style="font-size: 14px; color: #6B7280;">(${discountedPrice} QAR)</span>
                        </div>
                    `;
        }).join('')}
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #9CA3AF; border-radius: 4px; opacity: 0.5;"></div>
                    <span style="font-size: 14px; color: #6B7280;">Sold</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #9CA3AF; border-radius: 4px; opacity: 0.8;"></div>
                    <span style="font-size: 14px; color: #6B7280;">Reserved</span>
                </div>
            </div>
        `;

        // Remove existing legend if any
        const existingLegend = container.querySelector('.svg-seatmap-legend');
        if (existingLegend) existingLegend.remove();
        container.appendChild(legendContainer);

    }, [svgContent, selectedSeats, soldSeats, hoveredSeat, tierConfig, discountPercentage, onSeatSelect]);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h2 className="text-center text-lg font-bold text-gray-800 mb-4">
                    Select Your Seats
                </h2>
                <div
                    ref={containerRef}
                    className="svg-seatmap-container"
                    style={{
                        minHeight: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                />
            </div>
        </div>
    );
}
