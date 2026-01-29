"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Seat, SeatTier, TierConfig } from '@/types';

// SVG-based Tier Configuration matching line colors in Uvenue_Seatmap.svg
// Red line: Premium, Purple line: Golden, Blue line: Silver, Teal: Bronze, Black: Normal
export const SVG_TIER_CONFIG: TierConfig[] = [
    { id: 'premium', name: 'Premium', price: 1000, color: '#FF0000' },   // Red
    { id: 'gold', name: 'Golden', price: 800, color: '#800080' },        // Purple
    { id: 'silver', name: 'Silver', price: 600, color: '#0000FF' },      // Blue
    { id: 'bronze', name: 'Bronze', price: 450, color: '#008080' },      // Teal
    { id: 'normal', name: 'Normal', price: 300, color: '#000000' },      // Black
];

interface SVGSeatMapProps {
    tierConfig?: TierConfig[];
    onSeatSelect: (seatId: string, tier: SeatTier) => void;
    selectedSeats: string[];
    soldSeats?: string[];
    discountPercentage?: number;
}

// Define seat zones based on SVG Y coordinates
// We analyze the SVG structure to determine which seats belong to which tier
const getSeatTier = (rectElement: SVGRectElement): SeatTier => {
    const y = parseFloat(rectElement.getAttribute('y') || '0');
    const x = parseFloat(rectElement.getAttribute('x') || '0');

    // Based on SVG analysis:
    // Premium (Red line): y < 300 (first curved rows near stage)
    // Golden (Purple line): 300 <= y < 450
    // Silver (Blue line): 450 <= y < 700
    // Bronze (Teal line): 700 <= y < 1100
    // Normal (Black line): y >= 1100

    if (y < 300) return 'premium';
    if (y < 450) return 'gold';
    if (y < 700) return 'silver';
    if (y < 1100) return 'bronze';
    return 'normal';
};

// Get tier color
const getTierColor = (tier: SeatTier, tierConfig: TierConfig[]): string => {
    const config = tierConfig.find(t => t.id === tier);
    return config?.color || '#D9D9D9';
};

export default function SVGSeatMap({
    tierConfig = SVG_TIER_CONFIG,
    onSeatSelect,
    selectedSeats,
    soldSeats = [],
    discountPercentage = 0
}: SVGSeatMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

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

            // Apply tier-based styling
            if (isSold) {
                rectEl.setAttribute('fill', '#9CA3AF');
                rectEl.style.cursor = 'not-allowed';
                rectEl.style.opacity = '0.5';
            } else if (isSelected) {
                rectEl.setAttribute('fill', '#3B82F6');
                rectEl.style.cursor = 'pointer';
                rectEl.setAttribute('stroke', '#1D4ED8');
                rectEl.setAttribute('stroke-width', '2');
            } else {
                // Show tier color on hover, otherwise show default
                rectEl.setAttribute('fill', hoveredSeat === seatId ? getTierColor(tier, tierConfig) : '#D9D9D9');
                rectEl.style.cursor = 'pointer';
            }

            // Add interactivity
            rectEl.style.transition = 'all 0.15s ease';

            // Mouse events
            rectEl.onmouseenter = () => {
                if (!isSold && !isSelected) {
                    rectEl.setAttribute('fill', getTierColor(tier, tierConfig));
                    rectEl.setAttribute('stroke', '#374151');
                    rectEl.setAttribute('stroke-width', '1.5');
                }
                setHoveredSeat(seatId);
            };

            rectEl.onmouseleave = () => {
                if (!isSold && !isSelected) {
                    rectEl.setAttribute('fill', '#D9D9D9');
                    rectEl.removeAttribute('stroke');
                    rectEl.removeAttribute('stroke-width');
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
                    <div style="width: 20px; height: 20px; background: #3B82F6; border-radius: 4px;"></div>
                    <span style="font-size: 14px; color: #6B7280;">Selected</span>
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
